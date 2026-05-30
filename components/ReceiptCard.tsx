import { ReceiptPayload } from "@/lib/crypto/jws";

type Props = {
  receipt: ReceiptPayload;
};

export default function ReceiptCard({ receipt }: Props) {
  return (
    <div className="border rounded-xl p-6 shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">
        Payment Receipt
      </h2>

      <p>Transaction: {receipt.transactionId}</p>
      <p>Order: {receipt.orderId}</p>
      <p>Amount: ${receipt.amount}</p>
      <p>Status: {receipt.status}</p>
      <p>Date: {receipt.createdAt}</p>

      <div className="mt-4 text-green-600 font-semibold">
        ✔ Verified by JWS
      </div>
    </div>
  );
}