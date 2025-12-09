import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronLeft, ShoppingBag, Minus, Plus, Tag } from 'lucide-react-native';

// --- QUAN TRỌNG: KIỂM TRA LẠI ĐƯỜNG DẪN IMPORT NÀY ---
// Hãy đảm bảo nó trỏ đúng đến file controller và model của bạn
import { getCakeById } from '../../src/controllers/admin/cake.controller';
import { Cake } from '../../src/models/cake.model';
// ----------------------------------------------------

const { width } = Dimensions.get('window');
const THEME_COLOR = '#d97706'; // Màu cam chủ đạo

export default function DetailCakeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Lấy ID từ URL
  
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); // State cho số lượng mua

  // 1. Fetch dữ liệu khi component mount
  useEffect(() => {
    const fetchCakeDetails = async () => {
      // Ép kiểu về string và xóa khoảng trắng
      let cakeId = Array.isArray(id) ? id[0] : id;
      
      if (!cakeId) {
        console.log("ID bị null/undefined");
        return;
      }
      
      cakeId = cakeId.trim(); // QUAN TRỌNG: Xóa khoảng trắng

      setLoading(true);
      try {
        const data = await getCakeById(cakeId);
        setCake(data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCakeDetails();
  }, [id]);
  // 2. Hàm tăng giảm số lượng
  const handleQuantity = (type: 'increase' | 'decrease') => {
    if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === 'increase') {
        // Nếu muốn giới hạn theo stock:
        // if (cake && quantity < cake.stock) setQuantity(quantity + 1);
      setQuantity(quantity + 1);
    }
  };

  // 3. Hàm thêm vào giỏ hàng (Xử lý sau)
  const handleAddToCart = () => {
     if(!cake || !cake.isAvailable) return;
     console.log(`Add to cart: ${cake.name}, Quantity: ${quantity}, Total: ${cake.price * quantity}`);
     alert(`Đã thêm ${quantity} ${cake.name} vào giỏ!`);
     // Sau này sẽ gọi hàm từ CartController ở đây
  };


  // --- RENDER STATES ---

  // Màn hình Loading
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
      </View>
    );
  }

  // Màn hình lỗi nếu không tìm thấy bánh
  if (!cake) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin bánh!</Text>
        <TouchableOpacity style={styles.backButtonSimple} onPress={() => router.back()}>
           <Text style={{color: THEME_COLOR, fontSize: 16, fontWeight: '600'}}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- RENDER MAIN UI ---
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Cấu hình Header trong suốt */}
      <Stack.Screen options={{
        headerShown: true,
        headerTransparent: true, // Header đè lên ảnh
        headerTitle: '', // Không hiện title
        // Nút Back tùy chỉnh (hình tròn trắng)
        headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.roundHeaderBtn}>
              <ChevronLeft size={24} color="#111827" />
            </TouchableOpacity>
        ),
        // Nút giỏ hàng bên phải
        headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/client/cart')} style={styles.roundHeaderBtn}>
               <ShoppingBag size={22} color="#111827" />
            </TouchableOpacity>
        )
      }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        {/* Image Header - Sử dụng getter thumbnail từ Model */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: cake.thumbnail }} style={styles.image} />
        </View>

        {/* Content Body */}
        <View style={styles.contentContainer}>
          {/* Tên và Giá */}
          <Text style={styles.cakeName}>{cake.name}</Text>
          <Text style={styles.cakePrice}>${cake.price.toFixed(2)}</Text>
          
          {/* Chips: Category & Status */}
          <View style={styles.chipRow}>
              {/* Category Chip */}
              <View style={styles.chip}>
                  <Tag size={14} color="#6b7280" style={{marginRight: 4}} />
                  <Text style={styles.chipText}>{cake.category}</Text>
              </View>

              {/* Status Chip - Chỉ hiện nếu không phải Available */}
              {!cake.isAvailable && (
                 <View style={[styles.chip, styles.chipError]}>
                    <Text style={[styles.chipText, styles.chipTextError]}>
                        {cake.status}
                    </Text>
                 </View>
              )}
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>
            {cake.description || "Chưa có mô tả cho sản phẩm này."}
          </Text>

        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar - Sử dụng SafeAreaView để tránh tai thỏ/nút home */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
         
         {/* Selector chọn số lượng */}
         <View style={styles.qtySelector}>
             <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantity('decrease')}>
                <Minus size={18} color={quantity > 1 ? "#111827" : "#9ca3af"} />
             </TouchableOpacity>
             <Text style={styles.qtyText}>{quantity}</Text>
             <TouchableOpacity style={styles.qtyBtn} onPress={() => handleQuantity('increase')}>
                <Plus size={18} color="#111827" />
             </TouchableOpacity>
         </View>

         {/* Nút Thêm vào giỏ hàng */}
         <TouchableOpacity 
            style={[styles.addToCartBtn, !cake.isAvailable && styles.disabledBtn]}
            onPress={handleAddToCart}
            disabled={!cake.isAvailable} // Disable nếu hết hàng
         >
             <ShoppingBag size={20} color="#fff" style={{marginRight: 8}} />
             <Text style={styles.addToCartText}>
                {cake.isAvailable ? 'Thêm vào giỏ' : 'Tạm hết hàng'}
             </Text>
         </TouchableOpacity>
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  errorText: { fontSize: 18, color: '#dc2626', marginBottom: 20 },
  backButtonSimple: { padding: 10, backgroundColor: '#f3f4f6', borderRadius: 8 },
  
  // Header Buttons Custom
  roundHeaderBtn: {
    width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', 
    justifyContent: 'center', alignItems: 'center', borderRadius: 20,
    marginLeft: 10, marginRight: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },

  // Image Header
  imageContainer: { width: width, height: width * 0.8, backgroundColor: '#f3f4f6' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },

  // Content Body
  contentContainer: { 
    padding: 24, 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    marginTop: -30, // Kỹ thuật đẩy content đè lên ảnh
    backgroundColor: '#fff' 
  },
  cakeName: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  cakePrice: { fontSize: 22, fontWeight: 'bold', color: THEME_COLOR, marginBottom: 16 },

  // Chips
  chipRow: { flexDirection: 'row', marginBottom: 24, flexWrap: 'wrap', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6' },
  chipText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  chipError: { backgroundColor: '#fee2e2' },
  chipTextError: { color: '#dc2626' },

  // Description
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  description: { fontSize: 16, color: '#4b5563', lineHeight: 24 },

  // Bottom Bar
  bottomBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20,
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 10,
  },
  
  // Quantity Selector
  qtySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 25, padding: 4 },
  qtyBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  qtyText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16, color: '#111827' },

  // Add to Cart Btn
  addToCartBtn: { 
    flex: 1, marginLeft: 20, height: 50, backgroundColor: THEME_COLOR, 
    borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  disabledBtn: { backgroundColor: '#9ca3af' },
  addToCartText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});