import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Cake } from '../../src/models/cake.model';
import { addCakeToFirestore } from '../../src/controllers/admin/cake.controller';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function AddCakeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State cho form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');

  const [imageUri, setImageUri] = useState<string | null>(null); // Lưu URI ảnh tạm trên máy

  // --- HÀM 1: CHỌN ẢNH TỪ MÁY ---
  const pickImage = async () => {
    // Xin quyền truy cập
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need permission to access your gallery');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Cho phép cắt ảnh vuông
      aspect: [4, 3],
      quality: 0.7, // Giảm chất lượng 1 chút để upload nhanh
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  /// --- HÀM 2: UPLOAD ẢNH LÊN CLOUDINARY (Đã sửa đổi - BỎ BLOB) ---
  const uploadToCloudinary = async (uri: string) => {
    try {
      const CLOUDINARY_CLOUD_NAME = "dcmlb1cto"; 
      const CLOUDINARY_UPLOAD_PRESET = "user-management"; 
      const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      // 1. Chuẩn bị thông tin file (Quan trọng: Phải có type)
      let filename = uri.split('/').pop() || `cake_${Date.now()}.jpg`;
      
      // Đoán đuôi file để set type cho đúng (Android rất cần cái này)
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image/jpeg`;

      // 2. Tạo FormData
      const formData = new FormData();
      
      // THAY ĐỔI QUAN TRỌNG: Truyền Object thay vì Blob
      formData.append("file", {
        uri: uri, 
        name: filename,
        type: type, 
      } as any); // "as any" để tránh lỗi TypeScript báo đỏ
      
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      console.log("Starting upload to Cloudinary...", { uri, type });

      // 3. Gọi Fetch
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: {
            // LƯU Ý: Không được set 'Content-Type': 'multipart/form-data' thủ công
            // Hãy để fetch tự động thêm boundary vào header
            'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.secure_url) {
        console.log("Upload success:", data.secure_url);
        return data.secure_url;
      } else {
        console.log("Cloudinary error:", data);
        throw new Error("Upload thất bại: " + (data.error?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload function error:", error);
      throw error;
    }
  };

  // --- HÀM 3: LƯU SẢN PHẨM ---
  const handleSave = async () => {
    // 1. Validate dữ liệu cơ bản
    if (!name || !price || !category || !imageUri) {
      Alert.alert('Missing Info', 'Please fill in Name, Price, Category, and select an image');
      return;
    }

    setLoading(true);
    try {
      // 2. Upload ảnh lên Cloudinary trước
      const imageUrl = await uploadToCloudinary(imageUri);

      // 3. Tạo đối tượng Cake từ Model 
      const newCake = new Cake(
        '',                         // id (để rỗng, Firestore tự tạo)
        name, 
        parseFloat(price), 
        [imageUrl],                 // <-- Bỏ URL từ Cloudinary vào mảng
        category, 
        'Available',                // Status mặc định
        parseInt(stock) || 0,
        description                 // <-- Description
      );

      // 4. Gọi Controller lưu xuống Firestore
      await addCakeToFirestore(newCake);

      Alert.alert('Success', 'Cake added successfully!', [
        { text: 'OK', onPress: () => router.back() } // Quay lại màn Home
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not add cake. Please check logs.');
    } finally {
      setLoading(false);
    }
  };

 return (
    <SafeAreaView style={styles.container}>
      {/* KeyboardAvoidingView: Giúp đẩy màn hình lên khi bàn phím hiện ra */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Create New Cake</Text>

          {/* --- AVATAR PICKER --- */}
          <Text style={styles.label}>Cake Image</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.fullImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={{ fontSize: 40 }}>📸</Text>
                <Text style={styles.imagePlaceholderText}>Tap to pick an image</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* --- FORM INPUTS --- */}
          <View style={styles.form}>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Cake Name</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Ex: Strawberry Shortcake" 
                    value={name} 
                    onChangeText={setName} 
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Ex: Pastry, Cream..." 
                    value={category} 
                    onChangeText={setCategory} 
                />
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Describe taste, ingredients..." 
                    value={description} 
                    onChangeText={setDescription}
                    multiline={true}
                    textAlignVertical="top" 
                />
            </View>

            {/* Row for Price & Stock */}
            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Price ($)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="0.00" 
                        keyboardType="numeric" 
                        value={price} 
                        onChangeText={setPrice} 
                    />
                </View>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Stock (Qty)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="10" 
                        keyboardType="numeric" 
                        value={stock} 
                        onChangeText={setStock} 
                    />
                </View>
            </View>
          </View>

          {/* --- BUTTON --- */}
          <TouchableOpacity 
            style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSave} 
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.saveBtnText}>💾 Save Cake</Text>
            )}
          </TouchableOpacity>
          
          {/* View trống để độn chiều cao phía dưới, giúp scroll qua được bàn phím */}
          <View style={{ height: 100 }} /> 

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  content: {
    padding: 20,
    paddingBottom: 50, // Thêm padding dưới cùng
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: '#333',
  },
  // --- THAY ĐOẠN CŨ BẰNG ĐOẠN MỚI NÀY ---
  
  // Khung chứa ảnh (Hình chữ nhật to)
  imageContainer: {
    width: '100%',        // Chiếm hết chiều ngang
    height: 250,          // Chiều cao cố định (bạn có thể chỉnh số này)
    marginBottom: 25,
    borderRadius: 12,     // Bo góc nhẹ cho đẹp
    overflow: 'hidden',   // Để ảnh không bị tràn ra ngoài góc bo
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    
    // Đổ bóng cho nổi
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Ảnh hiển thị (Full khung)
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Cắt ảnh để lấp đầy khung mà không bị méo
  },

  // Placeholder (Lúc chưa chọn ảnh)
  imagePlaceholder: {
    flex: 1, // Chiếm hết không gian của container
    justifyContent: 'center',
    alignItems: 'center',
  },

  imagePlaceholderText: {
    marginTop: 10,
    color: "#6b7280",
    fontSize: 16,
    fontWeight: '600',
  },
  // Form styles
  form: {
    gap: 15,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginLeft: 4
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Row styles cho Price/Stock
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15
  },
  halfInput: {
    flex: 1,
  },
  // Button styles
  saveBtn: {
    backgroundColor: "#d97706", 
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#d97706",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});