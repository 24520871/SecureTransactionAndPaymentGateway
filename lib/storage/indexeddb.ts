// use for saving private key

import { openDB } from "idb";

const DB_NAME = "secure-payment-db";

const STORE_NAME = "keys";

export async function getDB() {

  return openDB(DB_NAME, 1, {

    upgrade(db) {

      if (
        !db.objectStoreNames.contains(
          STORE_NAME
        )
      ) {

        db.createObjectStore(
          STORE_NAME
        );
      }
    },
  });
}

// Save private key by email
export async function savePrivateKey(
  email: string,
  key: CryptoKey
) {

  const db = await getDB();

  await db.put(
    STORE_NAME,
    key,
    email
  );
}

// Get private key by email
export async function getPrivateKey(
  email: string
) {

  const db = await getDB();

  return db.get(
    STORE_NAME,
    email
  );
}

// Optional helper
export async function deletePrivateKey(
  email: string
) {

  const db = await getDB();

  return db.delete(
    STORE_NAME,
    email
  );
}