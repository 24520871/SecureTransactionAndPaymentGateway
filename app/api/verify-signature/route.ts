import { NextResponse } from "next/server";

import { pool } from "@/lib/storage/postgresqldb";

function base64ToArrayBuffer(
  base64: string
) {

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

function signatureToArrayBuffer(
  signature: string
) {

  return base64ToArrayBuffer(
    signature
  );
}

async function importPublicKey(
  publicKeyBase64: string
) {

  const keyData =
    base64ToArrayBuffer(
      publicKeyBase64
    );

  return crypto.subtle.importKey(
    "spki",
    keyData,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["verify"]
  );
}

export async function POST(
  req: Request
) {

  try {

    const {
      email,
      challenge,
      signature,
    } = await req.json();

    const result =
      await pool.query(
        `
        SELECT public_key
        FROM users
        WHERE email = $1
        `,
        [email]
      );

    if (
      result.rows.length === 0
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

    const publicKey =
      result.rows[0].public_key;

    const cryptoKey =
      await importPublicKey(
        publicKey
      );

      const encoder =
  new TextEncoder();

const challengeData =
  encoder.encode(
    challenge
  );

const signatureData =
  signatureToArrayBuffer(
    signature
  );

const verified =
  await crypto.subtle.verify(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    cryptoKey,
    signatureData,
    challengeData
  );

console.log(
  "VERIFIED:",
  verified
);

    console.log(
      "IMPORTED KEY:",
      cryptoKey
    );

    console.log(
      "PUBLIC KEY:",
      publicKey
    );

    console.log(
      "CHALLENGE:",
      challenge
    );

    console.log(
      "SIGNATURE:",
      signature
    );

    return NextResponse.json({
      verified,
    });

  } catch (error) {

    console.error(
      "VERIFY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}