import React, { useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { X, Lock, Eye, EyeOff } from 'lucide-react-native';
import { changeUserPassword } from '../../../controllers/auth.controller'; // Import hàm vừa viết

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // State hiển thị pass
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleUpdate = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường.");
      return;
    }

    if (newPass !== confirmPass) {
      Alert.alert("Lỗi", "Mật khẩu mới xác nhận không khớp.");
      return;
    }

    if (newPass.length < 6) {
      Alert.alert("Mật khẩu yếu", "Mật khẩu mới phải từ 6 ký tự trở lên.");
      return;
    }

    setLoading(true);
    try {
      await changeUserPassword(currentPass, newPass);
      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
      
      // Reset form & đóng modal
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      onClose();
    } catch (error: any) {
      Alert.alert("Thất bại", error.message || "Không thể đổi mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Change Password</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            
            {/* Current Password */}
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputContainer}>
               <Lock size={20} color="#9ca3af" style={{marginRight: 10}} />
               <TextInput 
                  style={styles.input} 
                  value={currentPass} onChangeText={setCurrentPass} 
                  secureTextEntry={!showCurrent}
                  placeholder="Enter current password"
               />
               <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeOff size={20} color="#6b7280"/> : <Eye size={20} color="#6b7280"/>}
               </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
               <Lock size={20} color="#9ca3af" style={{marginRight: 10}} />
               <TextInput 
                  style={styles.input} 
                  value={newPass} onChangeText={setNewPass} 
                  secureTextEntry={!showNew}
                  placeholder="Enter new password"
               />
               <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff size={20} color="#6b7280"/> : <Eye size={20} color="#6b7280"/>}
               </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
               <Lock size={20} color="#9ca3af" style={{marginRight: 10}} />
               <TextInput 
                  style={styles.input} 
                  value={confirmPass} onChangeText={setConfirmPass} 
                  secureTextEntry={!showNew} // Dùng chung state showNew hoặc tạo riêng tùy ý
                  placeholder="Re-enter new password"
               />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Update Password</Text>}
            </TouchableOpacity>

          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 12 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', 
    borderRadius: 12, paddingHorizontal: 12, height: 50, backgroundColor: '#f9fafb' 
  },
  input: { flex: 1, fontSize: 16, color: '#111827' },

  saveBtn: { backgroundColor: '#d97706', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});