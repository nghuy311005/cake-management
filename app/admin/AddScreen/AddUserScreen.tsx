import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Upload, CheckCircle, Eye, EyeOff } from 'lucide-react-native';

import { User } from '../../../src/models/user.model';
import { addUserToFirestore } from '../../../src/controllers/admin/auth.controller';
import { pickImageFromGallery, uploadToCloudinary } from '../../../src/helper/uploadImage';
import { isValidEmail, isValidPassword } from '../../../src/helper/authCheck';

export default function AddUserScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(''); // [MỚI] Thêm state name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'admin' | 'client'>('client');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const handlePickAvatar = async () => {
    const uri = await pickImageFromGallery();
    if (uri) setAvatarUri(uri);
  };

  const handleSave = async () => {
    const cleanEmail = email.trim(); 
    const cleanPassword = password.trim();
    const cleanName = name.trim(); // [MỚI]

    // Validate
    if (!cleanName || !email || !phone || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Tên, Email, SĐT và Mật khẩu.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      Alert.alert('Email sai', 'Vui lòng nhập email đúng định dạng (ví dụ: abc@gmail.com)');
      return;
    }

    if (!isValidPassword(cleanPassword)) {
      Alert.alert('Mật khẩu yếu', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = 'https://via.placeholder.com/150';
      if (avatarUri) {
        avatarUrl = await uploadToCloudinary(avatarUri);
      }

      // Tạo Model User (Cập nhật theo constructor mới)
      const newUser = new User(
        '',             // id (để trống, controller sẽ xử lý hoặc firestore tự sinh)
        cleanEmail,
        cleanName,      // [MỚI] Truyền name vào vị trí thứ 3 (theo constructor đã sửa)
        phone,
        avatarUrl,
        address,
        [],             // favorites
        role,
        Date.now(),
        cleanPassword 
      );

      await addUserToFirestore(newUser);

      Alert.alert('Thành công', 'Đã thêm người dùng mới!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Reset form
            setName(''); // [MỚI]
            setEmail('');
            setPassword('');
            setPhone('');
            setAddress('');
            setRole('client');
            setAvatarUri(null);
            setShowPassword(false);
            
            router.back(); 
          } 
        }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Failed to add user.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Upload size={24} color="#9ca3af" />
                  <Text style={styles.avatarText}>Upload</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* [MỚI] Input Name */}
          <Text style={styles.label}>Full Name (*)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="John Doe" 
            value={name} 
            onChangeText={setName}
          />

          {/* Email */}
          <Text style={styles.label}>Email (*)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="user@example.com" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <Text style={styles.label}>Password (*)</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput} 
              placeholder="Min 6 characters" 
              value={password} 
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
            </TouchableOpacity>
          </View>

          {/* Phone */}
          <Text style={styles.label}>Phone Number (*)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0901234567" 
            value={phone} 
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Address */}
          <Text style={styles.label}>Address</Text>
          <TextInput 
            style={styles.input} 
            placeholder="123 Street, NY..." 
            value={address} 
            onChangeText={setAddress}
          />

          {/* Role */}
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
                style={[styles.roleBtn, role === 'client' && styles.roleBtnActive]} 
                onPress={() => setRole('client')}
            >
                {role === 'client' && <CheckCircle size={16} color="#d97706" style={{marginRight:5}} />}
                <Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>Client</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]} 
                onPress={() => setRole('admin')}
            >
                {role === 'admin' && <CheckCircle size={16} color="#d97706" style={{marginRight:5}} />}
                <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>Admin</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save User</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { alignItems: 'center' },
  avatarText: { fontSize: 12, color: '#9ca3af', marginTop: 4 },

  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' },

  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: '#f9fafb', paddingHorizontal: 12,
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  eyeIcon: { padding: 4 },

  roleContainer: { flexDirection: 'row', gap: 15, marginTop: 5 },
  roleBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  roleBtnActive: { borderColor: '#d97706', backgroundColor: '#fff7ed' },
  roleText: { color: '#6b7280', fontWeight: '500' },
  roleTextActive: { color: '#d97706', fontWeight: 'bold' },

  saveBtn: { marginTop: 30, backgroundColor: '#d97706', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});