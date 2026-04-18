import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, MapPin, Store, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TranslationKey } from '../translations';
import { storage } from '../storage';
import { AuthUser, Role } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  t: (key: TranslationKey) => string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, t }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [role, setRole] = useState<Role>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [storeName, setStoreName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const user = storage.login(email, password);
      if (user) {
        onSuccess(user);
      } else {
        setError(t('invalidCredentials'));
      }
      setLoading(false);
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      setLoading(false);
      return;
    }

    if (!email || !password || !name || !phone) {
      setError(t('allFieldsRequired'));
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const userData: Omit<AuthUser, 'id'> = {
        email,
        password,
        name,
        role,
        phone,
        whatsapp: whatsapp || phone,
        neighborhood,
        storeName: role === 'seller' ? storeName : undefined
      };

      const newUser = storage.register(userData);
      
      // If it's a seller, also register as a SellerProfile for legacy compatibility
      if (role === 'seller') {
         storage.saveSeller({
           id: newUser.id,
           name: storeName || name,
           phone,
           whatsapp: whatsapp || phone,
           address: neighborhood || '',
           photo: `https://picsum.photos/seed/${newUser.id}/200`,
           commission: 10,
           active: true
         });
         newUser.activeProfileId = newUser.id;
      }

      onSuccess(newUser);
      setLoading(false);
    }, 1000);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(t('resetEmailSent'));
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
          <div>
            <h2 className="text-2xl font-black text-purple-900 lowercase italic tracking-tighter">
              {mode === 'login' ? t('login') : mode === 'register' ? t('register') : t('resetPassword')}
            </h2>
            <div className="h-1 w-10 bg-purple-600 rounded-full mt-1" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-full transition-colors">
            <X size={24} className="text-purple-900" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pt-2 overflow-y-auto custom-scrollbar">
          {mode !== 'forgot' && (
            <div className="flex gap-2 p-1 bg-purple-50 rounded-2xl mb-6">
              <button 
                onClick={() => setRole('customer')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  role === 'customer' ? 'bg-purple-600 text-white shadow-lg' : 'text-purple-400 hover:text-purple-600'
                }`}
              >
                {t('customer')}
              </button>
              <button 
                onClick={() => setRole('seller')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  role === 'seller' ? 'bg-purple-600 text-white shadow-lg' : 'text-purple-400 hover:text-purple-600'
                }`}
              >
                {t('seller')}
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
              <AlertCircle size={18} />
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600">
              <CheckCircle2 size={18} />
              <span className="text-xs font-bold">{success}</span>
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgot} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">{role === 'seller' ? t('store_name') : t('fullName')}</label>
                  <div className="relative group">
                    <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
                    <input 
                      type="text" 
                      value={role === 'seller' ? storeName : name}
                      onChange={(e) => role === 'seller' ? setStoreName(e.target.value) : setName(e.target.value)}
                      className="w-full bg-purple-50/50 border-2 border-transparent focus:border-purple-100 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-purple-900 font-bold" 
                      placeholder={role === 'seller' ? "Nome da sua loja" : "Seu nome completo"}
                      required
                    />
                  </div>
                </div>

                {role === 'seller' && (
                   <div className="space-y-1">
                    <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">{t('managerName')}</label>
                    <div className="relative group">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-purple-50/50 border-2 border-transparent focus:border-purple-100 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-purple-900 font-bold" 
                        placeholder="Nome do responsável"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                    <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Telefone</label>
                    <div className="relative group">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-purple-50/50 border-2 border-transparent focus:border-purple-100 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-purple-900 font-bold text-sm" 
                        placeholder="Ex: 84..."
                        required
                      />
                    </div>
                  </div>
                   <div className="space-y-1">
                    <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Bairro</label>
                    <div className="relative group">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
                      <input 
                        type="text" 
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full bg-purple-50/50 border-2 border-transparent focus:border-purple-100 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-purple-900 font-bold text-sm" 
                        placeholder="Ex: Matola"
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">{t('email')}</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-purple-50/50 border-2 border-transparent focus:border-purple-100 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-purple-900 font-bold" 
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">{t('password')}</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-purple-50/50 border-2 border-transparent focus:border-purple-100 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-purple-900 font-bold" 
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">{t('confirmPassword')}</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-purple-50/50 border-2 border-transparent focus:border-purple-100 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-purple-900 font-bold" 
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <button 
                type="button"
                onClick={() => setMode('forgot')}
                className="text-[10px] font-black text-purple-500 uppercase tracking-wider hover:text-purple-700 transition-colors ml-1"
              >
                {t('forgotPassword')}
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white rounded-2xl py-5 font-black uppercase tracking-[0.2em] shadow-lg shadow-purple-600/20 hover:bg-purple-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                mode === 'login' ? t('login') : mode === 'register' ? t('register') : t('resetPassword')
              )}
            </button>

            <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-[11px] font-black text-purple-400 uppercase tracking-[0.1em] hover:text-purple-600 transition-colors"
              >
                {mode === 'login' ? t('donthaveAccount') : t('alreadyHaveAccount')}{' '}
                <span className="text-purple-600">{mode === 'login' ? t('createAccount') : t('login')}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
