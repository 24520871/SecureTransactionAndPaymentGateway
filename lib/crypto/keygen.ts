export async function generateKeyPair() {

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );

  return keyPair;
}

export async function exportPublicKey(
  publicKey: CryptoKey
) {

  const exported = await window.crypto.subtle.exportKey(
    "spki",
    publicKey
  );

  return arrayBufferToBase64(exported);
}

function arrayBufferToBase64(
  buffer: ArrayBuffer
) {

  let binary = "";

  const bytes = new Uint8Array(buffer);

  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }

  return window.btoa(binary);
}