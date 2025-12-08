import { db } from '../../services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Banner } from '../../models/banner.model';

export const addBannerToFirestore = async (newBanner: Banner): Promise<void> => {
  try {
    const bannerData = newBanner.toFirestore();
    // Lưu vào collection tên là 'banners'
    await addDoc(collection(db, 'banners'), bannerData);
    console.log('Banner added successfully!');
  } catch (error) {
    console.error('Error adding banner: ', error);
    throw error;
  }
};