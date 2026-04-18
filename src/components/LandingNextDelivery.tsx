import React from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowRight, Download } from 'lucide-react';
import { TranslationKey } from '../translations';

interface NextDeliveryLandingProps {
  onEnter: () => void;
  onAuth: () => void;
  onInstall: () => void;
  canInstall: boolean;
  t: (key: TranslationKey) => string;
}

export const LandingNextDelivery: React.FC<NextDeliveryLandingProps> = ({ onEnter, onAuth, onInstall, canInstall, t }) => {
  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Cinematic Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 scale-110"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) brightness(20%)'
        }}
      />
      
      {/* Purple Glow Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-black/80 to-black z-[1]" />
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[150px] z-[2] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-900/20 rounded-full blur-[150px] z-[2]" />

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center relative z-10 w-full max-w-4xl"
      >
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-purple-700 to-purple-500 rounded-[2rem] shadow-[0_0_50px_rgba(147,51,234,0.5)] border border-purple-400/30"
        >
            <Zap size={48} className="text-white fill-white" />
        </motion.div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-4 uppercase italic">
            NEXT <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-300 to-purple-600">DELIVERY</span>
          </h1>
          
          <p className="text-white/40 text-xl md:text-2xl font-light tracking-[0.2em] mb-12 uppercase">
            {t('slogan')}
          </p>

          <div className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEnter}
              className="relative px-12 py-6 bg-white text-black font-black text-xl rounded-2xl transition-all flex items-center gap-4 mx-auto"
            >
              {t('continue')}
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            whileHover={{ opacity: 1 }}
            onClick={onAuth}
            className="mt-8 text-white text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 mx-auto"
          >
            {t('loginWithEmail')}
          </motion.button>

          {canInstall && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onInstall}
              className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Download size={14} />
              Baixar App
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Footer Details */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center opacity-30 z-10 flex-wrap gap-4">
        <div className="text-[10px] font-black text-white uppercase tracking-[0.5em]">
          Powered by Nexia Systems
        </div>
        <div className="text-[10px] font-black text-white uppercase tracking-[0.5em]">
          © 2026 Next Delivery
        </div>
      </div>
    </div>
  );
};
