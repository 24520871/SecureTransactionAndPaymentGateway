"use client";

import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { generateHMAC } from "@/lib/crypto/hmac";

import { getPrivateKey } from "@/lib/storage/indexeddb";
import { signMessage } from "@/lib/crypto/sign";

import ReceiptModal from "@/components/ReceiptModal";
import { ReceiptPayload } from "@/lib/crypto/jws";

interface Props {
  productName?: string; // Chuyển sang optional để tránh crash nếu dữ liệu chưa load kịp
  amount?: number;      // Chuyển sang optional
}

export default function CheckoutForm({ productName, amount }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  // 👉 FIX: dùng đúng type luôn, KHÔNG any
  const [receipt, setReceipt] = useState<ReceiptPayload | null>(null);

  // ĐẢM BẢO DỮ LIỆU LUÔN CÓ (Nếu trang chính truyền rỗng thì tự lấy sản phẩm 1 làm mẫu để test)
  const displayProductName = productName || "Gaming Mouse";
  const displayAmount = amount && amount > 0 ? amount : 49;

  const handlePay = async () => {
    if (!stripe || !elements) {
      alert("Stripe SDK chưa sẵn sàng. Vui lòng thử lại!");
      return;
    }

    setLoading(true);

    try {
      // 1. Lấy mã Token từ Hosted Fields
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        alert("Không tìm thấy form nhập thẻ!");
        setLoading(false);
        return;
      }

      const { token, error } = await stripe.createToken(cardElement);

      if (error) {
        alert(`Lỗi Stripe: ${error.message}`);
        setLoading(false);
        return;
      }

      const paymentToken = token.id;
      console.log("1. Đã lấy Ephemeral Payment Token từ Hosted Fields:", paymentToken);

      // 2. Tự sinh các tham số chống Replay Attack
      const nonce = window.crypto.randomUUID();
      const timestamp = Math.floor(Date.now() / 1000);
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const userId = "USER_ID_CUA_BAN_KHI_DANG_NHAP";

      // 3. Gom các trường thông tin theo đúng thứ tự của cấu trúc Backend đã chuẩn hóa
      const payloadData = {
        orderId,
        amount: displayAmount, // Sử dụng biến phòng vệ an toàn đã ép kiểu số
        paymentToken,
        nonce,
        timestamp,
      };

      const payloadString = JSON.stringify(payloadData);

      // SỬA TẠI ĐÂY: Trùng khớp hoàn toàn với chuỗi mặc định ở Backend route.ts
      const sessionSecret = "secret_ma_nguoi_dung_co_khi_dang_nhap";

      // 4. Ký đối xứng bằng HMAC-SHA256
      const clientHmac = await generateHMAC(payloadString, sessionSecret);
      console.log("2. Đã tính toán chuỗi ký đối xứng HMAC thành công:", clientHmac);

      // 5. Gửi Request đợt 1 lên API Endpoint Backend
      console.log("3. Đang gửi Request đợt 1 chứa Payload lên Backend...");
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payloadData,
          clientHmac,
          userId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Xác thực đợt 1 thất bại: ${result.error}`);
        setLoading(false);
        return;
      }

      // 6. Nhận về chuỗi thử thách mã hóa (Transaction Challenge)
      const { challenge } = result;

      console.log(
        "4. Đón nhận thành công chuỗi Challenge từ Backend:",
        challenge
      );

      // ======================================================
      // BƯỚC 2: KÝ CHALLENGE BẰNG PRIVATE KEY TRONG INDEXEDDB
      // ======================================================

      // Tạm thời nhập email để demo
      const email = prompt("Nhập email đã đăng ký");

      if (!email) {
        alert("Thiếu email");
        setLoading(false);
        return;
      }

      const privateKey = await getPrivateKey(email);

      if (!privateKey) {
        alert("Không tìm thấy Private Key trong IndexedDB");
        setLoading(false);
        return;
      }

      const signature = await signMessage(privateKey, challenge);

      console.log("5. Đã ký Challenge thành công:", signature);

      // ======================================================
      // BƯỚC 3: GỬI DIGITAL SIGNATURE LÊN BACKEND ĐỂ XÁC THỰC
      // ======================================================

      const verifyResponse = await fetch("/api/verify-signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, email, challenge, signature, }),
      });

      const verifyResult = await verifyResponse.json();

      if (verifyResult.verified) {
        console.log("RECEIPT:", verifyResult.receipt);

        // 👉 FIX: KHÔNG ANY, giữ type chuẩn
        setReceipt(verifyResult.receipt as ReceiptPayload);
      }

      if (!verifyResult.verified) {
        alert("Digital Signature không hợp lệ");
        setLoading(false);
        return;
      }

      console.log("6. Backend xác thực chữ ký thành công");

      alert("Xác thực chữ ký số thành công!");
    } catch (err) {
      console.error("Lỗi trong quá trình xử lý thanh toán:", err);
      alert("Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl border p-8 rounded-xl bg-white shadow-sm">
      <h1 className="text-3xl font-bold mb-4 text-black">Checkout</h1>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium text-gray-700">
          Sản phẩm: {displayProductName}
        </p>
        <p className="text-xl font-bold text-black mt-1">
          ${displayAmount}
        </p>
      </div>

      {/* iFrame nhập thẻ Stripe */}
      <div className="border p-4 rounded-lg my-4 bg-gray-50">
        <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
      </div>

      <button
        onClick={handlePay}
        disabled={loading || !stripe}
        className={`mt-6 w-full text-white px-6 py-3 rounded font-medium transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-800"
        }`}
      >
        {loading
          ? "Đang xử lý bảo mật..."
          : `Thanh toán $${displayAmount}`}
      </button>

      {/* 🎉 RECEIPT MODAL */}
      {receipt && (
        <ReceiptModal
          receipt={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
}