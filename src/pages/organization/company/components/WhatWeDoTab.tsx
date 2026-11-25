import { ArrowRight, Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { CAPABILITY_PILLARS } from '../constants';
import type { CompanyInfoState } from '../types';

interface WhatWeDoTabProps {
  companyInfo: CompanyInfoState;
}

export function WhatWeDoTab({ companyInfo }: WhatWeDoTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-10 rounded-[32px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-soft flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <h3 className="text-2xl font-black text-foreground">Our Purpose & Mission</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {companyInfo.mission ||
              'No mission statement defined yet. Use Edit Profile to configure.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-10 rounded-[32px] bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 shadow-soft flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
            <Layers size={24} />
          </div>
          <h3 className="text-2xl font-black text-foreground">Long-Term Vision</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {companyInfo.vision ||
              'No vision statement defined yet. Use Edit Profile to configure.'}
          </p>
        </motion.div>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-black text-foreground">Enterprise Solutions & Core Pillars</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CAPABILITY_PILLARS.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="p-8 rounded-[28px] bg-white border border-border-subtle shadow-soft flex flex-col justify-between gap-4 group hover:border-primary/40 transition-all">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  {capability.badge}
                </span>
                <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {capability.title}
                </h4>
                <p className="text-xs text-muted leading-relaxed">{capability.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-primary pt-2">
                <span>Explore module</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
