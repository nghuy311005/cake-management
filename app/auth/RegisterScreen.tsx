import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  SafeAreaView, ScrollView, Alert, ActivityIndicator, 
  KeyboardAvoidingView, Platform, Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react-native';

// Import Controller & Model
import { addUserToFirestore } from '../../src/controllers/admin/auth.controller';
import { User as UserModel } from '../../src/models/user.model'; 

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(''); // [MỚI] Thêm Name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    // 1. Validate cơ bản
    if (!name || !email || !password || !phone) {
      Alert.alert('Missing Info', 'Please fill in Name, Email, Password and Phone.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // 2. Tạo Model User (Cập nhật theo constructor mới có name)
      const newUser = new UserModel(
        '',             // id (để trống, controller tự xử lý)
        email.trim(),
        name.trim(),    // [MỚI] Truyền name vào đây
        phone.trim(),
        'https://via.placeholder.com/150', // Avatar mặc định
        address.trim(),
        [],             // favorites
        'client',       // role
        Date.now(),
        password.trim() 
      );

      // 3. Gọi Controller đăng ký
      await addUserToFirestore(newUser);

      // 4. Thông báo & Chuyển trang
      Alert.alert('Welcome!', 'Account created successfully.', [
        { 
          text: "Let's Shop", 
          onPress: () => router.replace('/client/home') 
        }
      ]);

    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to start your sweet journey!</Text>
          </View>

          {/* Form Inputs */}
          <View style={styles.form}>
            
            {/* [MỚI] Full Name */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                    <User size={20} color="#9ca3af" style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="John Doe" 
                        value={name} onChangeText={setName}
                    />
                </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                    <Mail size={20} color="#9ca3af" style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="hello@example.com" 
                        value={email} onChangeText={setEmail}
                        keyboardType="email-address" autoCapitalize="none"
                    />
                </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                    <Phone size={20} color="#9ca3af" style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="0901234567" 
                        value={phone} onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                </View>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Delivery Address</Text>
                <View style={styles.inputContainer}>
                    <MapPin size={20} color="#9ca3af" style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="123 Street, City..." 
                        value={address} onChangeText={setAddress}
                    />
                </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                    <Lock size={20} color="#9ca3af" style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Min 6 characters" 
                        value={password} onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                    <Lock size={20} color="#9ca3af" style={styles.icon} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="Re-enter password" 
                        value={confirmPassword} onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                    />
                </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Sign Up</Text>
                )}
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#f3f4f6' },
  
  content: { padding: 24, paddingBottom: 40 },
  
  titleSection: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280' },

  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, 
    paddingHorizontal: 16, height: 56, backgroundColor: '#f9fafb' 
  },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },

  button: { 
    backgroundColor: '#d97706', height: 56, borderRadius: 16, 
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: '#d97706', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  footerText: { fontSize: 15, color: '#6b7280' },
  footerLink: { fontSize: 15, fontWeight: 'bold', color: '#d97706' },
});