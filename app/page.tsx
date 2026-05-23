import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* HERO */}
      <section className="px-10 py-24 text-center">

        <h1 className="text-6xl font-bold">
          Secure Payment Demo
        </h1>

        <p className="mt-6 text-gray-600 text-xl max-w-2xl mx-auto">
          E-commerce demo with JWT authentication,
          IndexedDB key storage, digital signatures,
          and Stripe sandbox payment integration.
        </p>

        <div className="mt-10 flex justify-center gap-4">

          <Link
            href="/products"
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Browse Products
          </Link>

          <Link
            href="/register"
            className="border px-6 py-3 rounded-xl"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-3 gap-6 px-10 pb-20">

        <div className="border rounded-2xl p-6">
          <h2 className="text-2xl font-semibold">
            JWT Authentication
          </h2>

          <p className="mt-3 text-gray-600">
            Secure login system using PostgreSQL,
            hashed passwords, and JWT tokens.
          </p>
        </div>

        <div className="border rounded-2xl p-6">
          <h2 className="text-2xl font-semibold">
            Client-side Cryptography
          </h2>

          <p className="mt-3 text-gray-600">
            Private keys stored locally in IndexedDB
            for transaction signing.
          </p>
        </div>

        <div className="border rounded-2xl p-6">
          <h2 className="text-2xl font-semibold">
            Secure Checkout
          </h2>

          <p className="mt-3 text-gray-600">
            Stripe sandbox integration with digital
            signature verification.
          </p>
        </div>

      </section>
    </div>
  );
}