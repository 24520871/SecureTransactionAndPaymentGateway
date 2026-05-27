"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Import mảng products từ đường dẫn trong dự án của bạn
import { products } from "@/lib/products"; 
import CheckoutForm from "@/components/payment/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  // 1. Lấy sản phẩm dựa trên ID từ URL (mặc định lấy món đầu tiên nếu URL trống)
  const product = products.find((p) => p.id === Number(productId)) || products[0];

  // 2. Quản lý các State động chuẩn E-commerce
  const [quantity, setQuantity] = useState<number>(1);
  const [shippingMethod, setShippingMethod] = useState<string>("standard");

  // 3. Tính toán dòng tiền (Financial Logic)
  const itemTotal = product.price * quantity;
  const shippingFee = shippingMethod === "express" ? 15 : 5; // Express: $15, Standard: $5
  const discount = itemTotal > 100 ? 10 : 0; // Giảm $10 cho đơn hàng trên $100
  const finalTotal = itemTotal + shippingFee - discount;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ======================= CỘT TRÁI: THÔNG TIN ĐƠN HÀNG & GIAO HÀNG (8 Cột) ======================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Form thông tin nhận hàng giả lập */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📍 Thông tin giao hàng
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Họ và tên</label>
                <input type="text" placeholder="Nguyễn Lâm Minh Khoa" className="w-full border p-2.5 rounded-lg text-sm focus:outline-none focus:border-black text-black" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Số điện thoại</label>
                <input type="text" placeholder="0901234567" className="w-full border p-2.5 rounded-lg text-sm focus:outline-none focus:border-black text-black" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Địa chỉ nhận hàng</label>
                <input type="text" placeholder="Khu phố 6, P. Linh Trung, Tp. Thủ Đức, HCM" className="w-full border p-2.5 rounded-lg text-sm focus:outline-none focus:border-black text-black" />
              </div>
            </div>
          </div>

          {/* 2. Chi tiết sản phẩm & Tăng giảm số lượng */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Sản phẩm thanh toán</h2>
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-3xl border">
                {product.id === 1 ? "🖱️" : product.id === 2 ? "⌨️" : "🎧"}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                <p className="text-gray-500 text-sm">Đơn giá: ${product.price}</p>
                
                {/* Bộ nút tăng giảm số lượng */}
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border rounded-lg hover:bg-gray-100 font-bold transition text-black"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-black">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 border rounded-lg hover:bg-gray-100 font-bold transition text-black"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-xl text-black">${itemTotal}</p>
              </div>
            </div>

            {/* 3. Lựa chọn phương thức vận chuyển */}
            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Phương thức vận chuyển:</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`border p-3 rounded-xl flex flex-col cursor-pointer transition ${shippingMethod === 'standard' ? 'border-black bg-gray-50 ring-1 ring-black' : 'hover:border-gray-400'}`}>
                  <input type="radio" name="shipping" value="standard" checked={shippingMethod === "standard"} onChange={() => setShippingMethod("standard")} className="sr-only" />
                  <span className="font-bold text-sm text-black">Giao hàng Tiêu chuẩn</span>
                  <span className="text-gray-500 text-xs mt-0.5">Thời gian: 3-5 ngày • $5</span>
                </label>
                <label className={`border p-3 rounded-xl flex flex-col cursor-pointer transition ${shippingMethod === 'express' ? 'border-black bg-gray-50 ring-1 ring-black' : 'hover:border-gray-400'}`}>
                  <input type="radio" name="shipping" value="express" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} className="sr-only" />
                  <span className="font-bold text-sm text-black">Giao hàng Hỏa tốc</span>
                  <span className="text-gray-500 text-xs mt-0.5">Thời gian: 24h nhận hàng • $15</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ======================= CỘT PHẢI: TÓM TẮT HÓA ĐƠN & THANH TOÁN STRIPE (5 Cột) ======================= */}
        <div className="lg:col-span-5 sticky top-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🧾 Tóm tắt đơn hàng</h2>
            
            <div className="space-y-3 border-b pb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({quantity} sản phẩm)</span>
                <span className="font-medium text-black">${itemTotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-black">${shippingFee}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Giảm giá đơn hàng lớn</span>
                  <span>-${discount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 mb-6">
              <span className="text-base font-bold text-gray-900">Tổng cộng (Đã bao gồm thuế):</span>
              <span className="text-2xl font-extrabold text-black">${finalTotal}</span>
            </div>

            {/* Khung iFrame bảo mật nhập thẻ Stripe */}
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3 tracking-wider">Thanh toán bảo mật qua cổng Stripe</p>
              <Elements stripe={stripePromise}>
                {/* ĐẶC BIỆT: Truyền productName kèm số lượng và finalTotal (Tổng tiền cuối cùng thực tế) */}
                <CheckoutForm 
                  productName={`${product.name} (x${quantity})`} 
                  amount={finalTotal} 
                />
              </Elements>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}