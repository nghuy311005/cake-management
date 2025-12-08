export type CakeStatus = 'Available' | 'Low Stock' | 'Out of Stock';

export interface CakeData {
  name: string;
  price: number;
  images: string[];
  category: string;
  status: CakeStatus;
  stock: number;
  description?: string;
}

export class Cake {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  status: CakeStatus;
  stock: number;
  description?: string;

  constructor(
    id: string,
    name: string,
    price: number,
    images: string[],
    category: string,
    status: CakeStatus,
    stock: number,
    description?: string
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.images = images;
    this.category = category;
    this.status = status;
    this.stock = stock;
    this.description = description;
  }

  get thumbnail(): string {
    return this.images?.[0] || 'https://via.placeholder.com/150';
  }

  get isAvailable(): boolean {
    return this.status !== 'Out of Stock' && this.stock > 0;
  }

  toFirestore(): CakeData {
    return {
      name: this.name,
      price: this.price,
      images: this.images,
      category: this.category,
      status: this.status,
      stock: this.stock,
      description: this.description || '',
    };
  }

  static fromFirestore(doc: any): Cake {
    const data = doc.data() || {};

    return new Cake(
      doc.id,
      data.name || '',
      data.price || 0,
      Array.isArray(data.images)
        ? data.images
        : (data.image ? [data.image] : []),
      data.category || 'Uncategorized',
      data.status,
      data.stock ?? 0,
      data.description || ''
    );
  }
}

export default Cake;
