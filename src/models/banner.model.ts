// src/models/banner.model.ts

export interface BannerData {
  imageUrl: string;
  title: string;      
  discount: string;   
  deleted: boolean;
  createdAt: number;
}

export class Banner {
  id: string;
  imageUrl: string;
  title: string;      
  discount: string;   
  deleted: boolean;
  createdAt: number;

  constructor(
    id: string,
    imageUrl: string,
    title: string,     
    discount: string,  
    deleted: boolean = false,
    createdAt: number = Date.now()
  ) {
    this.id = id;
    this.imageUrl = imageUrl;
    this.title = title;
    this.discount = discount;
    this.deleted = deleted;
    this.createdAt = createdAt;
  }

  // Convert để lưu lên Firestore
  toFirestore(): BannerData {
    return {
      imageUrl: this.imageUrl,
      title: this.title || '',       // Lưu chuỗi rỗng nếu không có
      discount: this.discount || '',
      deleted: this.deleted,
      createdAt: this.createdAt,
    };
  }

  // Convert từ Firestore về App
  static fromFirestore(doc: any): Banner {
    const data = doc.data();
    return new Banner(
      doc.id,
      data.imageUrl || '',
      data.title || '',
      data.discount || '',
      data.deleted || false,
      data.createdAt || Date.now()
    );
  }
}