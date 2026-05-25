"use client";

import Link from "next/link";

import {
  auth
} from "@/lib/firebase";

import {
  logoutUser
} from "@/lib/firebase/auth";

import {
  useEffect,
  useState
} from "react";

export default function Navbar() {

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  useEffect(() => {

    const unsubscribe =
      auth.onAuthStateChanged(
        (user) => {

          setIsLoggedIn(!!user);
        }
      );

    return () => unsubscribe();

  }, []);

  const handleLogout =
    async () => {

      try {

        await logoutUser();

        alert(
          "Logout success"
        );

        window.location.href = "/";

      } catch (error) {

        console.error(error);

        alert(
          "Logout failed"
        );
      }
    };

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

        {!isLoggedIn ? (

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

        ) : (

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>

        )}

      </div>

    </nav>
  );
}