import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  const toggleLanguage = () => {
    i18n.changeLanguage(isVi ? 'en' : 'vi');
  };

  return (
    <div 
      className="relative flex items-center p-1 bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-full cursor-pointer shadow-sm w-24 h-10"
      onClick={toggleLanguage}
    >
      <motion.div
        className="absolute w-10 h-8 bg-white rounded-full shadow-sm border border-slate-100"
        animate={{ x: isVi ? 4 : 48 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      
      <div className="relative z-10 flex w-full justify-between px-3 text-xs font-bold tracking-wider">
        <span className={cn("transition-colors duration-200", isVi ? "text-cyan-600" : "text-slate-400")}>
          VI
        </span>
        <span className={cn("transition-colors duration-200", !isVi ? "text-cyan-600" : "text-slate-400")}>
          EN
        </span>
      </div>
    </div>
  );
}
