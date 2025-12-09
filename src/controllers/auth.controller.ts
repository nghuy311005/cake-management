// src/controllers/auth.controller.ts

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'; // Import thêm signIn
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { User } from '../models/user.model';

// --- HÀM LOGIN MỚI ---
export const loginUser = async (email: string, pass: string) => {
  try {
    // 1. Đăng nhập Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const uid = userCredential.user.uid;

    // 2. Lấy thông tin Role từ Firestore
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: uid,
        role: userData.role || 'client', // Mặc định là client nếu không tìm thấy role
        ...userData
      };
    } else {
      throw new Error("User data not found in database.");
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out!");
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};