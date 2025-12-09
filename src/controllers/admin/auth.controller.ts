

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { User } from '../../models/user.model';

// Hàm thêm user mới (Bao gồm cả tạo Auth và lưu Firestore)
export const addUserToFirestore = async (newUser: User): Promise<void> => {
  // 1. Kiểm tra password có tồn tại không
  if (!newUser.password) {
    throw new Error("Cần có mật khẩu để tạo tài khoản!");
  }

  try {
    // 2. Tạo tài khoản bên Firebase Authentication (Cái này quan trọng để Login được)
    const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
    const uid = userCredential.user.uid;

    // 3. Lấy ID thực từ Auth gán vào Model
    newUser.id = uid;

    // 4. Lưu thông tin chi tiết vào Firestore (dùng setDoc để ID trùng với Auth ID)
    await setDoc(doc(db, 'users', uid), newUser.toFirestore());

    console.log('User created in Auth & Firestore with ID:', uid);
  } catch (error: any) {
    console.error('Error adding user:', error);
    // Xử lý lỗi trùng email
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email này đã được sử dụng!');
    }
    throw error;
  }
};
