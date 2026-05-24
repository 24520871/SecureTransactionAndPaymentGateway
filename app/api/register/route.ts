import { NextResponse } from "next/server";

import { pool } from "@/lib/storage/postgresqldb";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      username,
      email,
      publicKey,
    } = body;

    // Validate fields
    if (
      !username ||
      !email ||
      !publicKey
    ) {
      return NextResponse.json(
        {
          error: "Missing fields",
        },
        {
          status: 400,
        }
      );
    }

    // Check duplicate email
    const existingUser =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
        `,
        [email]
      );

    if (
      existingUser.rows.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Email already exists",
        },
        {
          status: 409,
        }
      );
    }

    // Insert user
    const result =
      await pool.query(
        `
        INSERT INTO users
        (
          username,
          email,
          public_key
        )
        VALUES ($1, $2, $3)
        RETURNING id, username, email
        `,
        [
          username,
          email,
          publicKey,
        ]
      );

    return NextResponse.json(
      {
        message:
          "Register success",

        user:
          result.rows[0],
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}