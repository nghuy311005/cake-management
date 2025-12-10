export type UserRole = 'admin' | 'client';

export interface UserData {
  name: string;        // [MỚI] Thêm tên hiển thị
  email: string;
  phone: string;
  avatarUrl: string;
  address: string;
  favorites: string[];
  role: UserRole;
  createdAt: number;
}

export class User {
  id: string;
  name: string;        // [MỚI]
  email: string;
  password?: string;
  phone: string;
  avatarUrl: string;
  address: string;
  favorites: string[];
  role: UserRole;
  createdAt: number;

  constructor(
    id: string,
    email: string,
    name: string,      // [MỚI] Thêm tham số name vào constructor
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
    this.name = name;  // [MỚI]
    this.phone = phone;
    this.avatarUrl = avatarUrl;
    this.address = address;
    this.favorites = favorites;
    this.role = role;
    this.createdAt = createdAt;
    this.password = password;
  }

  // Convert để lưu lên Firestore
  toFirestore(): UserData {
    return {
      name: this.name, // [MỚI] Lưu name lên DB
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
      data.name || 'User', // [MỚI] Lấy name từ DB, mặc định là 'User' nếu thiếu
      data.phone || '',
      data.avatarUrl || '',
      data.address || '',
      data.favorites || [],
      data.role || 'client',
      data.createdAt || Date.now()
    );
  }
}