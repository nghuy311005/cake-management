import { db } from '../../services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Cake } from '../../models/cake.model';

// Hàm thêm bánh mới vào Firestore
export const addCakeToFirestore = async (newCake: Cake): Promise<void> => {
  try {
    const cakeData = newCake.toFirestore();
    // Xóa trường id vì Firestore sẽ tự sinh ID mới
    // (Lưu ý: Logic này tùy thuộc vào việc bạn muốn tự tạo ID hay để Firestore tự tạo)
    const docRef = await addDoc(collection(db, 'cakes'), cakeData);
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e; // Ném lỗi ra để màn hình UI bắt được và thông báo cho user
  }
};

