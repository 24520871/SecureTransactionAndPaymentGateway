export async function signMessage(
  privateKey: CryptoKey,
  message: string
) {

  const encoder =
    new TextEncoder();

  const data =
    encoder.encode(message);

  const signature =
    await window.crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: "SHA-256",
      },
      privateKey,
      data
    );

  return arrayBufferToBase64(
    signature
  );
}

function arrayBufferToBase64(
  buffer: ArrayBuffer
) {

  let binary = "";

  const bytes =
    new Uint8Array(buffer);

  for (const b of bytes) {

    binary +=
      String.fromCharCode(b);
  }

  return window.btoa(binary);
}