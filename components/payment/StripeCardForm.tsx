"use client";

import { CardElement } from "@stripe/react-stripe-js";

export default function StripeCardForm() {
  return (
    <div className="border p-4 rounded">
      <CardElement />
    </div>
  );
}