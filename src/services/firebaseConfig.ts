// src/services/firebaseConfig.ts
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
// Bỏ initializeAuth và getReactNativePersistence gây lỗi
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Config giữ nguyên
const firebaseConfig = {
  apiKey: "AIzaSyBykSNVUreH6TNyM7kXAXyx1AdyFoyKTCg",
  authDomain: "cake-6716f.firebaseapp.com",
  projectId: "cake-6716f",
  storageBucket: "cake-6716f.firebasestorage.app",
  messagingSenderId: "925208808952",
  appId: "1:925208808952:web:d30572983602e4086b9a0d",
  measurementId: "G-TDZPS7B7DE"
};

// --- Singleton Pattern ---
let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// --- KHỞI TẠO AUTH ĐƠN GIẢN NHẤT ---
// Cách này dùng cấu hình mặc định, không cần AsyncStorage nên sẽ không bị lỗi kia
auth = getAuth(app);

const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };