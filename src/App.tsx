import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, 
  Store, Users, Package, TrendingUp, TrendingDown,
  Clock, CheckCircle, XCircle, ChevronRight, ArrowLeft,
  MessageCircle, Send, PlusCircle, Edit3, Save,
  BarChart3, PieChart, Activity, LogOut, Phone,
  MapPin, Bell, Inbox, AlertTriangle, FileText,
  Filter, Image as ImageIcon, CheckCircle2,
  MoreVertical, DollarSign, UploadCloud, Camera, AlertCircle,
  Palette, Globe, ChevronDown, User, Zap,
  BarChart, FileDown, ExternalLink, Play, Lock, Download
} from 'lucide-react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { jsPDF } from 'jspdf';
import { storage } from './storage';
import { translations, Language, TranslationKey } from './translations';
import { 
  Role, Product, Order, OrderItem, SellerProfile, 
  Revenue, Expense, Message, Chat, OrderStatus,
  PlatformExpense, SystemSettings, AuthUser
} from './types';
import { LandingNextDelivery } from './components/LandingNextDelivery';
import { AuthModal } from './components/AuthModal';

// Shared Components
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-card-bg rounded-2xl p-4 food-card-shadow border border-zinc-100/10 transition-all duration-300 hover:shadow-glow focus-within:shadow-glow ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, variant = 'primary', onClick, className = "", disabled = false, fullWidth = false, size = 'md', type = 'button'
}: { 
  children: React.ReactNode, variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost', 
  onClick?: () => void, className?: string, disabled?: boolean, fullWidth?: boolean, size?: 'sm' | 'md' | 'lg',
  type?: 'button' | 'submit' | 'reset'
}) => {
  const base = "rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-brand-primary text-white shadow-glow hover:brightness-110",
    secondary: "bg-brand-accent text-zinc-900 shadow-glow hover:brightness-110",
    outline: "bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5 hover:shadow-glow",
    danger: "bg-brand-secondary text-white shadow-glow hover:brightness-110",
    ghost: "bg-transparent text-text-muted hover:bg-zinc-100/10",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {children}
    </button>
  );
};

const Badge = ({ children, color = 'zinc', className = "" }: { children: React.ReactNode, color?: string, className?: string }) => {
  const colors: any = {
    zinc: 'bg-zinc-100 text-zinc-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color]} ${className}`}>{children}</span>;
};

// --- PALETTE SWITCHER ---

const PaletteSwitcher = ({ palette, setPalette }: { palette: string, setPalette: (s: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const palettes = [
    { id: 'dark', label: 'Dark', icon: '⚫', color: 'bg-zinc-900' },
    { id: 'neon', label: 'Neon', icon: '🟢', color: 'bg-green-500' },
    { id: 'navy', label: 'Navy', icon: '🔵', color: 'bg-blue-900' },
    { id: 'clean', label: 'Clean', icon: '⚪', color: 'bg-emerald-100' },
  ];

  return (
    <div className="fixed top-4 left-4 z-[999]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-card-bg border border-border-main rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-all text-lg"
      >
        🎨
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-12 left-0 bg-card-bg border border-border-main rounded-2xl p-2 shadow-2xl w-40 flex flex-col gap-1"
          >
            {palettes.map(p => (
              <button
                key={p.id}
                onClick={() => { setPalette(p.id); setIsOpen(false); }}
                className={`flex items-center justify-between p-2 rounded-xl text-[10px] font-black uppercase transition-all ${palette === p.id ? 'bg-brand-primary text-white' : 'hover:bg-zinc-100/10 text-text-muted'}`}
              >
                <span className="flex items-center gap-2">{p.icon} {p.label}</span>
                <div className={`w-3 h-3 rounded-full ${p.color} border border-white/20`} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- HEADER COMPONENT ---

const Header = ({ 
  cartCount, onCartClick, searchQuery, setSearchQuery, sellers, vendorFilter, setVendorFilter, onLogoClick,
  role, palette, setPalette, language, setLanguage, t
}: { 
  cartCount: number, onCartClick: () => void, searchQuery: string, setSearchQuery: (s: string) => void, 
  sellers: SellerProfile[], vendorFilter: string, setVendorFilter: (s: string) => void,
  onLogoClick?: () => void, role: Role | null,
  palette: string, setPalette: (s: string) => void,
  language: Language, setLanguage: (l: Language) => void,
  t: (key: keyof typeof translations.pt) => string
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <header className="sticky top-0 z-[100] bg-card-bg border-b border-zinc-100/10 px-6 h-16 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={onLogoClick}>
        <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-glow">
          <Zap size={20} className="fill-white" />
        </div>
        <h1 className="text-xl font-black font-display tracking-tight text-brand-primary hidden sm:block italic">NEXT DELIVERY</h1>
      </div>

      <div className="flex-1 max-w-xl px-4 flex gap-2">
        {role === 'customer' && (
          <>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('whatToEat')} 
                className="bg-zinc-100/50 border border-zinc-100/10 rounded-full pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-brand-primary outline-none w-full transition-all text-text-main"
              />
            </div>
            <select 
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="bg-zinc-100/50 border border-zinc-100/10 rounded-xl px-3 text-[10px] font-bold uppercase text-zinc-500 outline-none hidden md:block"
            >
              <option value="Todos">{t('allStores')}</option>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => { setShowLangMenu(!showLangMenu); }}
            className="flex items-center gap-1 p-2 rounded-xl hover:bg-zinc-100/10 text-text-muted transition-colors"
          >
            <Globe size={18} />
            <span className="text-[10px] font-black uppercase hidden lg:block">{language}</span>
            <ChevronDown size={14} className={`hidden lg:block transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showLangMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-40 bg-card-bg border border-zinc-100/10 rounded-2xl shadow-2xl p-2 z-[200]"
              >
                {[
                  { id: 'pt', label: '🇧🇷 Português' },
                  { id: 'en', label: '🇺🇸 English' },
                  { id: 'fr', label: '🇫🇷 Français' },
                  { id: 'ar', label: '🇸🇦 العربية' },
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => { setLanguage(lang.id as Language); setShowLangMenu(false); }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-colors ${language === lang.id ? 'bg-brand-primary text-white' : 'text-text-main hover:bg-zinc-100/10'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {role === 'customer' && (
          <button onClick={onCartClick} className="relative p-2 text-text-muted hover:text-brand-primary transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-brand-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        )}

        {role === 'seller' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 rounded-xl border border-brand-primary/10">
            <User size={16} className="text-brand-primary" />
            <span className="text-[10px] font-black text-text-main uppercase tracking-tight">{t('seller')}</span>
          </div>
        )}
      </div>
    </header>
  );
};

interface ProductCardProps {
  product: Product;
  onAdd: (p: Product) => void;
  sellerName?: string;
  t: (key: keyof typeof translations.pt) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, sellerName, t }) => {
  const isAvailable = product.active && product.stock > 0;
  return (
    <Card className="p-0 overflow-hidden group h-full flex flex-col">
      <div className="relative h-40 overflow-hidden">
        <img src={product.image} className={`w-full h-full object-cover transition-transform duration-500 ${isAvailable ? 'group-hover:scale-110' : 'grayscale'}`} referrerPolicy="no-referrer" />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge color="red">{t('unavailable')}</Badge>
          </div>
        )}
        {isAvailable && product.stock < 5 && (
          <div className="absolute top-2 right-2">
            <Badge color="red">{t('lowStock')}</Badge>
          </div>
        )}
        {sellerName && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg shadow-sm">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter leading-none flex items-center gap-1">
              <Store size={8} /> {sellerName}
            </p>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <Badge color="amber">{product.category}</Badge>
          <span className="text-sm font-black text-brand-primary">MT {product.price}</span>
        </div>
        <h3 className="font-bold text-zinc-900 leading-tight mb-1">{product.name}</h3>
        <p className="text-xs text-zinc-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
        <Button 
          onClick={() => onAdd(product)} 
          disabled={!isAvailable} 
          size="sm" 
          fullWidth
          variant={isAvailable ? 'primary' : 'ghost'}
        >
          {isAvailable ? <><Plus size={16} /> {t('add')}</> : t('outOfStock')}
        </Button>
      </div>
    </Card>
  );
};

const ChatPanel = ({ orderId, onClose, t }: { orderId: string, onClose: () => void, t: (key: any) => string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const chat = storage.getChatByOrder(orderId);
    if (chat) setMessages(chat.messages);
    else {
      const initial = { id: '1', sender: 'system' as const, text: 'Olá! Estamos preparando seu pedido. Se precisar de algo, é só falar!', date: new Date().toISOString() };
      storage.saveMessage(orderId, initial);
      setMessages([initial]);
    }
  }, [orderId]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), sender: 'customer', text: input, date: new Date().toISOString() };
    const updatedChat = storage.saveMessage(orderId, userMsg);
    setMessages([...updatedChat.messages]);
    setInput('');

    // Simulated auto-response
    setTimeout(() => {
      const botMsg: Message = { id: (Date.now() + 1).toString(), sender: 'seller', text: 'Entendido! Verifiquei sua mensagem and já estamos tratando.', date: new Date().toISOString() };
      const finalizedChat = storage.saveMessage(orderId, botMsg);
      setMessages([...finalizedChat.messages]);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] md:inset-auto md:right-8 md:bottom-24 md:w-96 bg-white shadow-2xl rounded-t-3xl md:rounded-3xl border border-orange-100 flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="p-4 bg-brand-primary text-white rounded-t-3xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <MessageCircle size={20} />
          <h3 className="font-bold">{t('chat_with_seller')}</h3>
        </div>
        <button onClick={onClose}><XCircle size={20} /></button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-brand-bg">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
              m.sender === 'customer' ? 'bg-brand-primary text-white rounded-tr-none' : 
              m.sender === 'system' ? 'bg-zinc-100 text-zinc-500 italic text-center w-full' :
              'bg-white text-zinc-800 rounded-tl-none border border-zinc-100'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t border-zinc-100 flex gap-2">
        <input 
          value={input} onChange={e => setInput(e.target.value)}
          placeholder={t('type_message')}
          className="flex-1 bg-zinc-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-brand-primary outline-none"
        />
        <button onClick={handleSend} className="p-2 bg-brand-primary text-white rounded-xl active:scale-95"><Send size={20} /></button>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [role, setRole] = useState<Role | null>(() => storage.getCurrentUser()?.role || null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(() => storage.getCurrentUser()?.activeProfileId || null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => storage.getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showLanding, setShowLanding] = useState(() => !storage.getCurrentUser());
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(storage.getSettings());
  const [platformExpenses, setPlatformExpenses] = useState<PlatformExpense[]>(storage.getPlatformExpenses());
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [showSellerSelection, setShowSellerSelection] = useState(false);
  const [isCreatingSeller, setIsCreatingSeller] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lang') || 'pt') as Language);
  const [palette, setPalette] = useState(() => localStorage.getItem('palette') || 'dark');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  const t = (key: keyof typeof translations.pt) => {
    return translations[language][key] || translations.pt[key];
  };

  useEffect(() => {
    localStorage.setItem('lang', language);
    localStorage.setItem('palette', palette);
    
    // Apply role attribute for theme scoping
    if (role) {
      document.body.setAttribute('data-role', role);
    } else {
      document.body.removeAttribute('data-role');
    }

    // Apply palette attribute
    document.body.setAttribute('data-palette', palette);
    
    // Apply RTL if Arabic
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, palette, role]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{ id: string, name: string, price: number, quantity: number, max: number, vendorId: string }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', whatsapp: '', neighborhood: '', note: '' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [activeChatOrder, setActiveChatOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tudo');
  const [vendorFilter, setVendorFilter] = useState('Todos');
  const [reportNotes, setReportNotes] = useState('');

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setRole(user.role);
    setShowAuthModal(false);
    setShowLanding(false);
    if (user.role === 'seller' && user.activeProfileId) {
      setSelectedVendorId(user.activeProfileId);
    }
    showToast(`Bem-vindo, ${user.name}!`, 'success');
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setRole(null);
    setSelectedVendorId(null);
    setShowLanding(true);
    showToast('Sessão encerrada', 'success');
  };

  useEffect(() => {
    setSellers(storage.getAllSellers());
    if (role === 'customer') {
      setProducts(storage.getProducts());
      setOrders(storage.getOrders());
    } else if (role === 'seller' && selectedVendorId) {
      setProducts(storage.getVendorProducts(selectedVendorId));
      setOrders(storage.getVendorOrders(selectedVendorId));
    } else if (role === 'admin') {
      setProducts(storage.getProducts());
      setOrders(storage.getOrders());
      setPlatformExpenses(storage.getPlatformExpenses());
    }
  }, [role, selectedVendorId]);

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const newVal = prev + 1;
      if (newVal >= 5) {
        setRole('admin');
        setActiveTab('master-dashboard');
        return 0;
      }
      return newVal;
    });
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      showToast("Imagem muito grande! Limite de 2MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const activeSeller = useMemo(() => 
    sellers.find(s => s.id === selectedVendorId) || null
  , [sellers, selectedVendorId]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSeller) {
      storage.saveSeller(activeSeller);
      alert("Perfil atualizado!");
    }
  };

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    const newSeller: SellerProfile = {
      id: `vendor_${Date.now()}`,
      name: form.vname.value,
      phone: form.vphone.value,
      whatsapp: form.vwhatsapp.value || form.vphone.value,
      address: form.vaddress.value,
      photo: `https://picsum.photos/seed/${form.vname.value}/200`,
      commission: systemSettings.defaultCommission,
      active: true
    };
    storage.saveSeller(newSeller);
    setSellers(storage.getAllSellers());
    setSelectedVendorId(newSeller.id);
    setRole('seller');
    setIsCreatingSeller(false);
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
           alert("Estoque máximo atingido!");
           return prev;
        }
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, max: product.stock, vendorId: product.vendorId }];
    });
  };

  const handleFinishOrder = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert("Por favor, informe seu nome e telefone!");
      return;
    }

    // Split orders by vendor
    const ordersByVendor: Record<string, typeof cart> = {};
    cart.forEach(item => {
      if (!ordersByVendor[item.vendorId]) ordersByVendor[item.vendorId] = [];
      ordersByVendor[item.vendorId].push(item);
    });

    Object.entries(ordersByVendor).forEach(([vId, items]) => {
      const vTotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      const newOrder: Order = {
        id: `#${Math.floor(Math.random() * 90000) + 10000}`,
        vendorId: vId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerWhatsApp: customerInfo.whatsapp,
        neighborhood: customerInfo.neighborhood,
        note: customerInfo.note,
        items: items.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        total: vTotal,
        status: 'Pendente',
        date: new Date().toISOString()
      };
      storage.saveOrder(newOrder);
      // Optional: open chat for the first one or logic to show all
      if (Object.keys(ordersByVendor)[0] === vId) setActiveChatOrder(newOrder.id);
    });

    setOrders(role === 'seller' ? storage.getVendorOrders(selectedVendorId!) : storage.getOrders());
    setProducts(role === 'seller' ? storage.getVendorProducts(selectedVendorId!) : storage.getProducts());
    setCart([]);
    setShowCart(false);
    setCustomerInfo({ name: '', phone: '', whatsapp: '', neighborhood: '', note: '' });
    alert(`Seu(s) pedido(s) foi(foram) enviado(s) com sucesso! Enviaremos para cada vendedor.`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty > item.max) {
          alert("Estoque máximo atingido!");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Tudo' || p.category === categoryFilter;
    const matchesVendor = vendorFilter === 'Todos' || p.vendorId === vendorFilter;
    return matchesSearch && matchesCategory && matchesVendor;
  });

  const revenues = role === 'seller' && selectedVendorId ? storage.getVendorRevenues(selectedVendorId) : storage.getRevenues();
  const expenses = role === 'seller' && selectedVendorId ? storage.getVendorExpenses(selectedVendorId) : storage.getExpenses();

  const financeStats = useMemo(() => {
    // Basic stats
    const totalRevenue = revenues.reduce((a, b) => a + b.amount, 0);
    const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
    const profit = totalRevenue - totalExpenses;
    
    // Daily calculation
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyRev = revenues.filter(r => r.date.startsWith(todayStr)).reduce((a, b) => a + b.amount, 0);
    const dailyOrdersCount = orders.filter(o => o.date.startsWith(todayStr)).length;

    // Sales per product calculation for the chart
    const salesData = products.map(p => {
      const soldQty = orders.reduce((acc, order) => {
        const item = order.items.find(i => i.productId === p.id);
        return acc + (item ? item.quantity : 0);
      }, 0);
      return {
        name: p.name.length > 12 ? p.name.substring(0, 10) + '..' : p.name,
        sales: soldQty,
        stock: p.stock
      };
    });

    if (role === 'admin') {
      const globalRevenue = revenues.reduce((a, b) => a + b.amount, 0);
      const totalCommission = revenues.reduce((a, b) => a + b.platformCommission, 0);
      const totalPlatformExpenses = platformExpenses.reduce((a, b) => a + b.amount, 0);
      const adminProfit = totalCommission - totalPlatformExpenses;
      return { globalRevenue, totalCommission, totalPlatformExpenses, adminProfit, salesData, dailyRev, dailyOrdersCount };
    }
    
    return { totalRevenue, totalExpenses, profit, dailyRev, dailyOrdersCount, salesData };
  }, [revenues, expenses, platformExpenses, role, orders, products]);

  if (showLanding) {
    return <LandingNextDelivery 
      t={t} 
      onEnter={() => setShowLanding(false)} 
      onAuth={() => setShowAuthModal(true)} 
      onInstall={handleInstallApp}
      canInstall={canInstall}
    />;
  }

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0510] relative overflow-hidden text-white">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-[150px]" />
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full max-w-sm sm:max-w-md relative z-10">
          {!showSellerSelection && !isCreatingSeller ? (
            <>
              <div className="w-24 h-24 bg-gradient-to-tr from-purple-700 to-purple-500 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-[0_0_50px_rgba(147,51,234,0.3)] mb-8 rotate-3">
                <Zap size={48} className="fill-white" />
              </div>
              <h1 className="text-5xl font-black font-display text-white mb-2 tracking-tighter italic uppercase">NEXT DELIVERY</h1>
              <p className="text-purple-200/40 font-medium mb-12 tracking-wide text-xs uppercase">{t('portalMultiVendor')}</p>
              
              <div className="space-y-4">
                <Button onClick={() => setRole('customer')} fullWidth size="lg" className="h-20 sm:h-24 text-lg sm:text-xl rounded-3xl bg-brand-primary text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  <Users size={24} /> {t('enterAsCustomer')}
                </Button>
                <Button onClick={() => setShowSellerSelection(true)} variant="outline" fullWidth size="lg" className="h-20 sm:h-24 text-lg sm:text-xl rounded-3xl border-white/20 text-white hover:bg-white/5">
                  <Store size={24} /> {t('enterAsSeller')}
                </Button>

                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-4 text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Lock size={12} /> {t('loginWithEmail')}
                </button>

                {canInstall && (
                  <button 
                    onClick={handleInstallApp}
                    className="w-full mt-2 py-3 text-white/40 text-[9px] font-black uppercase tracking-[0.4em] hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5 rounded-full"
                  >
                    <Download size={10} /> Baixar App
                  </button>
                )}
              </div>
            </>
          ) : isCreatingSeller ? (
            <Card className="text-left bg-card-bg">
              <button onClick={() => setIsCreatingSeller(false)} className="mb-4 text-text-muted font-bold flex items-center gap-1 text-xs">
                <ArrowLeft size={14} /> {t('logout')}
              </button>
              <h2 className="text-xl font-black mb-6 text-text-main">{t('store_name')}</h2>
              <form onSubmit={handleCreateSeller} className="space-y-4">
                <input name="vname" placeholder={t('store_name')} className="w-full bg-brand-bg rounded-xl p-3 md:p-4 border-none text-sm font-semibold text-text-main" required />
                <input name="vphone" placeholder={t('yourPhone')} className="w-full bg-brand-bg rounded-xl p-3 md:p-4 border-none text-sm font-semibold text-text-main" required />
                <input name="vwhatsapp" placeholder={t('whatsapp_number')} className="w-full bg-brand-bg rounded-xl p-3 md:p-4 border-none text-sm font-semibold text-text-main" />
                <input name="vaddress" placeholder={t('neighborhood')} className="w-full bg-brand-bg rounded-xl p-3 md:p-4 border-none text-sm font-semibold text-text-main" required />
                <Button type="submit" fullWidth size="lg">{t('saveChanges')}</Button>
              </form>
            </Card>
          ) : (
            <Card className="text-left w-full max-h-[80vh] flex flex-col bg-card-bg border-border-main">
              <button onClick={() => setShowSellerSelection(false)} className="mb-4 text-text-muted font-bold flex items-center gap-1 text-xs">
                <ArrowLeft size={14} /> {t('logout')}
              </button>
              <h2 className="text-xl font-black mb-4 text-text-main">{t('profile')}</h2>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
                {sellers.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => { setSelectedVendorId(s.id); setRole('seller'); }}
                    className="w-full p-3 rounded-2xl border border-border-main flex items-center gap-4 hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group"
                  >
                    <img src={s.photo} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <p className="font-bold text-sm text-text-main group-hover:text-brand-primary transition-colors">{s.name}</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase">{s.phone}</p>
                    </div>
                  </button>
                ))}
                <button 
                  onClick={() => setIsCreatingSeller(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-border-main flex items-center justify-center gap-2 text-text-muted font-bold text-sm hover:border-brand-primary hover:text-brand-primary transition-all"
                >
                  <PlusCircle size={20} /> {t('add_product')}
                </button>
              </div>
            </Card>
          )}
          <p className="mt-12 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('portalMultiVendor')} • v4.0</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-20 transition-colors" data-role={role}>
      <PaletteSwitcher palette={palette} setPalette={setPalette} />
      <Header 
        role={role}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        onCartClick={() => role === 'customer' && setShowCart(true)} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sellers={sellers}
        vendorFilter={vendorFilter}
        setVendorFilter={setVendorFilter}
        onLogoClick={handleLogoClick}
        palette={palette}
        setPalette={setPalette}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {role === 'customer' && (
          <div className="space-y-8">
            {/* Category Filter */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { id: 'all', label: t('all') },
                { id: 'savory', label: t('savory') },
                { id: 'sweet', label: t('sweet') },
                { id: 'combos', label: t('combos') }
              ].map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.label)}
                  className={`px-6 py-3 rounded-full font-bold text-sm border-2 transition-all whitespace-nowrap shadow-sm ${
                    categoryFilter === cat.label ? 'bg-brand-primary border-brand-primary text-white shadow-glow' : 'bg-card-bg border-border-main text-text-muted hover:border-brand-primary/20 hover:text-brand-primary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.filter(p => p.active).map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onAdd={handleAddToCart} 
                  sellerName={sellers.find(s => s.id === p.vendorId)?.name}
                  t={t}
                />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-text-muted font-medium">{t('no_orders')}</p>
              </div>
            )}
          </div>
        )}

        {role === 'seller' && (
          <div className="space-y-6">
            {/* Back Button for Seller */}
            {activeTab !== 'dashboard' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 text-xs font-black uppercase text-brand-primary hover:translate-x-[-4px] transition-all mb-4"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
            )}

            {/* Top Bar Nav for Seller */}
            <nav className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
                { id: 'products', label: t('menu'), icon: Package },
                { id: 'stock', label: t('stock'), icon: Activity },
                { id: 'orders', label: t('orders'), icon: Send },
                { id: 'finance', label: t('finance'), icon: DollarSign },
                { id: 'reports', label: t('performance'), icon: FileText },
                { id: 'profile', label: t('profile'), icon: User },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border-2 transition-all ${
                    activeTab === tab.id ? 'bg-brand-primary border-brand-primary text-white shadow-glow' : 'bg-card-bg border-border-main text-text-muted hover:border-brand-primary/30 hover:text-brand-primary'
                  }`}
                >
                  <tab.icon size={14} /> <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
              <button 
                onClick={handleLogout}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border-2 border-red-50/50 text-red-500 hover:bg-red-50 transition-all ml-auto"
              >
                <LogOut size={14} /> {t('logout')}
              </button>
            </nav>

            <div className="min-w-0">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Card className="flex flex-col justify-between border-border-main">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t('dailySales')}</p>
                      <h3 className="text-2xl font-black mt-1 text-text-main">{systemSettings.currency} {financeStats.dailyRev}</h3>
                    </Card>
                    <Card className="flex flex-col justify-between border-border-main">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t('totalOrders')}</p>
                      <h3 className="text-2xl font-black mt-1 text-text-main">{orders.length}</h3>
                    </Card>
                    <Card className="flex flex-col justify-between border-border-main">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t('weeklySales')}</p>
                      <h3 className="text-2xl font-black mt-1 text-text-main">{systemSettings.currency} {financeStats.totalRevenue}</h3>
                    </Card>
                    <Card className="flex flex-col justify-between border-border-main">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t('dailyProfit')}</p>
                      <h3 className="text-2xl font-black mt-1 text-green-500">{systemSettings.currency} {financeStats.profit}</h3>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card className="!bg-white border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <h3 className="font-bold flex items-center gap-2 mb-4 text-blue-800"><TrendingUp size={18} className="text-blue-500" /> {t('performance')}</h3>
                        <div className="h-64 mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={financeStats.salesData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f7ff" />
                              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                              <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0f2fe', boxShadow: '0 10px 15px -3px rgba(30, 64, 175, 0.1)' }}
                                cursor={{ fill: '#f1f5f9' }}
                                itemStyle={{ color: '#1e40af', fontWeight: 'bold' }}
                              />
                              <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                                {financeStats.salesData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={index % 2 === 0 ? '#2563eb' : '#93c5fd'} 
                                    className="transition-all duration-500"
                                  />
                                ))}
                              </Bar>
                            </ReBarChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>

                      <Card className="!bg-white border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold flex items-center gap-2 text-blue-800"><FileText size={18} className="text-blue-500" /> {t('daily_report')}</h3>
                          <button 
                            onClick={() => {
                              const doc = new jsPDF();
                              const today = new Date().toLocaleDateString();
                              doc.setFontSize(22);
                              doc.text("NEXT DELIVERY - RELATORIO DIARIO", 20, 20);
                              doc.setFontSize(14);
                              doc.text(`Data: ${today}`, 20, 30);
                              doc.text(`Loja: ${activeSeller?.name || 'Vendedor'}`, 20, 40);
                              doc.text("------------------------------------------", 20, 45);
                              doc.text(`Faturamento: ${systemSettings.currency} ${financeStats.dailyRev}`, 20, 55);
                              doc.text(`Total Pedidos: ${financeStats.dailyOrdersCount}`, 20, 65);
                              doc.text("------------------------------------------", 20, 70);
                              doc.text("Resumo de Vendas por Produto:", 20, 80);
                              financeStats.salesData.forEach((p, i) => {
                                doc.text(`${p.name}: ${p.sales} vendidos (Stock: ${p.stock})`, 25, 90 + (i * 10));
                              });

                              if (reportNotes) {
                                doc.text("------------------------------------------", 20, 100 + (financeStats.salesData.length * 10));
                                doc.text("Observacoes:", 20, 110 + (financeStats.salesData.length * 10));
                                const splitNotes = doc.splitTextToSize(reportNotes, 170);
                                doc.text(splitNotes, 20, 120 + (financeStats.salesData.length * 10));
                              }

                              doc.save(`Relatorio_${today}.pdf`);
                              showToast("PDF gerado com sucesso!");
                            }}
                            className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:text-blue-800 transition-colors"
                          >
                            <FileDown size={14} /> {t('download_pdf')}
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl">
                              <p className="text-[10px] font-black text-blue-400 uppercase">{t('total_vendas_dia')}</p>
                              <p className="text-sm font-black text-blue-900">{systemSettings.currency} {financeStats.dailyRev}</p>
                            </div>
                            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl">
                              <p className="text-[10px] font-black text-blue-400 uppercase">{t('total_pedidos_dia')}</p>
                              <p className="text-sm font-black text-blue-900">{financeStats.dailyOrdersCount}</p>
                            </div>
                          </div>
                          <div className="bg-blue-50/30 border border-blue-50 p-4 rounded-2xl">
                             <h4 className="text-[10px] font-black text-blue-400 uppercase mb-2">{t('report_observations')}</h4>
                             <textarea 
                               value={reportNotes}
                               onChange={(e) => setReportNotes(e.target.value)}
                               placeholder="Digite observações para o PDF..."
                               className="w-full bg-white border border-blue-100 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-100 outline-none min-h-[80px] resize-none text-slate-700"
                             />
                          </div>

                          <div className="bg-blue-50/30 border border-blue-50 p-4 rounded-2xl">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase mb-2">Resumo de Vendas</h4>
                            <div className="space-y-2">
                              {financeStats.salesData.slice(0, 5).map(item => (
                                <div key={item.name} className="flex justify-between items-center text-xs">
                                  <span className="truncate pr-2 text-slate-600 font-medium">{item.name}</span>
                                  <span className="font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-full whitespace-nowrap">{item.sales} vendidos</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Gestão de Catálogo</h2>
                      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{products.length} Produtos Cadastrados</p>
                    </div>
                    <Button onClick={() => { setEditingProduct(null); setPreviewImage(null); setIsAddingProduct(true); }} size="sm"><Plus size={16} /> Novo Produto</Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {products.map(p => (
                      <Card key={p.id} className="relative overflow-hidden group">
                        <div className="flex gap-4">
                          <img src={p.image} className={`w-24 h-24 rounded-2xl object-cover shadow-sm ${!p.active ? 'grayscale opacity-50' : ''}`} referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                               <h4 className="font-bold truncate text-sm">{p.name}</h4>
                               <div className="flex gap-1">
                                 <button onClick={() => { setEditingProduct(p); setPreviewImage(p.image); }} className="p-2 text-zinc-400 hover:text-brand-primary hover:bg-orange-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                                 <button onClick={() => {
                                   if (confirm("Tem certeza que deseja excluir este produto?")) {
                                     const updated = storage.getProducts().filter(prod => prod.id !== p.id);
                                      storage.saveProducts(updated as any);
                                      setProducts(storage.getVendorProducts(selectedVendorId!));
                                      showToast("Produto excluído com sucesso");
                                   }
                                 }} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                               </div>
                            </div>
                            <p className="text-[10px] text-zinc-400 line-clamp-1 mb-1">{p.description}</p>
                            <p className="text-sm text-brand-primary font-black">{systemSettings.currency} {p.price}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                               <Badge color={p.active ? 'green' : 'zinc'}>{p.active ? 'Ativo' : 'Inativo'}</Badge>
                               <Badge color={p.stock === 0 ? 'red' : p.stock < 5 ? 'amber' : 'zinc'} className="flex items-center gap-1">
                                 {p.stock === 0 ? <AlertCircle size={10} /> : null}
                                 Estoque: {p.stock}
                               </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border-main flex gap-2">
                           <Button size="sm" variant="outline" fullWidth onClick={() => {
                             const newStock = prompt(t('product_stock'), p.stock.toString());
                             if (newStock !== null) {
                               storage.updateProductStock(p.id, Number(newStock));
                               setProducts(storage.getVendorProducts(selectedVendorId!));
                               showToast(t('update_stock'));
                             }
                           }}><Activity size={14} /> {t('stock')}</Button>
                           <Button size="sm" variant="ghost" fullWidth onClick={() => { setEditingProduct(p); setPreviewImage(p.image); }} className="text-text-muted hover:text-text-main"><Edit3 size={14} /> {t('edit_product')}</Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Add/Edit Modal Full Implementation */}
                  {(isAddingProduct || editingProduct) && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                       <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                       >
                          <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="text-lg font-black">{isAddingProduct ? "🚀 Novo Produto" : "📝 Editar Produto"}</h3>
                            <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><XCircle size={24} className="text-zinc-400" /></button>
                          </div>
                          
                          <form className="p-6 overflow-y-auto space-y-6" onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as any;
                            const newData = {
                              id: editingProduct?.id || `prod_${Date.now()}`,
                              vendorId: selectedVendorId!,
                              name: form.pname.value,
                              description: form.pdesc.value,
                              category: form.pcat.value,
                              price: Number(form.pprice.value),
                              stock: Number(form.pstock.value),
                              active: form.pactive.checked,
                              image: previewImage || editingProduct?.image || `https://picsum.photos/seed/${form.pname.value}/400/300`
                            };
                            const allProds = storage.getProducts();
                            const updated = isAddingProduct ? [...allProds, newData] : allProds.map(p => p.id === editingProduct?.id ? newData : p);
                            
                            storage.saveProducts(updated as any);
                            setProducts(storage.getVendorProducts(selectedVendorId!));
                            setIsAddingProduct(false); 
                            setEditingProduct(null);
                            setPreviewImage(null);
                            showToast(isAddingProduct ? "Produto criado com sucesso!" : "Produto atualizado com sucesso!");
                          }}>
                            {/* Image Upload Area */}
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Imagem do Produto</label>
                               <div 
                                className={`relative h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${
                                  isDragOver ? 'border-brand-primary bg-orange-50' : 'border-zinc-100 bg-zinc-50'
                                }`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDragOver(false);
                                  const file = e.dataTransfer.files[0];
                                  if (file) handleImageUpload(file);
                                }}
                                onClick={() => document.getElementById('fileInput')?.click()}
                               >
                                 {previewImage ? (
                                   <>
                                     <img src={previewImage} className="absolute inset-0 w-full h-full object-cover" />
                                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                        <div className="bg-white/90 p-2 rounded-full shadow-lg"><Camera size={20} className="text-zinc-900" /></div>
                                     </div>
                                   </>
                                 ) : (
                                   <>
                                     <div className="p-4 bg-white rounded-2xl shadow-sm text-brand-primary"><UploadCloud size={32} /></div>
                                     <div className="text-center">
                                       <p className="text-sm font-bold">Clique ou arraste</p>
                                       <p className="text-[10px] text-zinc-400">JPG, PNG ou WEBP (Max 2MB)</p>
                                     </div>
                                   </>
                                 )}
                                 <input id="fileInput" type="file" className="hidden" accept="image/*" onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if (file) handleImageUpload(file);
                                 }} />
                               </div>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nome do Produto</label>
                                <input name="pname" defaultValue={editingProduct?.name} placeholder="Ex: Pastel de Vento Especial" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 ring-brand-primary/20 transition-all" required />
                              </div>
                              
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Descrição</label>
                                <textarea name="pdesc" defaultValue={editingProduct?.description} placeholder="Descreva os ingredientes e detalhes..." className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-semibold h-24 focus:ring-2 ring-brand-primary/20 transition-all" required />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Categoria</label>
                                  <select name="pcat" defaultValue={editingProduct?.category} className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 ring-brand-primary/20 transition-all">
                                    <option>Salgados</option>
                                    <option>Doces</option>
                                    <option>Combos</option>
                                    <option>Bebidas</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Preço ({systemSettings.currency})</label>
                                  <input name="pprice" defaultValue={editingProduct?.price} type="number" step="0.01" placeholder="0.00" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 ring-brand-primary/20 transition-all" required />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Estoque Inicial</label>
                                  <input name="pstock" defaultValue={editingProduct?.stock} type="number" placeholder="0" className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-semibold focus:ring-2 ring-brand-primary/20 transition-all" required />
                                </div>
                                <div className="flex flex-col justify-center gap-1 px-1">
                                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status Inicial</label>
                                   <label className="flex items-center gap-3 cursor-pointer group">
                                      <div className="relative">
                                        <input type="checkbox" name="pactive" defaultChecked={editingProduct?.active ?? true} className="sr-only peer" />
                                        <div className="w-10 h-6 bg-zinc-200 peer-checked:bg-brand-primary rounded-full transition-all" />
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4 shadow-sm" />
                                      </div>
                                      <span className="text-xs font-bold text-zinc-600">Ativo para vendas</span>
                                   </label>
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2 mt-auto">
                              <Button type="button" variant="ghost" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); setPreviewImage(null); }} fullWidth size="lg">Cancelar</Button>
                              <Button type="submit" fullWidth size="lg" className="shadow-lg shadow-orange-100">Finalizar e Salvar</Button>
                            </div>
                          </form>
                       </motion.div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'stock' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h2 className="text-xl font-bold">Controle Analítico de Estoque</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                     {products.map(p => (
                       <Card key={p.id} className="flex justify-between items-center group">
                          <div className="flex items-center gap-3">
                             <div className={`w-3 h-3 rounded-full ${p.stock === 0 ? 'bg-red-500' : p.stock < 5 ? 'bg-amber-500' : 'bg-green-500'}`} />
                              <span className="font-bold text-sm tracking-tight">{p.name}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${
                                p.stock === 0 
                                  ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                  : p.stock < 5 
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                              }`}>
                                <Activity size={12} className={p.stock > 0 ? 'animate-pulse' : ''} />
                                {p.stock} UN
                              </span>
                              <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-all">
                                 <button onClick={() => { storage.updateProductStock(p.id, Math.max(0, p.stock -1)); setProducts(storage.getVendorProducts(selectedVendorId!)); }} className="p-1.5 bg-zinc-100 rounded-lg hover:bg-zinc-200 text-zinc-600 active:scale-90"><Minus size={14} /></button>
                                 <button onClick={() => { storage.updateProductStock(p.id, p.stock +1); setProducts(storage.getVendorProducts(selectedVendorId!)); }} className="p-1.5 bg-zinc-100 rounded-lg hover:bg-zinc-200 text-zinc-600 active:scale-90"><Plus size={14} /></button>
                              </div>
                           </div>
                        </Card>
                     ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h2 className="text-xl font-bold">Gerenciamento de Pedidos</h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {[...orders].reverse().map(o => (
                      <Card key={o.id} className="border-l-4 border-l-brand-primary">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                             <h4 className="font-black text-lg">{o.id}</h4>
                             <p className="text-xs text-zinc-400">{new Date(o.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {systemSettings.currency} {o.total}</p>
                           </div>
                           <div className="relative group">
                             <button className="p-1 hover:bg-zinc-100 rounded-lg"><MoreVertical size={18} /></button>
                             <div className="absolute right-0 top-full hidden group-hover:block bg-white shadow-2xl rounded-xl p-2 border border-zinc-100 z-10 w-40">
                                {(['Pendente', 'Em Preparo', 'Pronto', 'Entregue', 'Cancelado'] as OrderStatus[]).map(s => (
                                  <button 
                                   key={s} 
                                   onClick={() => { storage.updateOrderStatus(o.id, s); setOrders(storage.getVendorOrders(selectedVendorId!)); }}
                                   className="w-full text-left p-2 text-[10px] font-bold uppercase hover:bg-zinc-50 rounded-lg"
                                  >
                                    {s}
                                  </button>
                                ))}
                             </div>
                           </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                           <div className="flex items-center gap-2">
                              <Badge color={o.status === 'Pendente' ? 'amber' : o.status === 'Entregue' ? 'green' : 'blue'}>{o.status}</Badge>
                              <button onClick={() => setActiveChatOrder(o.id)} className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl"><MessageCircle size={18} /></button>
                              {o.customerPhone && (
                                <button 
                                  onClick={() => {
                                    const phone = o.customerWhatsApp || o.customerPhone;
                                    const cleanPhone = phone.replace(/\D/g, '');
                                    const text = encodeURIComponent(`Olá ${o.customerName}! Sou da loja e estou entrando em contato sobre seu pedido ${o.id}.`);
                                    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
                                  }}
                                  className="p-2 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                                >
                                  <Phone size={18} />
                                </button>
                              )}
                           </div>
                           <p className="text-[10px] font-black uppercase text-zinc-400">{o.customerName}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'finance' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Card className="bg-green-500 text-white border-none shadow-glow-sm">
                      <p className="text-[10px] font-bold uppercase opacity-80">{t('revenue')}</p>
                      <h3 className="text-2xl font-black mt-1">{systemSettings.currency} {financeStats.totalRevenue}</h3>
                    </Card>
                    <Card className="bg-red-500 text-white border-none shadow-glow-sm">
                      <p className="text-[10px] font-bold uppercase opacity-80">{t('expense')}</p>
                      <h3 className="text-2xl font-black mt-1">{systemSettings.currency} {financeStats.totalExpenses}</h3>
                    </Card>
                  </div>
                  
                    <Card className="flex justify-between items-center p-6 bg-card-bg text-text-main border-border-main col-span-full xl:col-span-2 shadow-sm border">
                     <div>
                       <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('profit')}</p>
                       <h2 className="text-4xl font-black mt-1 text-brand-primary">{systemSettings.currency} {financeStats.profit}</h2>
                     </div>
                     <Activity size={48} className="text-brand-primary opacity-20" />
                  </Card>

                  <div className="space-y-4">
                    <h3 className="font-bold text-text-main">{t('launch_expense')}</h3>
                    <form className="grid grid-cols-2 gap-3" onSubmit={e => {
                      e.preventDefault();
                      const form = e.target as any;
                      storage.saveExpense({ id: Date.now().toString(), vendorId: selectedVendorId!, category: form.ecat.value, amount: Number(form.eamt.value), date: new Date().toISOString(), observation: form.obs.value });
                      form.reset();
                      setActiveTab('finance');
                      showToast(t('saveChanges'), 'success');
                    }}>
                       <select name="ecat" className="bg-brand-bg border-none rounded-xl p-3 text-xs font-bold col-span-2 text-text-main outline-none">
                         <option value="Matéria Prima">{t('savory')}</option>
                         <option value="Marketing">{t('marketing_ads')}</option>
                         <option value="Outros">{t('all')}</option>
                       </select>
                       <input name="eamt" type="number" placeholder={`Valor MT`} className="bg-brand-bg border-none rounded-xl p-3 text-xs font-bold text-text-main outline-none" required />
                       <input name="obs" placeholder={t('observations')} className="bg-brand-bg border-none rounded-xl p-3 text-xs font-bold text-text-main outline-none" />
                       <Button type="submit" fullWidth className="col-span-2">{t('register_master_expense')}</Button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && activeSeller && (
                <motion.form 
                  onSubmit={handleUpdateProfile} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="space-y-6 max-w-2xl mx-auto"
                >
                  <div className="flex flex-col items-center">
                    <img src={activeSeller.photo} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" referrerPolicy="no-referrer" />
                    <h2 className="text-xl font-black mt-4">{activeSeller.name}</h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Sua Comissão: {activeSeller.commission}%</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-text-muted uppercase ml-1">{t('portalMultiVendor')}</label>
                        <input value={activeSeller.name} onChange={e => setSellers(prev => prev.map(s => s.id === selectedVendorId ? { ...s, name: e.target.value } : s))} className="w-full bg-brand-bg border-none rounded-xl p-3 text-sm font-semibold text-text-main outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-text-muted uppercase ml-1">{t('yourPhone')}</label>
                        <input value={activeSeller.phone} onChange={e => setSellers(prev => prev.map(s => s.id === selectedVendorId ? { ...s, phone: e.target.value } : s))} className="w-full bg-brand-bg border-none rounded-xl p-3 text-sm font-semibold text-text-main outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-text-muted uppercase ml-1">{t('observations')}</label>
                       <input value={activeSeller.address} onChange={e => setSellers(prev => prev.map(s => s.id === selectedVendorId ? { ...s, address: e.target.value } : s))} className="w-full bg-brand-bg border-none rounded-xl p-3 text-sm font-semibold text-text-main outline-none" />
                    </div>
                    <Button type="submit" fullWidth size="lg"><Save size={20} /> {t('saveChanges')}</Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

        {role === 'admin' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center bg-card-bg text-text-main p-6 rounded-3xl border border-border-main shadow-sm">
               <div>
                  <h2 className="text-2xl font-black">Admin Panel</h2>
                  <p className="text-text-muted text-xs font-bold uppercase tracking-widest">{systemSettings.platformName} Master Control</p>
               </div>
               <div className="flex items-center gap-4">
                  <TrendingUp size={32} className="text-brand-primary" />
                  <button 
                    onClick={handleLogout}
                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title={t('logout')}
                  >
                    <LogOut size={20} />
                  </button>
               </div>
            </header>

            <nav className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'master-dashboard', label: t('dashboard'), icon: BarChart3 },
                { id: 'master-sellers', label: t('seller_management'), icon: Users },
                { id: 'master-products', label: t('menu'), icon: Package },
                { id: 'master-orders', label: t('orders'), icon: Inbox },
                { id: 'master-finance', label: t('finance'), icon: DollarSign },
                { id: 'master-settings', label: t('system_settings'), icon: Activity },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border-2 transition-all ${
                    activeTab === tab.id ? 'bg-text-main border-text-main text-brand-bg shadow-sm' : 'bg-card-bg border-border-main text-text-muted hover:text-text-main'
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </nav>

            <AnimatePresence mode="wait">
               {activeTab === 'master-dashboard' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <Card className="bg-card-bg border-border-main">
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t('revenue')} Global</p>
                           <h3 className="text-2xl font-black mt-1 text-text-main">{systemSettings.currency} {financeStats.globalRevenue}</h3>
                       </Card>
                       <Card className="bg-card-bg border-border-main">
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t('total_commission')}</p>
                          <h3 className="text-2xl font-black mt-1 text-green-500 font-black">{systemSettings.currency} {financeStats.totalCommission}</h3>
                       </Card>
                       <Card className="bg-card-bg border-border-main">
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t('active_sellers')}</p>
                          <h3 className="text-2xl font-black mt-1 text-text-main">{sellers.filter(s => s.active).length}</h3>
                       </Card>
                       <Card className="bg-card-bg border-border-main">
                          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t('admin_profit')}</p>
                          <h3 className="text-2xl font-black mt-1 text-brand-primary">{systemSettings.currency} {financeStats.adminProfit}</h3>
                       </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Card>
                          <h3 className="font-bold flex items-center gap-2 mb-4"><Users size={18} /> Top Vendedores</h3>
                          <div className="space-y-4">
                             {sellers.slice(0, 5).map(s => (
                               <div key={s.id} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-3">
                                     <img src={s.photo} className="w-8 h-8 rounded-full border border-zinc-100" />
                                     <span className="font-bold">{s.name}</span>
                                  </div>
                                  <Badge color="green">MT {Math.floor(Math.random()*5000)}</Badge>
                               </div>
                             ))}
                          </div>
                       </Card>
                       <Card>
                          <h3 className="font-bold flex items-center gap-2 mb-4"><TrendingUp size={18} /> Crescimento Global</h3>
                          <div className="h-40 flex items-end gap-1">
                             {[30, 50, 45, 70, 60, 90, 85, 100].map((h, i) => (
                               <div key={i} className="flex-1 bg-brand-primary rounded-t-lg transition-all" style={{ height: `${h}%` }} />
                             ))}
                          </div>
                       </Card>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'master-sellers' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h2 className="text-xl font-bold">Gestão de Vendedores</h2>
                       <Button size="sm"><Plus size={16} /> Adicionar Vendedor</Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       {sellers.map(s => (
                         <Card key={s.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                               <img src={s.photo} className="w-14 h-14 rounded-full object-cover" />
                               <div>
                                  <h4 className="font-bold">{s.name}</h4>
                                  <p className="text-xs text-zinc-400">{s.phone} • Comissão: {s.commission}%</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="text-right mr-4">
                                  <p className="text-[10px] font-black uppercase text-zinc-400">Total Vendas</p>
                                  <p className="text-sm font-bold">MT {Math.floor(Math.random()*10000)}</p>
                               </div>
                               <Button size="sm" variant={s.active ? 'outline' : 'danger'} onClick={() => {
                                 const updated = { ...s, active: !s.active };
                                 storage.saveSeller(updated);
                                 setSellers(storage.getAllSellers());
                               }}>
                                 {s.active ? 'Ativo' : 'Inativo'}
                               </Button>
                               <Button size="sm" variant="ghost" onClick={() => {
                                 const val = prompt(`Nova comissão para ${s.name}:`, s.commission.toString());
                                 if (val) {
                                   storage.saveSeller({ ...s, commission: Number(val) });
                                   setSellers(storage.getAllSellers());
                                 }
                               }}><Edit3 size={16} /></Button>
                            </div>
                         </Card>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeTab === 'master-products' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h2 className="text-xl font-bold">Todos os Produtos ({products.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {products.map(p => (
                         <Card key={p.id} className="flex gap-4">
                            <img src={p.image} className="w-16 h-16 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between">
                                  <h4 className="font-bold truncate">{p.name}</h4>
                                  <button onClick={() => {
                                    if (confirm("Remover este produto da plataforma?")) {
                                      const updated = products.filter(prod => prod.id !== p.id);
                                      storage.saveProducts(updated);
                                      setProducts(updated);
                                    }
                                  }} className="text-red-400"><Trash2 size={16} /></button>
                               </div>
                               <p className="text-[10px] font-bold text-zinc-400 uppercase">Vendedor: {sellers.find(s => s.id === p.vendorId)?.name}</p>
                               <div className="mt-1 flex gap-2">
                                  <Badge color="zinc">Estoque: {p.stock}</Badge>
                                  <Badge color="amber">MT {p.price}</Badge>
                               </div>
                            </div>
                         </Card>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeTab === 'master-orders' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h2 className="text-xl font-bold">{t('global_order_monitor')}</h2>
                    <div className="space-y-4">
                       {[...orders].reverse().map(o => (
                         <Card key={o.id} className="flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                               <div>
                                  <Badge color="zinc">{o.vendorId}</Badge>
                                  <h4 className="font-black mt-1">{o.id}</h4>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase">{o.customerName} • {new Date(o.date).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-lg font-black text-brand-primary">MT {o.total}</p>
                                  <Badge color={o.status === 'Entregue' ? 'green' : 'amber'}>{o.status}</Badge>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <Button size="sm" fullWidth variant="outline" onClick={() => {
                                 storage.updateOrderStatus(o.id, 'Entregue');
                                 setOrders(storage.getOrders());
                               }}>Forçar Entrega</Button>
                               <Button size="sm" fullWidth variant="danger" onClick={() => {
                                 storage.updateOrderStatus(o.id, 'Cancelado');
                                 setOrders(storage.getOrders());
                               }}>Cancelar</Button>
                            </div>
                         </Card>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeTab === 'master-finance' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Card className="bg-green-600 text-white p-6">
                          <p className="text-xs font-bold uppercase opacity-80">{t('total_commission')}</p>
                          <h3 className="text-3xl font-black mt-2 text-text-main">{systemSettings.currency} {financeStats.totalCommission}</h3>
                       </Card>
                       <Card className="bg-red-600 text-white p-6">
                          <p className="text-xs font-bold uppercase opacity-80">{t('platform_expenses')}</p>
                          <h3 className="text-3xl font-black mt-2 text-text-main">{systemSettings.currency} {financeStats.totalPlatformExpenses}</h3>
                       </Card>
                    </div>

                    <Card className="bg-zinc-900 text-white flex justify-between items-center p-8">
                       <div>
                          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{t('admin_profit')}</p>
                          <h2 className="text-5xl font-black mt-2 text-brand-primary">{systemSettings.currency} {financeStats.adminProfit}</h2>
                       </div>
                    </Card>

                    <div className="space-y-4">
                       <h3 className="font-bold">{t('launch_expense')}</h3>
                       <form className="grid grid-cols-2 gap-3" onSubmit={e => {
                         e.preventDefault();
                         const form = e.target as any;
                         storage.savePlatformExpense({ id: Date.now().toString(), category: form.pcat.value, amount: Number(form.pamt.value), date: new Date().toISOString(), observation: form.pobs.value });
                         form.reset();
                         setPlatformExpenses(storage.getPlatformExpenses());
                       }}>
                          <select name="pcat" className="bg-zinc-50 border-none rounded-xl p-3 text-sm col-span-2">
                             <option>Infraestrutura / Cloud</option>
                             <option>Marketing / ADS</option>
                             <option>Taxas Bancárias</option>
                             <option>Suporte Extra</option>
                          </select>
                          <input name="pamt" type="number" placeholder="Valor MT" className="bg-zinc-50 border-none rounded-xl p-3 text-sm" required />
                          <input name="pobs" placeholder="Observações" className="bg-zinc-50 border-none rounded-xl p-3 text-sm" />
                          <Button type="submit" fullWidth className="col-span-2">Registrar Despesa Master</Button>
                       </form>
                    </div>
                 </motion.div>
               )}

               {activeTab === 'master-settings' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h2 className="text-xl font-bold">{t('system_settings')}</h2>
                    <form className="space-y-4" onSubmit={e => {
                      e.preventDefault();
                      const form = e.target as any;
                      const newSettings: SystemSettings = {
                        platformName: form.sname.value,
                        defaultCommission: Number(form.scomm.value),
                        currency: form.scurr.value,
                        theme: form.stheme.value
                      };
                      storage.saveSettings(newSettings);
                      setSystemSettings(newSettings);
                      alert("Configurações salvas com sucesso!");
                    }}>
                       <Card className="space-y-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-text-muted uppercase">{t('platform_name')}</label>
                             <input name="sname" defaultValue={systemSettings.platformName} className="w-full bg-zinc-50 rounded-xl p-3 font-bold" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-text-muted uppercase">{t('commission')}</label>
                                <input name="scomm" type="number" defaultValue={systemSettings.defaultCommission} className="w-full bg-zinc-50 rounded-xl p-3 font-bold" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-text-muted uppercase">{t('currency')}</label>
                                <input name="scurr" defaultValue={systemSettings.currency} className="w-full bg-zinc-50 rounded-xl p-3 font-bold" />
                             </div>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-zinc-400 uppercase">Tema Padrão</label>
                             <select name="stheme" defaultValue={systemSettings.theme} className="w-full bg-zinc-50 rounded-xl p-3 font-bold">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                             </select>
                          </div>
                          <Button type="submit" fullWidth size="lg">{t('saveChanges')}</Button>
                       </Card>
                    </form>

                    <div className="pt-8 space-y-4">
                       <h3 className="text-xs font-black text-text-muted uppercase tracking-widest px-1">{t('danger_actions')}</h3>
                       <Button variant="danger" fullWidth onClick={() => {
                         if (confirm("VOCÊ TEM CERTEZA? Isso deletará todos os dados da plataforma PERMANENTEMENTE.")) {
                           localStorage.clear();
                           window.location.reload();
                         }
                       }}>Resetar Todo o Sistema (Hard Reset)</Button>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 h-20 px-4 flex items-center justify-around z-[100] shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        {role === 'customer' ? (
          <>
             <button onClick={() => { setActiveTab('menu'); handleLogoClick(); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'menu' ? 'text-brand-primary translate-y-[-4px]' : 'text-zinc-400'}`}>
                <div className={`p-2 rounded-xl transition-all ${activeTab === 'menu' ? 'bg-orange-100' : ''}`}><Store size={22} className={activeTab === 'menu' ? 'fill-brand-primary' : ''} /></div>
                <span className="text-[10px] font-black uppercase tracking-tight">{t('menu')}</span>
             </button>
             <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-text-muted">
                <div className="p-2"><LogOut size={22} /></div>
                <span className="text-[10px] font-black uppercase tracking-tight">{t('logout')}</span>
             </button>
          </>
        ) : role === 'seller' ? (
          <>
             <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-zinc-900 translate-y-[-4px]' : 'text-zinc-400'}`}>
                <div className={`p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-zinc-100' : ''}`}><BarChart3 size={22} /></div>
                <span className="text-[10px] font-black uppercase tracking-tight">{t('dashboard')}</span>
             </button>
             <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'orders' ? 'text-zinc-900 translate-y-[-4px]' : 'text-zinc-400'}`}>
                <div className={`p-2 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-zinc-100' : ''}`}><Inbox size={22} /></div>
                <span className="text-[10px] font-black uppercase tracking-tight">{t('orders')}</span>
             </button>
             <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-text-muted">
                <div className="p-2"><LogOut size={22} /></div>
                <span className="text-[10px] font-black uppercase tracking-tight">{t('logout')}</span>
             </button>
          </>
        ) : null}
      </footer>

      {/* CART MODAL (CLIENT) */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[200] flex justify-end">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCart(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
             <motion.div 
               initial={{ x: '100%' }} 
               animate={{ x: 0 }} 
               exit={{ x: '100%' }} 
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-md bg-zinc-50 h-full shadow-2xl flex flex-col pt-safe"
             >
                <div className="p-6 bg-white border-b border-zinc-100 flex justify-between items-center">
                   <h2 className="text-xl font-black flex items-center gap-2 text-text-main"><ShoppingCart size={24} /> {t('cart')}</h2>
                   <button onClick={() => setShowCart(false)} className="p-2 text-zinc-400 hover:text-zinc-900"><XCircle size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                   {cart.length === 0 ? (
                     <div className="text-center py-20 flex flex-col items-center gap-4">
                        <ShoppingCart size={64} className="text-zinc-200" />
                        <p className="text-text-muted font-medium">{t('emptyCart')}</p>
                     </div>
                   ) : (
                     <>
                        <div className="space-y-4">
                           {cart.map(item => (
                             <Card key={item.id} className="flex justify-between items-center px-4 py-3">
                                <div>
                                   <p className="font-bold text-sm">{item.name}</p>
                                   <p className="text-xs text-brand-primary font-black">MT {item.price * item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-4 bg-zinc-50 rounded-xl p-1 px-2 border border-zinc-100">
                                   <button onClick={() => updateCartQty(item.id, -1)} className="text-zinc-600"><Minus size={14} /></button>
                                   <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                                   <button onClick={() => updateCartQty(item.id, 1)} className="text-zinc-600"><Plus size={14} /></button>
                                </div>
                             </Card>
                           ))}
                        </div>

                        <div className="space-y-4 mt-8">
                           <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest px-1">{t('yourData')}</h3>
                           <Card className="space-y-3">
                              <input 
                                value={customerInfo.name} 
                                onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                                placeholder={t('yourName')} 
                                className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm font-semibold" 
                              />
                              <input 
                                value={customerInfo.phone} 
                                onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                placeholder={t('yourPhone')} 
                                className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm font-semibold" 
                              />
                              <input 
                                value={customerInfo.whatsapp} 
                                onChange={e => setCustomerInfo({...customerInfo, whatsapp: e.target.value})}
                                placeholder={t('whatsapp_number')} 
                                className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm font-semibold" 
                              />
                              <input 
                                value={customerInfo.neighborhood} 
                                onChange={e => setCustomerInfo({...customerInfo, neighborhood: e.target.value})}
                                placeholder={t('neighborhood')} 
                                className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm font-semibold" 
                              />
                              <textarea 
                                value={customerInfo.note} 
                                onChange={e => setCustomerInfo({...customerInfo, note: e.target.value})}
                                placeholder={t('observations')} 
                                className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm font-semibold h-20" 
                              />
                           </Card>
                        </div>
                     </>
                   )}
                </div>

                <div className="p-6 bg-card-bg border-t border-border-main space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-text-muted uppercase">{t('subtotal')}</span>
                      <span className="text-2xl font-black text-brand-primary">{systemSettings.currency} {cart.reduce((acc, i) => acc + (i.price * i.quantity), 0)}</span>
                   </div>
                   <Button onClick={handleFinishOrder} disabled={cart.length === 0} fullWidth size="lg">{t('finishOrder')}</Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHAT PANEL */}
      {activeChatOrder && (
        <ChatPanel orderId={activeChatOrder} onClose={() => setActiveChatOrder(null)} t={t} />
      )}

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            onSuccess={handleAuthSuccess}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
              notification.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-black uppercase tracking-tight">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
