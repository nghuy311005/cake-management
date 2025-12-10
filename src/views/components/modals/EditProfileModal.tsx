import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, ScrollView, Image, KeyboardAvoidingView, Platform 
} from 'react-native';
import { X, Upload, User, Phone, MapPin, Camera } from 'lucide-react-native';
import { pickImageFromGallery, uploadToCloudinary } from '../../../helper/uploadImage';
import { updateUserProfile } from '../../../controllers/auth.controller';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: any; // Dữ liệu user hiện tại
  onUpdateSuccess: () => void;
}

export default function EditProfileModal({ visible, onClose, user, onUpdateSuccess }: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Load dữ liệu khi mở Modal
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAvatarUri(user.avatarUrl || null);
    }
  }, [user, visible]);

  const handlePickAvatar = async () => {
    const uri = await pickImageFromGallery();
    if (uri) setAvatarUri(uri);
  };

  const handleSave = async () => {
    if (!name || !phone) {
      Alert.alert("Thiếu thông tin", "Tên và Số điện thoại không được để trống.");
      return;
    }

    setLoading(true);
    try {
      let newAvatarUrl = user.avatarUrl;

      // Nếu người dùng chọn ảnh mới (khác ảnh cũ trên mạng) -> Upload
      if (avatarUri && avatarUri !== user.avatarUrl) {
        newAvatarUrl = await uploadToCloudinary(avatarUri);
      }

      const updateData = {
        name,
        phone,
        address,
        avatarUrl: newAvatarUrl
      };

      // Gọi Controller update (user.id là uid document)
      // Lưu ý: Đảm bảo object 'user' truyền vào có trường id hoặc uid
      const uid = user.id || user.uid; 
      await updateUserProfile(uid, updateData);

      Alert.alert("Thành công", "Cập nhật thông tin thành công!");
      onUpdateSuccess();
      onClose();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
              
              {/* Avatar Picker */}
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrapper}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <User size={40} color="#9ca3af" />
                    </View>
                  )}
                  <View style={styles.cameraIcon}>
                    <Camera size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Form Inputs */}
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputGroup}>
                <User size={20} color="#9ca3af" style={{marginRight: 10}} />
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" />
              </View>

              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputGroup}>
                <Phone size={20} color="#9ca3af" style={{marginRight: 10}} />
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Enter phone number" />
              </View>

              <Text style={styles.label}>Address</Text>
              <View style={styles.inputGroup}>
                <MapPin size={20} color="#9ca3af" style={{marginRight: 10}} />
                <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Enter address" />
              </View>

              {/* Email (Read Only) */}
              <Text style={styles.label}>Email (Read-only)</Text>
              <View style={[styles.inputGroup, {backgroundColor: '#f3f4f6'}]}>
                <TextInput style={[styles.input, {color: '#9ca3af'}]} value={user?.email} editable={false} />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatarWrapper: { width: 100, height: 100, borderRadius: 50, position: 'relative' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#d97706', padding: 8, borderRadius: 15, borderWidth: 2, borderColor: '#fff' },

  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  input: { flex: 1, fontSize: 16, color: '#111827' },

  saveBtn: { backgroundColor: '#d97706', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});