"use client";

import Link from "next/link";

export default function Navbar() {

  const isLoggedIn = false;

  return (
    <nav className="w-full border-b px-8 py-4 flex justify-between items-center">
      <Link
        href="/"
        className="text-2xl font-bold"
      >
        SecureShop
      </Link>

      <div className="flex gap-4 items-center">
        <Link href="/">
          Home
        </Link>

        <Link href="/products">
          Products
        </Link>

        {isLoggedIn ? (
          <>
            <Link href="/profile">
              Profile
            </Link>

            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">
              Login
            </Link>

            <Link
              href="/register"
              className="bg-black text-white px-4 py-2 rounded"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}