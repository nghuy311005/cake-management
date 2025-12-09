
import { db } from '../../services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { User } from '../../models/user.model';

export const addUserToFirestore = async (newUser: User): Promise<void> => {
  try {
    const userData = newUser.toFirestore();
    // Lưu vào collection 'users'
    await addDoc(collection(db, 'users'), userData);
    console.log('User added directly to Firestore!');
  } catch (error) {
    console.error('Error adding user: ', error);
    throw error;
  }
};