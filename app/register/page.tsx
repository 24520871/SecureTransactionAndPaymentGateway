"use client";

import { useState } from "react";

import {
  generateKeyPair,
  exportPublicKey,
} from "@/lib/crypto/keygen";

import {
  savePrivateKey,
} from "@/lib/storage/indexeddb";

export default function RegisterPage() {

  const [email, setEmail] = useState("");

  const handleRegister = async () => {

    try {

      // 1. Generate keypair
      const keyPair = await generateKeyPair();

      // 2. Save private key locally
      await savePrivateKey(
        keyPair.privateKey
      );

      // 3. Export public key
      const publicKey = await exportPublicKey(
        keyPair.publicKey
      );

      // 4. Send to backend
      const res = await fetch(
        "/api/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            publicKey,
          }),
        }
      );

      const data = await res.json();

      console.log(data);

      if (!res.ok) {
        alert(data.error || "Register failed");
        return;
      }

      alert("Register success");

    } catch (error) {

      console.error(error);

      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="w-[400px] border p-8 rounded-xl shadow">

        <h1 className="text-3xl font-bold mb-6">
          Register
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-3 rounded mb-4"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-black text-white p-3 rounded"
        >
          Register
        </button>

      </div>
    </div>
  );
}