import crypto from "crypto";

// ========================
// TYPE RECEIPT PAYLOAD
// ========================
export type ReceiptPayload = {
  transactionId: string;
  email: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

// ========================
// SIGN JWS (HMAC SHA256)
// ========================
export function signJWS(
  payload: ReceiptPayload,
  secret: string
): string {
  const header = Buffer.from(
    JSON.stringify({
      alg: "HS256",
      typ: "JWS",
    })
  ).toString("base64url");

  const body = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const data = `${header}.${body}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

// ========================
// VERIFY JWS
// ========================
export function verifyJWS(
  token: string,
  secret: string
): ReceiptPayload {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWS format");
  }

  const [header, payload, signature] = parts;

  const data = `${header}.${payload}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  if (expectedSignature !== signature) {
    throw new Error("Invalid signature");
  }

  const decoded = JSON.parse(
    Buffer.from(payload, "base64url").toString()
  );

  return decoded as ReceiptPayload;
}