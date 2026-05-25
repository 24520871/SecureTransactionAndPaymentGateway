import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../firebase";

// LOGIN
export const loginUser = async (
  email: string,
  password: string
) => {

  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};

// LOGOUT
export const logoutUser = async () => {

  return await signOut(auth);
};

// RESET PASSWORD
export const resetPassword = async (
  email: string
) => {

  return await sendPasswordResetEmail(
    auth,
    email
  );
};