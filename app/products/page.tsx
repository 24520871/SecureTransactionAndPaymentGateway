"use client";

import Link from "next/link";
import { products } from "@/lib/products";

export default function ProductsPage() {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8">
        Products
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-xl p-4"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-48 w-full object-cover rounded"
            />

            <h2 className="mt-4 text-xl font-semibold">
              {product.name}
            </h2>

            <p>${product.price}</p>

            <Link
              href={`/checkout?id=${product.id}`}
              className="inline-block mt-4 bg-black text-white px-4 py-2 rounded"
            >
              Buy
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}