import { NextResponse } from "next/server";
import { verifyJWS } from "@/lib/crypto/jws";

export async function POST(req: Request) {
  const { jws } = await req.json();

  try {
    const decoded = verifyJWS(
      jws,
      process.env.JWS_SECRET || "dev_secret"
    );

    return NextResponse.json({
      valid: true,
      receipt: decoded,
    });
  } catch {
    return NextResponse.json({
      valid: false,
    }, { status: 400 });
  }
}