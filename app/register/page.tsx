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

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const handleRegister = async () => {

    try {

      // Validate empty fields
      if (
        !username ||
        !email ||
        !password ||
        !confirmPassword
      ) {
        alert("Please fill all fields");
        return;
      }

      // Validate password match
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Validate password length
      if (password.length < 6) {
        alert(
          "Password must be at least 6 characters"
        );
        return;
      }

      // 1. Generate keypair
      const keyPair =
        await generateKeyPair();

      // 2. Save private key locally
      await savePrivateKey(
        keyPair.privateKey
      );

      // 3. Export public key
      const publicKey =
        await exportPublicKey(
          keyPair.publicKey
        );

      // 4. Send to backend
      const res = await fetch(
        "/api/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username,
            email,
            password,
            publicKey,
          }),
        }
      );

      const data = await res.json();

      console.log(data);

      if (!res.ok) {
        alert(
          data.error ||
          "Register failed"
        );
        return;
      }

      alert("Register success");

    } catch (error) {

      console.error(error);

      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="w-[400px] bg-white border p-8 rounded-xl shadow">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Register
        </h1>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          className="w-full border p-3 rounded mb-4"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-3 rounded mb-4"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-3 rounded mb-4"
        />

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
          className="w-full border p-3 rounded mb-6"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 transition"
        >
          Register
        </button>

      </div>
    </div>
  );
}