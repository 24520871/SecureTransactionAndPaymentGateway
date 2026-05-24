This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=============================================================================================
Set Up guide
=============================================================================================
# Secure Transaction & Payment Gateway

A mini cryptographic payment/transaction system built with:

* Next.js
* PostgreSQL
* Docker
* Web Crypto API
* IndexedDB

This project focuses on:

* public/private key cryptography
* digital signature workflow
* client-side private key ownership
* signed transaction verification

---

# Current Features

## Cryptographic Identity Setup

* Generate ECDSA keypair in browser
* Store private key in IndexedDB
* Store public key in PostgreSQL
* Multi-account private key support

## Database

* PostgreSQL running in Docker
* Users table
* Transactions table

---

# Tech Stack

| Technology     | Purpose                   |
| -------------- | ------------------------- |
| Next.js        | Frontend + Backend API    |
| PostgreSQL     | Database                  |
| Docker         | Database container        |
| Web Crypto API | Cryptography              |
| IndexedDB      | Local private key storage |
| TypeScript     | Type safety               |

---

# Project Structure

```txt
frontend/
├── app/
│   ├── api/
│   │   └── register/
│   └── register/
│
├── lib/
│   ├── crypto/
│   │   └── keygen.ts
│   │
│   ├── storage/
│   │   └── indexeddb.ts
│   │
│   └── db.ts
│
├── docker-compose.yml
├── package.json
└── .env.local
```

---

# Requirements

Install:

* Node.js
* Docker Desktop
* Git

---

# Clone Project

```bash
git clone https://github.com/24520871/SecureTransactionAndPaymentGateway.git
```

```bash
cd frontend
```

---

# Checkout Correct Branch

Current development branch:

```bash
git checkout WebCryptoAPI_setup
```

---

# Install Dependencies

```bash
npm install
```

---

# Run PostgreSQL Docker Container

Start database:

```bash
docker compose up -d
```

Check container:

```bash
docker ps
```

Expected container:

```txt
secure-pay-db
```

---

# Environment Variables

Create:

```txt
.env.local
```

Add:

```env
DATABASE_URL="postgresql://admin:password123@localhost:5432/securepay"
```

---

# Create Database Tables

Open PostgreSQL:

```bash
docker exec -it secure-pay-db psql -U admin -d securepay
```

---

## Create Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    username TEXT NOT NULL,

    email TEXT UNIQUE NOT NULL,

    public_key TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Create Transactions Table

```sql
CREATE TABLE transactions (

    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    transaction_data TEXT NOT NULL,

    signature TEXT NOT NULL,

    status TEXT DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

---

Exit PostgreSQL:

```sql
\q
```

---

# Run Development Server

```bash
npm run dev
```

Open browser:

```txt
http://localhost:3000
```

---

# Current Register Flow

```txt
User Register
    │
    ▼
Generate ECDSA keypair
    │
    ├── private key -> IndexedDB
    │
    └── public key -> PostgreSQL
```

---

# IndexedDB Structure

```txt
secure-payment-db
 └── keys
      ├── user1@gmail.com -> privateKey
      ├── user2@gmail.com -> privateKey
      └── ...
```

---

# Verify Database Data

Open PostgreSQL:

```bash
docker exec -it secure-pay-db psql -U admin -d securepay
```

Query users:

```sql
SELECT * FROM users;
```

Expected:

| id | username | email | public_key |
| -- | -------- | ----- | ---------- |

---

# Verify IndexedDB

Chrome:

```txt
F12
→ Application
→ IndexedDB
→ secure-payment-db
→ keys
```

---

# Important Security Notes

## Private Key

Private keys:

* are stored locally in browser
* are NOT stored in PostgreSQL
* are NOT sent to backend

---

## Public Key

Public keys:

* are stored in PostgreSQL
* are used for signature verification

---

# Planned Features

* Firebase Authentication integration
* Digital signature generation
* Signature verification
* Signed transaction flow
* Transaction history
* Audit logging

---

# Git Workflow

Create feature branch:

```bash
git checkout -b feature-name
```

Commit:

```bash
git add .
git commit -m "your message"
```

Push:

```bash
git push -u origin feature-name
```

---

# Current Main Branches

| Branch             | Purpose                   |
| ------------------ | ------------------------- |
| main               | Stable branch             |
| WebCryptoAPI_setup | Cryptography setup branch |

---

# Team Responsibilities

## Cryptography Layer

* Web Crypto API
* IndexedDB
* Signature generation
* Signature verification
* PostgreSQL

## Authentication Layer

* Firebase Authentication
* Login/Register
* Session management
* JWT/Auth handling |
