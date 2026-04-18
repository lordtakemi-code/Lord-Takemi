import { Product, Order, Revenue, Expense, SellerProfile, Chat, Message, PlatformExpense, SystemSettings, AuthUser } from './types';

const STORAGE_KEYS = {
  PRODUCTS: 'sabores_v4_products',
  ORDERS: 'sabores_v4_orders',
  REVENUES: 'sabores_v4_revenues',
  EXPENSES: 'sabores_v4_expenses',
  PLATFORM_EXPENSES: 'sabores_v4_platform_expenses',
  SELLERS: 'sabores_v4_sellers',
  CHATS: 'sabores_v4_chats',
  SETTINGS: 'sabores_v4_settings',
  USERS: 'sabores_v4_users',
  SESSION: 'sabores_v4_session',
};

const INITIAL_SETTINGS: SystemSettings = {
  platformName: 'NEXT DELIVERY',
  defaultCommission: 10,
  currency: 'MT',
  theme: 'light',
};

const INITIAL_SELLERS: SellerProfile[] = [
  { 
    id: 'vendor_1', 
    name: 'NEXT DELIVERY Central', 
    phone: '840000001', 
    whatsapp: '840000001', 
    address: 'Av. Eduardo Mondlane, Maputo', 
    photo: 'https://picsum.photos/seed/vendor1/200',
    commission: 10,
    active: true
  },
  { 
    id: 'vendor_2', 
    name: 'Dociceria Maria', 
    phone: '840000002', 
    whatsapp: '840000002', 
    address: 'Rua da Malangatana, Matola', 
    photo: 'https://picsum.photos/seed/vendor2/200',
    commission: 15,
    active: true
  },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', vendorId: 'vendor_1', name: 'Pastel de Carne Especial', description: 'Carne fresca e temperos da casa', category: 'Salgados', price: 65, active: true, stock: 20, image: 'https://picsum.photos/seed/pastel1/400/300' },
  { id: '2', vendorId: 'vendor_1', name: 'Pastel de Queijo & Tomate', description: 'Queijo derretido e manjericão', category: 'Salgados', price: 60, active: true, stock: 15, image: 'https://picsum.photos/seed/pastel2/400/300' },
  { id: '3', vendorId: 'vendor_2', name: 'Combo Casal Doces', description: '2 Bolos + 2 Refrigerantes', category: 'Combos', price: 220, active: true, stock: 5, image: 'https://picsum.photos/seed/combo/400/300' },
  { id: '4', vendorId: 'vendor_2', name: 'Bolo de Chocolate Real', description: 'Fatia generosa com cobertura belga', category: 'Doces', price: 95, active: true, stock: 10, image: 'https://picsum.photos/seed/cake/400/300' },
  { id: '5', vendorId: 'vendor_1', name: 'Enrolado de Salsicha', description: 'Salgado clássico frito na hora', category: 'Salgados', price: 45, active: true, stock: 30, image: 'https://picsum.photos/seed/salgado/400/300' },
];

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getSettings(): SystemSettings { return this.get(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS); },
  saveSettings(settings: SystemSettings) { this.set(STORAGE_KEYS.SETTINGS, settings); },

  getAllSellers(): SellerProfile[] { return this.get(STORAGE_KEYS.SELLERS, INITIAL_SELLERS); },
  saveSeller(seller: SellerProfile) {
    const sellers = this.getAllSellers();
    const existingIdx = sellers.findIndex(s => s.id === seller.id);
    if (existingIdx >= 0) sellers[existingIdx] = seller;
    else sellers.push(seller);
    this.set(STORAGE_KEYS.SELLERS, sellers);
  },

  getProducts(): Product[] { return this.get(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS); },
  getVendorProducts(vendorId: string): Product[] {
    return this.getProducts().filter(p => p.vendorId === vendorId);
  },
  saveProducts(products: Product[]) { this.set(STORAGE_KEYS.PRODUCTS, products); },
  
  updateProductStock(id: string, newStock: number) {
    const products = this.getProducts();
    this.saveProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
  },

  getOrders(): Order[] { return this.get(STORAGE_KEYS.ORDERS, []); },
  getVendorOrders(vendorId: string): Order[] {
    return this.getOrders().filter(o => o.vendorId === vendorId);
  },
  
  saveOrder(order: Order) {
    const orders = this.getOrders();
    this.set(STORAGE_KEYS.ORDERS, [...orders, order]);
    
    // Reduce stock
    const products = this.getProducts().map(p => {
      const item = order.items.find(i => i.productId === p.id);
      return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
    });
    this.saveProducts(products);
  },

  updateOrderStatus(orderId: string, status: Order['status']) {
    const orders = this.getOrders();
    this.set(STORAGE_KEYS.ORDERS, orders.map(o => {
      if (o.id === orderId) {
        if (status === 'Entregue' && o.status !== 'Entregue') {
          const sellers = this.getAllSellers();
          const seller = sellers.find(s => s.id === o.vendorId);
          const commPct = seller?.commission || INITIAL_SETTINGS.defaultCommission;
          const commAmt = (o.total * commPct) / 100;
          
          this.recordRevenue({ 
            id: Date.now().toString(), 
            vendorId: o.vendorId, 
            orderId: o.id, 
            amount: o.total, 
            platformCommission: commAmt,
            sellerNet: o.total - commAmt,
            date: new Date().toISOString() 
          });
        }
        return { ...o, status };
      }
      return o;
    }));
  },

  getRevenues(): Revenue[] { return this.get(STORAGE_KEYS.REVENUES, []); },
  getVendorRevenues(vendorId: string): Revenue[] {
    return this.getRevenues().filter(r => r.vendorId === vendorId);
  },
  recordRevenue(rev: Revenue) { this.set(STORAGE_KEYS.REVENUES, [...this.getRevenues(), rev]); },

  getExpenses(): Expense[] { return this.get(STORAGE_KEYS.EXPENSES, []); },
  getVendorExpenses(vendorId: string): Expense[] {
    return this.getExpenses().filter(e => e.vendorId === vendorId);
  },
  saveExpense(expense: Expense) { this.set(STORAGE_KEYS.EXPENSES, [...this.getExpenses(), expense]); },
  deleteExpense(id: string) { this.set(STORAGE_KEYS.EXPENSES, this.getExpenses().filter(e => e.id !== id)); },

  getPlatformExpenses(): PlatformExpense[] { return this.get(STORAGE_KEYS.PLATFORM_EXPENSES, []); },
  savePlatformExpense(exp: PlatformExpense) { this.set(STORAGE_KEYS.PLATFORM_EXPENSES, [...this.getPlatformExpenses(), exp]); },

  getChats(): Chat[] { return this.get(STORAGE_KEYS.CHATS, []); },
  getChatByOrder(orderId: string): Chat | null {
    return this.getChats().find(c => c.orderId === orderId) || null;
  },
  saveMessage(orderId: string, msg: Message) {
    const chats = this.getChats();
    let chat = chats.find(c => c.orderId === orderId);
    if (!chat) {
      chat = { id: Date.now().toString(), orderId, messages: [], date: new Date().toISOString() };
      chats.push(chat);
    }
    chat.messages.push(msg);
    this.set(STORAGE_KEYS.CHATS, chats);
    return chat;
  },

  getAllUsers(): AuthUser[] { return this.get(STORAGE_KEYS.USERS, []); },
  
  register(userData: Omit<AuthUser, 'id'>): AuthUser {
    const users = this.getAllUsers();
    const newUser: AuthUser = { ...userData, id: Date.now().toString() };
    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  login(email: string, password: string): AuthUser | null {
    const user = this.getAllUsers().find(u => u.email === email && u.password === password);
    if (user) {
      this.set(STORAGE_KEYS.SESSION, user);
      return user;
    }
    return null;
  },

  getCurrentUser(): AuthUser | null {
    return this.get(STORAGE_KEYS.SESSION, null);
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
};
