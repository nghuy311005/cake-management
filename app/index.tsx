// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Mặc định chuyển hướng về trang Login
  return <Redirect href="/admin" />;
}