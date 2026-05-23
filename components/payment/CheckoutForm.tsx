"use client";

import StripeCardForm from "./StripeCardForm";

interface Props {
  productName: string;
  amount: number;
}

export default function CheckoutForm({
  productName,
  amount,
}: Props) {

  const handlePay = async () => {
    alert("Payment flow here");
  };

  return (
    <div className="max-w-xl border p-8 rounded-xl">
      <h1 className="text-3xl font-bold mb-4">
        Checkout
      </h1>

      <p>{productName}</p>

      <p className="mb-6">${amount}</p>

      <StripeCardForm />

      <button
        onClick={handlePay}
        className="mt-6 bg-black text-white px-6 py-3 rounded"
      >
        Pay
      </button>
    </div>
  );
}