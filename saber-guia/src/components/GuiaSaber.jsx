// src/components/GuiaSaber.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { saberSteps } from '../data/saberSteps';

export const GuiaSaber = () => {
  return (
    <section className="guia-saber container mx-auto p-4">
      <h1 className="title text-3xl font-bold text-center mb-6" style={{ background: 'linear-gradient(90deg, hsl(210,70%,55%), hsl(170,70%,55%))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
        Guía del método SABER
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {saberSteps.map(step => (
          <motion.div
            key={step.id}
            className="step-card p-4 rounded-xl shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}33 100%)`, color: 'white' }}
          >
            <h2 className="step-title text-xl font-semibold mb-2">{step.title}</h2>
            <p className="step-desc text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
