export type Role = 'seller' | 'customer' | 'admin';

export type OrderStatus = 'Pendente' | 'Em Preparo' | 'Pronto' | 'Entregue' | 'Cancelado';

export interface SellerProfile {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  photo: string;
  commission: number; // Percentage, e.g., 10 for 10%
  active: boolean;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  category: 'Doces' | 'Salgados' | 'Combos';
  price: number;
  image: string;
  active: boolean;
  stock: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  vendorId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  neighborhood?: string;
  note: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
}

export interface Revenue {
  id: string;
  vendorId: string;
  orderId: string;
  amount: number;
  platformCommission: number;
  sellerNet: number;
  date: string;
}

export interface Expense {
  id: string;
  vendorId: string;
  category: string;
  amount: number;
  date: string;
  observation: string;
}

export interface PlatformExpense {
  id: string;
  category: string;
  amount: number;
  date: string;
  observation: string;
}

export interface SystemSettings {
  platformName: string;
  defaultCommission: number;
  currency: string;
  theme: 'light' | 'dark';
}

export interface Message {
  id: string;
  sender: 'customer' | 'seller' | 'system';
  text: string;
  date: string;
}

export interface Chat {
  id: string;
  orderId: string;
  messages: Message[];
  date: string;
}

export interface AuthUser {
  id: string;
  email: string;
  password?: string; // Only for simulation purposes in local storage
  name: string;
  role: Role;
  phone: string;
  whatsapp: string;
  neighborhood?: string;
  storeName?: string; // For sellers
  activeProfileId?: string; // Linked ID to SellerProfile if seller
}
