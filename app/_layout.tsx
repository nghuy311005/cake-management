import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../src/controllers/useFrameworkReady';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <SafeAreaProvider>
      {/* Đổi initialRouteName thành "index" để nó kiểm tra ở trang index */}
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        
        {/* Màn hình Login */}
        <Stack.Screen name="auth/LoginScreen" />

        {/* Các màn hình chính */}
        <Stack.Screen name="client" />
        <Stack.Screen name="admin" />
        
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
    </>
  );
}