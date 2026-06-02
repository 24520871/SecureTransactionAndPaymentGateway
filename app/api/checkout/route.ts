import { NextResponse } from "next/server";
import { redis } from "@/lib/redis"; 
import crypto from "crypto";

import { checkVelocity }
from "@/lib/fraud-engine/velocity-check";

const TIMESTAMP_WINDOW_SECONDS = 300; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, paymentToken, nonce, timestamp, clientHmac, userId } = body;

    if (!orderId || !amount || !paymentToken || !nonce || !timestamp || !clientHmac) {
      return NextResponse.json(
        { error: "Thiếu thông tin giao dịch bắt buộc (Bad Request)." },
        { status: 400 }
      );
    }

    // 2. Kiểm tra Timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000); 
    const timeDifference = Math.abs(currentTimestamp - timestamp);

    if (timeDifference > TIMESTAMP_WINDOW_SECONDS) {
      return NextResponse.json(
        { error: "Yêu cầu hết hạn hoặc thời gian máy khách không chính xác (Timestamp invalid)." },
        { status: 400 }
      );
    }

    // 3. Kiểm tra Per-transaction Nonce bằng Redis
    const redisKey = `nonce:${nonce}`;
    const isNewNonce =
      await redis.set(
        redisKey,
        "used",
        {
          ex:
            TIMESTAMP_WINDOW_SECONDS,

          nx: true,
        }
      );
    
    if (!isNewNonce) {
      return NextResponse.json(
        { error: "Cảnh báo bảo mật: Phát hiện tấn công Replay Attack! Giao dịch trùng lặp." },
        { status: 400 }
      );
    }

    // 4. Xác thực HMAC Request Signing (SỬA LỖI ĐỒNG BỘ CHUỖI TẠI ĐÂY)
    const sessionSecret = process.env.SESSION_SECRET_KEY || "secret_ma_nguoi_dung_co_khi_dang_nhap"; 
    
    // ĐÓNG GÓI THỦ CÔNG THEO ĐÚNG THỨ TỰ CỦA FRONTEND ĐỂ ĐẢM BẢO CHUỖI STRING KHỚP 100%
    const payloadToVerify = JSON.stringify({
      orderId,
      amount,
      paymentToken,
      nonce,
      timestamp
    });
    
    const computedHmac = crypto
      .createHmac("sha256", sessionSecret)
      .update(payloadToVerify)
      .digest("base64");

    if (computedHmac !== clientHmac) {
      // Nếu test bị lỗi 401, bạn mở 2 dòng log này ở terminal ra xem chuỗi của 2 bên lệch nhau chỗ nào nhé
      console.log("--> Chuỗi Server dùng để băm:", payloadToVerify);
      console.log(`--> Mã HMAC Server tính ra: ${computedHmac} | Client gửi: ${clientHmac}`);
      
      return NextResponse.json(
        { error: "Dữ liệu giao dịch đã bị chỉnh sửa bất hợp pháp dọc đường (HMAC verification failed)." },
        { status: 401 }
      );
    }

      //velocity-check
      const ip =
      request.headers.get(
        "x-forwarded-for"
      ) || "unknown";

      const fraudResult =
        await checkVelocity(
          userId,
          ip
        );

      if (fraudResult.blocked) {

        return NextResponse.json(
          {
            error:
              "Fraud detection triggered",

            riskScore:
              fraudResult.riskScore,

            reasons:
              fraudResult.reasons,
          },
          {
            status: 429,
          }
        );
      }

    // 6. Sinh chuỗi Thử thách (Transaction Challenge)
    const transactionChallenge = crypto.randomBytes(32).toString("hex");
    await redis.set(
      `challenge:${orderId}`,
      transactionChallenge,
      {
        ex: 600,
      }
    );

    console.log(`[Backend] Xác thực HMAC & Nonce thành công cho Order: ${orderId}. Đã phát sinh Challenge.`);
    return NextResponse.json({ 
      success: true,
      message: "Xác thực bước 1 thành công.",
      challenge: transactionChallenge 
    });

  } catch (error) {
    console.error("Lỗi hệ thống tại API Checkout:", error);
    return NextResponse.json(
      { error: "Lỗi xử lý nội bộ tại máy chủ (Internal Server Error)." },
      { status: 500 }
    );
  }
}