"use client";

import { useEffect } from "react";

type Receipt = {
  transactionId: string;
  orderId: string;
  amount: number;
  status: string;
  createdAt?: string;
};

export default function ReceiptModal({
  receipt,
  onClose,
}: {
  receipt: Receipt;
  onClose: () => void;
}) {
  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-[420px] rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold text-green-600">
            ✔ Payment Successful
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Secure Transaction Receipt
          </p>
        </div>

        {/* BODY */}
        <div className="mt-5 space-y-3 text-sm">
          <Row label="Transaction ID" value={receipt.transactionId} mono />
          <Row label="Order ID" value={receipt.orderId} mono />

          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold text-black">
              {formatMoney(receipt.amount)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="text-green-600 font-semibold">
              {receipt.status}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span>
              {receipt.createdAt
                ? new Date(receipt.createdAt).toLocaleString()
                : "Just now"}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-black text-white hover:bg-gray-800"
          >
            Close
          </button>

          <button
            onClick={() => window.print()}
            className="w-full py-2 rounded-lg border hover:bg-gray-100"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

// nhỏ gọn hơn UI row
function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={mono ? "font-mono" : ""}>{value}</span>
    </div>
  );
}