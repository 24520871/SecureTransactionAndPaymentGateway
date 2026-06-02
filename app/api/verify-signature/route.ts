import { NextResponse } from "next/server";

import { signJWS }
from "@/lib/crypto/jws";

import { pool }
from "@/lib/storage/postgresqldb";

import { redis }
from "@/lib/redis";

// ========================
// HELPERS (WEBCRYPTO SAFE)
// ========================
function base64ToArrayBuffer(
  base64: string
): ArrayBuffer {

  const binary =
    Buffer.from(
      base64,
      "base64"
    );

  return binary.buffer.slice(
    binary.byteOffset,

    binary.byteOffset +
      binary.byteLength
  );
}

// ========================
// IMPORT PUBLIC KEY
// ========================
async function importPublicKey(
  publicKeyBase64: string
) {

  const keyBuffer =
    base64ToArrayBuffer(
      publicKeyBase64
    );

  return crypto.subtle.importKey(
    "spki",

    keyBuffer,

    {
      name: "ECDSA",
      namedCurve: "P-256",
    },

    false,

    ["verify"]
  );
}

// ========================
// MAIN API
// ========================
export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const {
      orderId,
      email,
      challenge,
      signature,
    } = body;

    // ========================
    // INPUT VALIDATION
    // ========================
    if (
      !orderId ||
      !email ||
      !challenge ||
      !signature
    ) {

      return NextResponse.json(
        {
          error:
            "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "INPUT OK:",
      {
        orderId,
        email,
        challenge,
        signatureLength:
          signature.length,
      }
    );

    // ========================
    // VERIFY STORED CHALLENGE
    // ========================
    const storedChallenge =
      await redis.get(
        `challenge:${orderId}`
      );

    if (!storedChallenge) {

      return NextResponse.json(
        {
          error:
            "Challenge expired",
        },
        {
          status: 400,
        }
      );
    }

    if (
      storedChallenge !==
      challenge
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid challenge",
        },
        {
          status: 401,
        }
      );
    }

    // ========================
    // LOAD PENDING TRANSACTION
    // ========================
    const pendingTransaction =
      await redis.get(
        `pending:${orderId}`
      );

    if (!pendingTransaction) {

      return NextResponse.json(
        {
          error:
            "Pending transaction expired",
        },
        {
          status: 400,
        }
      );
    }

    const transactionData = typeof pendingTransaction === "string" ? JSON.parse( pendingTransaction ) : pendingTransaction;

    const {
      amount,
      paymentToken,
      userId,
    } = transactionData;

    // ========================
    // GET PUBLIC KEY
    // ========================
    const userResult =
      await pool.query(
        `
        SELECT public_key
        FROM users
        WHERE email = $1
        `,
        [email]
      );

    if (
      userResult.rows.length === 0
    ) {

      return NextResponse.json(
        {
          error:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const publicKeyBase64 =
      userResult.rows[0]
        .public_key;

    if (!publicKeyBase64) {

      return NextResponse.json(
        {
          error:
            "Public key not found",
        },
        {
          status: 400,
        }
      );
    }

    // ========================
    // IMPORT PUBLIC KEY
    // ========================
    let publicKey:
      CryptoKey;

    try {

      publicKey =
        await importPublicKey(
          publicKeyBase64
        );

    } catch (
      error: unknown
    ) {

      console.error(
        "PUBLIC KEY ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Invalid public key format",
        },
        {
          status: 400,
        }
      );
    }

    // ========================
    // VERIFY SIGNATURE
    // ========================
    const encoder =
      new TextEncoder();

    const challengeData =
      encoder.encode(
        challenge
      );

    const signatureData =
      base64ToArrayBuffer(
        signature
      );

    let verified = false;

    try {

      verified =
        await crypto.subtle.verify(
          {
            name: "ECDSA",
            hash: "SHA-256",
          },

          publicKey,

          signatureData,

          challengeData
        );

    } catch (
      error: unknown
    ) {

      console.error(
        "VERIFY ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Signature verification failed",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "VERIFIED:",
      verified
    );

    // ========================
    // STOP IF FAIL
    // ========================
    if (!verified) {

      return NextResponse.json({
        verified: false,
        payment: null,
      });
    }

    // ========================
    // MOCK PSP
    // ========================
    console.log(
      "▶ PSP processing token:",
      paymentToken
    );

    const pspResponse = {
      success: true,

      transactionId:
        `TXN_${Date.now()}`,

      token:
        paymentToken,

      amount,

      currency: "usd",

      status: "PAID",
    };

    console.log(
      "✔ PSP RESPONSE:",
      pspResponse
    );

    // ========================
    // RECEIPT + JWS
    // ========================
    const transactionId =
      pspResponse.transactionId;

    const receiptPayload = {
      transactionId,

      email,

      userId,

      orderId,

      amount:
        pspResponse.amount,

      currency:
        pspResponse.currency,

      status:
        pspResponse.status,

      createdAt:
        new Date()
          .toISOString(),
    };

    // SIGN JWS
    const secret =
      process.env
        .JWS_SECRET ||
      "dev_secret";

    const receiptJWS =
      signJWS(
        receiptPayload,
        secret
      );

    // SAVE DB
    await pool.query(
      `
      INSERT INTO transactions
      (
        email,
        order_id,
        amount,
        currency,
        status,
        transaction_id,
        receipt_jws
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        email,

        receiptPayload.orderId,

        receiptPayload.amount,

        receiptPayload.currency,

        receiptPayload.status,

        transactionId,

        receiptJWS,
      ]
    );

    // ========================
    // CLEANUP REDIS
    // ========================
    await redis.del(
      `challenge:${orderId}`
    );

    await redis.del(
      `pending:${orderId}`
    );

    // ========================
    // FINAL RESPONSE
    // ========================
    return NextResponse.json({
      success: true,

      verified: true,

      payment:
        pspResponse,

      receipt:
        receiptPayload,

      jws:
        receiptJWS,
    });

  } catch (
    error: unknown
  ) {

    console.error(
      "FATAL ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
