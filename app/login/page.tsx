"use client";

import Link from "next/link";

import { useState } from "react";

import {
  loginUser,
  resetPassword,
} from "@/lib/firebase/auth";

export default function LoginPage() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = async () => {

    try {

      // Validate empty fields
      if (!email || !password) {

        alert(
          "Please fill all fields"
        );

        return;
      }

      // Firebase login
      await loginUser(
        email,
        password
      );

      window.location.href = "/";
    } catch (error: unknown) {

      console.error(error);

      const firebaseError =
        error as {
          code?: string;
        };

      // Firebase invalid login
      if (
        firebaseError.code ===
        "auth/invalid-credential"
      ) {

        alert(
          "Invalid email or password"
        );

        return;
      }

      alert("Login failed");
    }
  };

  const handleForgotPassword =
  async () => {

    try {

      if (!email) {

        alert(
          "Please enter your email"
        );

        return;
      }

      await resetPassword(email);

      alert(
        "Password reset email sent"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Failed to send reset email"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="w-[400px] border p-8 rounded-xl shadow">

        <h1 className="text-3xl font-bold mb-6">
          Login
        </h1>

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

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-3 rounded"
        >
          Login
        </button>

        <button
          onClick={handleForgotPassword}
          className="w-full mt-3 border p-3 rounded"
        >
          Forgot Password
        </button>

        <p className="mt-4 text-sm">

          No account?{" "}

          <Link
            href="/register"
            className="text-blue-500"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}