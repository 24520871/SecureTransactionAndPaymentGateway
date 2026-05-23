//use for saving private key
import { openDB } from "idb";

const DB_NAME = "secure-payment-db";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    },
  });
}

export async function savePrivateKey(key: CryptoKey) {
  const db = await getDB();

  await db.put("keys", key, "privateKey");
}

export async function getPrivateKey() {
  const db = await getDB();

  return db.get("keys", "privateKey");
}