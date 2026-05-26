// lib/crypto/hmac.ts
export async function generateHMAC(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  // Import chuỗi secret thành CryptoKey sử dụng thuật toán HMAC-SHA256
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );

  // Tiến hành ký lên dữ liệu
  const signatureBuffer = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );

  // Chuyển đổi ArrayBuffer kết quả sang chuỗi Base64 hoặc Hex để gửi đi
  return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
}