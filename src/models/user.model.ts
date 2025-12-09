// src/models/user.model.ts

export type UserRole = 'admin' | 'client';

export interface UserData {
  email: string;
  phone: string;
  avatarUrl: string;
  address: string;
  favorites: string[]; // Mảng chứa ID các bánh yêu thích
  role: UserRole;
  createdAt: number;
}

export class User {
  id: string;
  email: string;
  password?: string; // Password chỉ dùng khi input, không lưu plaintext vào firestore
  phone: string;
  avatarUrl: string;
  address: string;
  favorites: string[];
  role: UserRole;
  createdAt: number;

  constructor(
    id: string,
    email: string,
    phone: string,
    avatarUrl: string,
    address: string,
    favorites: string[] = [],
    role: UserRole = 'client',
    createdAt: number = Date.now(),
    password?: string
  ) {
    this.id = id;
    this.email = email;
    this.phone = phone;
    this.avatarUrl = avatarUrl;
    this.address = address;
    this.favorites = favorites;
    this.role = role;
    this.createdAt = createdAt;
    this.password = password;
  }

  // Convert để lưu lên Firestore (Không lưu password)
  toFirestore(): UserData {
    return {
      email: this.email,
      phone: this.phone,
      avatarUrl: this.avatarUrl,
      address: this.address,
      favorites: this.favorites,
      role: this.role,
      createdAt: this.createdAt,
    };
  }

  // Convert từ Firestore về App
  static fromFirestore(doc: any): User {
    const data = doc.data();
    return new User(
      doc.id,
      data.email || '',
      data.phone || '',
      data.avatarUrl || '',
      data.address || '',
      data.favorites || [],
      data.role || 'client',
      data.createdAt || Date.now()
    );
  }
}