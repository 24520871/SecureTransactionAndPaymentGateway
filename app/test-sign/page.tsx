"use client";

import { getPrivateKey } from "@/lib/storage/indexeddb";
import { signMessage } from "@/lib/crypto/sign";

export default function TestSignPage() {

  const testSign = async () => {

    const email = prompt(
      "Enter registered email"
    );

    if (!email) return;

    const privateKey =
      await getPrivateKey(email);

    if (!privateKey) {

      alert("Private key not found");

      return;
    }

    const challenge =
      "payment_123|500000";

    const signature =
      await signMessage(
        privateKey,
        challenge
      );

            const res = await fetch(
        "/api/verify-signature",
        {
            method: "POST",

            headers: {
            "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
            email,
            challenge,
            signature,
            }),
        }
        );

        const data =
        await res.json();

        console.log(data);

    console.log(
      "SIGNATURE:",
      signature
    );

    alert(
      "Signature generated!"
    );
  };

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Test Digital Signature
      </h1>

      <button
        onClick={testSign}
        className="bg-blue-500 text-white px-6 py-3 rounded"
      >
        Sign Challenge
      </button>

    </div>
  );
}