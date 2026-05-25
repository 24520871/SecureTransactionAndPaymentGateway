import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "./firebase";

export async function registerUser(
  email: string,
  password: string
) {
  return await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
}

export async function loginUser(
  email: string,
  password: string
) {
  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
}

export async function logoutUser() {
  return await signOut(auth);
}

export async function forgotPassword(
  email: string
) {
  return await sendPasswordResetEmail(
    auth,
    email
  );
}