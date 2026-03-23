'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FIELD_LABELS, requiresPayment } from '@/lib/rules'

const C = {
  g: '#0D0F12', gold: '#D4A84F', goldLt: '#E8C06A', goldDk: '#A07830',
  silver: '#BFC3C9', smoke: '#6F737A', carbon: '#050607',
  nd: '#08090B', nl: '#141720',
}
const raised = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const insetSm = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`
const goldBox = `4px 4px 14px ${C.nd}, -2px -2px 8px ${C.nl}, 0 0 22px rgba(212,168,79,0.2)`

// ── 25 PRO Templates ───────────────────────────────────────────
const TEMPLATES = [
  // Dark Premium
  {
    id: 'vynk-dark', label: 'Vynk Dark', cat: 'Premium',
    bg: '#0D0F12', bg2: '#1a1a24', textColor: '#BFC3C9', accent: '#D4A84F', mode: 'gradient',
    overlay: `radial-gradient(ellipse 80% 60% at 20% 80%, rgba(212,168,79,0.08) 0%, transparent 60%)`,
    border: 'rgba(212,168,79,0.15)', glow: 'rgba(212,168,79,0.12)'
  },
  {
    id: 'carbon-gold', label: 'Carbon Gold', cat: 'Premium',
    bg: '#050607', bg2: '#111118', textColor: '#D4A84F', accent: '#D4A84F', mode: 'gradient',
    overlay: `linear-gradient(135deg, rgba(212,168,79,0.06) 0%, transparent 50%, rgba(212,168,79,0.03) 100%)`,
    border: 'rgba(212,168,79,0.25)', glow: 'rgba(212,168,79,0.18)'
  },
  {
    id: 'obsidian', label: 'Obsidian', cat: 'Premium',
    bg: '#080810', bg2: '#0f0f1e', textColor: '#e8e8f8', accent: '#818cf8', mode: 'gradient',
    overlay: `radial-gradient(circle at 80% 20%, rgba(129,140,248,0.12) 0%, transparent 50%)`,
    border: 'rgba(129,140,248,0.15)', glow: 'rgba(129,140,248,0.1)'
  },
  {
    id: 'midnight-pro', label: 'Midnight Pro', cat: 'Premium',
    bg: '#0a0a1e', bg2: '#1a1a3e', textColor: '#e8e8f0', accent: '#6366f1', mode: 'gradient',
    overlay: `conic-gradient(from 180deg at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 60%)`,
    border: 'rgba(99,102,241,0.2)', glow: 'rgba(99,102,241,0.12)'
  },
  {
    id: 'phantom', label: 'Phantom', cat: 'Premium',
    bg: '#0a0a0a', bg2: '#1a0a1a', textColor: '#f0e8f8', accent: '#c084fc', mode: 'gradient',
    overlay: `radial-gradient(ellipse 60% 80% at 80% 0%, rgba(192,132,252,0.1) 0%, transparent 60%)`,
    border: 'rgba(192,132,252,0.15)', glow: 'rgba(192,132,252,0.1)'
  },

  // Metal & Texture
  {
    id: 'titanium', label: 'Titanium', cat: 'Metal',
    bg: '#1c1c20', bg2: '#2a2a30', textColor: '#e8eaed', accent: '#9aa0a6', mode: 'gradient',
    overlay: `repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 8px)`,
    border: 'rgba(154,160,166,0.2)', glow: 'rgba(154,160,166,0.08)'
  },
  {
    id: 'steel', label: 'Steel Blue', cat: 'Metal',
    bg: '#0f172a', bg2: '#1e3a5f', textColor: '#e2e8f0', accent: '#38bdf8', mode: 'gradient',
    overlay: `linear-gradient(180deg, rgba(56,189,248,0.06) 0%, transparent 100%)`,
    border: 'rgba(56,189,248,0.15)', glow: 'rgba(56,189,248,0.1)'
  },
  {
    id: 'chrome', label: 'Chrome', cat: 'Metal',
    bg: '#12131a', bg2: '#1e2030', textColor: '#BFC3C9', accent: '#BFC3C9', mode: 'gradient',
    overlay: `linear-gradient(135deg, rgba(191,195,201,0.08) 0%, transparent 40%, rgba(191,195,201,0.04) 100%)`,
    border: 'rgba(191,195,201,0.15)', glow: 'rgba(191,195,201,0.08)'
  },
  {
    id: 'copper', label: 'Copper', cat: 'Metal',
    bg: '#1a0e08', bg2: '#2d1a0e', textColor: '#fde8d0', accent: '#c2855a', mode: 'gradient',
    overlay: `radial-gradient(circle at 30% 70%, rgba(194,133,90,0.12) 0%, transparent 50%)`,
    border: 'rgba(194,133,90,0.2)', glow: 'rgba(194,133,90,0.12)'
  },
  {
    id: 'platinum', label: 'Platinum', cat: 'Metal',
    bg: '#f0f0f5', bg2: '#e0e0ea', textColor: '#1a1a2e', accent: '#1a1a2e', mode: 'gradient',
    overlay: `linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%)`,
    border: 'rgba(26,26,46,0.1)', glow: 'rgba(26,26,46,0.05)'
  },

  // Nature & Organic
  {
    id: 'forest-pro', label: 'Forest', cat: 'Nature',
    bg: '#022c22', bg2: '#064e3b', textColor: '#ecfdf5', accent: '#4ade80', mode: 'gradient',
    overlay: `radial-gradient(ellipse 100% 60% at 50% 100%, rgba(74,222,128,0.08) 0%, transparent 60%)`,
    border: 'rgba(74,222,128,0.15)', glow: 'rgba(74,222,128,0.1)'
  },
  {
    id: 'ocean-deep', label: 'Ocean Deep', cat: 'Nature',
    bg: '#0c1445', bg2: '#1a237e', textColor: '#e3f2fd', accent: '#29b6f6', mode: 'gradient',
    overlay: `repeating-linear-gradient(0deg, rgba(41,182,246,0.03) 0px, rgba(41,182,246,0.03) 1px, transparent 1px, transparent 20px)`,
    border: 'rgba(41,182,246,0.15)', glow: 'rgba(41,182,246,0.1)'
  },
  {
    id: 'aurora', label: 'Aurora', cat: 'Nature',
    bg: '#0a1628', bg2: '#0d2137', textColor: '#e0f7fa', accent: '#4dd0e1', mode: 'gradient',
    overlay: `linear-gradient(135deg, rgba(77,208,225,0.08) 0%, rgba(129,212,250,0.06) 50%, rgba(165,214,167,0.06) 100%)`,
    border: 'rgba(77,208,225,0.15)', glow: 'rgba(77,208,225,0.1)'
  },
  {
    id: 'volcanic', label: 'Volcanic', cat: 'Nature',
    bg: '#1a0500', bg2: '#3d0a00', textColor: '#fff3e0', accent: '#ff7043', mode: 'gradient',
    overlay: `radial-gradient(circle at 50% 100%, rgba(255,112,67,0.15) 0%, transparent 60%)`,
    border: 'rgba(255,112,67,0.2)', glow: 'rgba(255,112,67,0.12)'
  },
  {
    id: 'rose-gold', label: 'Rose Gold', cat: 'Nature',
    bg: '#1a0814', bg2: '#2d1020', textColor: '#fce4ec', accent: '#f48fb1', mode: 'gradient',
    overlay: `radial-gradient(ellipse 80% 80% at 20% 20%, rgba(244,143,177,0.1) 0%, transparent 60%)`,
    border: 'rgba(244,143,177,0.15)', glow: 'rgba(244,143,177,0.1)'
  },

  // Geometric & Abstract
  {
    id: 'circuit', label: 'Circuit', cat: 'Tech',
    bg: '#001a0e', bg2: '#003320', textColor: '#00ff88', accent: '#00ff88', mode: 'gradient',
    overlay: `repeating-linear-gradient(90deg, rgba(0,255,136,0.03) 0px, rgba(0,255,136,0.03) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(0deg, rgba(0,255,136,0.03) 0px, rgba(0,255,136,0.03) 1px, transparent 1px, transparent 40px)`,
    border: 'rgba(0,255,136,0.2)', glow: 'rgba(0,255,136,0.12)'
  },
  {
    id: 'holographic', label: 'Holographic', cat: 'Tech',
    bg: '#0d0d1a', bg2: '#1a0d2e', textColor: '#f0e8ff', accent: '#c084fc', mode: 'gradient',
    overlay: `linear-gradient(135deg, rgba(192,132,252,0.1) 0%, rgba(56,189,248,0.08) 33%, rgba(74,222,128,0.08) 66%, rgba(251,191,36,0.1) 100%)`,
    border: 'rgba(192,132,252,0.2)', glow: 'rgba(192,132,252,0.12)'
  },
  {
    id: 'neon-noir', label: 'Neon Noir', cat: 'Tech',
    bg: '#050510', bg2: '#0a0a20', textColor: '#f0f0ff', accent: '#00f0ff', mode: 'gradient',
    overlay: `radial-gradient(circle at 50% 50%, rgba(0,240,255,0.05) 0%, transparent 70%)`,
    border: 'rgba(0,240,255,0.2)', glow: 'rgba(0,240,255,0.15)'
  },
  {
    id: 'matrix', label: 'Matrix', cat: 'Tech',
    bg: '#000800', bg2: '#001200', textColor: '#00ff41', accent: '#00ff41', mode: 'gradient',
    overlay: `repeating-linear-gradient(180deg, rgba(0,255,65,0.02) 0px, rgba(0,255,65,0.02) 2px, transparent 2px, transparent 8px)`,
    border: 'rgba(0,255,65,0.2)', glow: 'rgba(0,255,65,0.1)'
  },
  {
    id: 'diamond', label: 'Diamond', cat: 'Tech',
    bg: '#0a0a14', bg2: '#14142a', textColor: '#f0f8ff', accent: '#67e8f9', mode: 'gradient',
    overlay: `repeating-linear-gradient(45deg, rgba(103,232,249,0.03) 0px, rgba(103,232,249,0.03) 1px, transparent 1px, transparent 14px)`,
    border: 'rgba(103,232,249,0.15)', glow: 'rgba(103,232,249,0.1)'
  },

  // Classic & Minimal
  {
    id: 'pure-black', label: 'Pure Black', cat: 'Classic',
    bg: '#000000', bg2: '#0a0a0a', textColor: '#ffffff', accent: '#D4A84F', mode: 'solid',
    overlay: 'none', border: 'rgba(212,168,79,0.1)', glow: 'rgba(212,168,79,0.05)'
  },
  {
    id: 'ivory', label: 'Ivory', cat: 'Classic',
    bg: '#faf8f5', bg2: '#f0ece5', textColor: '#1a1a1a', accent: '#8b6914', mode: 'solid',
    overlay: `linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 60%)`,
    border: 'rgba(139,105,20,0.1)', glow: 'rgba(139,105,20,0.05)'
  },
  {
    id: 'slate', label: 'Slate', cat: 'Classic',
    bg: '#1e293b', bg2: '#334155', textColor: '#f1f5f9', accent: '#94a3b8', mode: 'gradient',
    overlay: 'none', border: 'rgba(148,163,184,0.1)', glow: 'rgba(148,163,184,0.05)'
  },
  {
    id: 'royal-blue', label: 'Royal Blue', cat: 'Classic',
    bg: '#1e1b4b', bg2: '#312e81', textColor: '#ede9fe', accent: '#a78bfa', mode: 'gradient',
    overlay: `radial-gradient(ellipse 60% 40% at 80% 20%, rgba(167,139,250,0.15) 0%, transparent 60%)`,
    border: 'rgba(167,139,250,0.15)', glow: 'rgba(167,139,250,0.1)'
  },
  {
    id: 'sunset', label: 'Sunset', cat: 'Classic',
    bg: '#1a0a00', bg2: '#2d1a00', textColor: '#fff7ed', accent: '#fb923c', mode: 'gradient',
    overlay: `linear-gradient(135deg, rgba(251,146,60,0.1) 0%, rgba(239,68,68,0.08) 100%)`,
    border: 'rgba(251,146,60,0.15)', glow: 'rgba(251,146,60,0.1)'
  },
  {
    id: 'void', label: 'Void', cat: 'Premium',
    bg: '#000000', bg2: '#050510', textColor: '#ffffff', accent: '#D4A84F', mode: 'gradient',
    overlay: `radial-gradient(circle at 20% 50%, rgba(212,168,79,0.06) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(212,168,79,0.04) 0%, transparent 40%), radial-gradient(circle at 50% 100%, rgba(212,168,79,0.08) 0%, transparent 50%)`,
    border: 'rgba(212,168,79,0.2)', glow: 'rgba(212,168,79,0.1)'
  },

  {
    id: 'abyss', label: 'Abyss', cat: 'Premium',
    bg: '#020208', bg2: '#0a0a18', textColor: '#e0e0ff', accent: '#7c83ff', mode: 'gradient',
    overlay: `repeating-conic-gradient(rgba(124,131,255,0.03) 0deg, transparent 1deg, transparent 29deg, rgba(124,131,255,0.03) 30deg)`,
    border: 'rgba(124,131,255,0.12)', glow: 'rgba(124,131,255,0.08)'
  },

  {
    id: 'eclipse', label: 'Eclipse', cat: 'Premium',
    bg: '#08060e', bg2: '#120a1e', textColor: '#f0e8ff', accent: '#b060ff', mode: 'gradient',
    overlay: `radial-gradient(ellipse 120% 80% at 110% 50%, rgba(176,96,255,0.12) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at -10% 50%, rgba(176,96,255,0.06) 0%, transparent 50%)`,
    border: 'rgba(176,96,255,0.15)', glow: 'rgba(176,96,255,0.1)'
  },

  {
    id: 'sovereign', label: 'Sovereign', cat: 'Premium',
    bg: '#0a0800', bg2: '#1a1400', textColor: '#fff8e0', accent: '#fbbf24', mode: 'gradient',
    overlay: `repeating-linear-gradient(60deg, rgba(251,191,36,0.025) 0px, rgba(251,191,36,0.025) 1px, transparent 1px, transparent 30px), repeating-linear-gradient(-60deg, rgba(251,191,36,0.015) 0px, rgba(251,191,36,0.015) 1px, transparent 1px, transparent 30px)`,
    border: 'rgba(251,191,36,0.15)', glow: 'rgba(251,191,36,0.1)'
  },

  {
    id: 'zenith', label: 'Zenith', cat: 'Premium',
    bg: '#030310', bg2: '#08081e', textColor: '#e8f0ff', accent: '#60a5fa', mode: 'gradient',
    overlay: `radial-gradient(ellipse 200% 100% at 50% 100%, rgba(96,165,250,0.08) 0%, transparent 60%), linear-gradient(180deg, transparent 0%, rgba(96,165,250,0.04) 100%)`,
    border: 'rgba(96,165,250,0.12)', glow: 'rgba(96,165,250,0.08)'
  },

  // ── METAL (5 nuevos) ───────────────────────────────────────────
  {
    id: 'tungsten', label: 'Tungsten', cat: 'Metal',
    bg: '#0f0f12', bg2: '#1e1e24', textColor: '#d0d4dc', accent: '#8892a4', mode: 'gradient',
    overlay: `repeating-linear-gradient(0deg, rgba(136,146,164,0.02) 0px, rgba(136,146,164,0.02) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, rgba(136,146,164,0.02) 0px, rgba(136,146,164,0.02) 1px, transparent 1px, transparent 4px)`,
    border: 'rgba(136,146,164,0.15)', glow: 'rgba(136,146,164,0.06)'
  },

  {
    id: 'gold-leaf', label: 'Gold Leaf', cat: 'Metal',
    bg: '#1a1000', bg2: '#2a1a00', textColor: '#fff8e8', accent: '#D4A84F', mode: 'gradient',
    overlay: `repeating-linear-gradient(45deg, rgba(212,168,79,0.03) 0px, rgba(212,168,79,0.03) 1px, transparent 1px, transparent 6px), repeating-linear-gradient(-45deg, rgba(212,168,79,0.02) 0px, rgba(212,168,79,0.02) 1px, transparent 1px, transparent 6px)`,
    border: 'rgba(212,168,79,0.2)', glow: 'rgba(212,168,79,0.12)'
  },

  {
    id: 'nickel', label: 'Nickel', cat: 'Metal',
    bg: '#141418', bg2: '#1e1e24', textColor: '#c8ccd4', accent: '#a0a8b8', mode: 'gradient',
    overlay: `radial-gradient(ellipse 150% 100% at 50% 0%, rgba(160,168,184,0.08) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 50% 100%, rgba(160,168,184,0.05) 0%, transparent 50%)`,
    border: 'rgba(160,168,184,0.12)', glow: 'rgba(160,168,184,0.06)'
  },

  {
    id: 'bronze', label: 'Bronze', cat: 'Metal',
    bg: '#140c06', bg2: '#241408', textColor: '#f4e4c8', accent: '#cd7f32', mode: 'gradient',
    overlay: `linear-gradient(135deg, rgba(205,127,50,0.08) 0%, transparent 40%, rgba(205,127,50,0.05) 70%, transparent 100%), radial-gradient(circle at 80% 80%, rgba(205,127,50,0.1) 0%, transparent 40%)`,
    border: 'rgba(205,127,50,0.18)', glow: 'rgba(205,127,50,0.1)'
  },

  {
    id: 'iridium', label: 'Iridium', cat: 'Metal',
    bg: '#080c14', bg2: '#101828', textColor: '#e0e8f8', accent: '#4488cc', mode: 'gradient',
    overlay: `linear-gradient(135deg, rgba(68,136,204,0.06) 0%, rgba(100,180,255,0.04) 50%, rgba(68,136,204,0.08) 100%)`,
    border: 'rgba(68,136,204,0.15)', glow: 'rgba(68,136,204,0.08)'
  },

  // ── NATURE (5 nuevos) ──────────────────────────────────────────
  {
    id: 'nebula', label: 'Nebula', cat: 'Nature',
    bg: '#06010f', bg2: '#10022a', textColor: '#f0e8ff', accent: '#d08aff', mode: 'gradient',
    overlay: `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(208,138,255,0.1) 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(100,160,255,0.08) 0%, transparent 50%), radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255,180,100,0.04) 0%, transparent 40%)`,
    border: 'rgba(208,138,255,0.15)', glow: 'rgba(208,138,255,0.1)'
  },

  {
    id: 'arctic', label: 'Arctic', cat: 'Nature',
    bg: '#e8f4f8', bg2: '#d0e8f4', textColor: '#1a2a3a', accent: '#2a6a9a', mode: 'gradient',
    overlay: `linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%), radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
    border: 'rgba(42,106,154,0.12)', glow: 'rgba(42,106,154,0.06)'
  },

  {
    id: 'jungle', label: 'Jungle', cat: 'Nature',
    bg: '#010a04', bg2: '#02140a', textColor: '#e0f4e8', accent: '#2ecc71', mode: 'gradient',
    overlay: `radial-gradient(circle at 30% 20%, rgba(46,204,113,0.08) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(46,204,113,0.06) 0%, transparent 40%), repeating-linear-gradient(60deg, rgba(46,204,113,0.015) 0px, rgba(46,204,113,0.015) 1px, transparent 1px, transparent 20px)`,
    border: 'rgba(46,204,113,0.15)', glow: 'rgba(46,204,113,0.08)'
  },

  {
    id: 'dusk', label: 'Dusk', cat: 'Nature',
    bg: '#0e0618', bg2: '#1a0828', textColor: '#ffe8f0', accent: '#ff6b9d', mode: 'gradient',
    overlay: `linear-gradient(180deg, rgba(255,107,157,0.06) 0%, rgba(255,150,50,0.08) 50%, rgba(255,200,100,0.04) 100%)`,
    border: 'rgba(255,107,157,0.15)', glow: 'rgba(255,107,157,0.1)'
  },

  {
    id: 'glacial', label: 'Glacial', cat: 'Nature',
    bg: '#010810', bg2: '#021020', textColor: '#e0f0ff', accent: '#60c8f0', mode: 'gradient',
    overlay: `repeating-linear-gradient(30deg, rgba(96,200,240,0.025) 0px, rgba(96,200,240,0.025) 1px, transparent 1px, transparent 25px), repeating-linear-gradient(-30deg, rgba(96,200,240,0.015) 0px, rgba(96,200,240,0.015) 1px, transparent 1px, transparent 25px)`,
    border: 'rgba(96,200,240,0.15)', glow: 'rgba(96,200,240,0.08)'
  },

  // ── TECH (5 nuevos) ────────────────────────────────────────────
  {
    id: 'fibonacci', label: 'Fibonacci', cat: 'Tech',
    bg: '#060810', bg2: '#0c1020', textColor: '#e0e8ff', accent: '#6080ff', mode: 'gradient',
    overlay: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(96,128,255,0.03) 21%, rgba(96,128,255,0.03) 22%, transparent 23%), radial-gradient(circle at 50% 50%, transparent 35%, rgba(96,128,255,0.025) 36%, rgba(96,128,255,0.025) 37%, transparent 38%), radial-gradient(circle at 50% 50%, transparent 55%, rgba(96,128,255,0.02) 56%, rgba(96,128,255,0.02) 57%, transparent 58%)`,
    border: 'rgba(96,128,255,0.12)', glow: 'rgba(96,128,255,0.08)'
  },

  {
    id: 'binary', label: 'Binary', cat: 'Tech',
    bg: '#000a04', bg2: '#001408', textColor: '#80ff80', accent: '#40ff80', mode: 'gradient',
    overlay: `repeating-linear-gradient(90deg, rgba(64,255,128,0.02) 0px, rgba(64,255,128,0.02) 8px, transparent 8px, transparent 16px), repeating-linear-gradient(0deg, rgba(64,255,128,0.015) 0px, rgba(64,255,128,0.015) 1px, transparent 1px, transparent 12px)`,
    border: 'rgba(64,255,128,0.15)', glow: 'rgba(64,255,128,0.08)'
  },

  {
    id: 'quantum', label: 'Quantum', cat: 'Tech',
    bg: '#040810', bg2: '#081020', textColor: '#c0e8ff', accent: '#00c8ff', mode: 'gradient',
    overlay: `radial-gradient(circle at 25% 25%, rgba(0,200,255,0.06) 0%, transparent 30%), radial-gradient(circle at 75% 75%, rgba(0,200,255,0.06) 0%, transparent 30%), radial-gradient(circle at 75% 25%, rgba(0,200,255,0.04) 0%, transparent 30%), radial-gradient(circle at 25% 75%, rgba(0,200,255,0.04) 0%, transparent 30%)`,
    border: 'rgba(0,200,255,0.15)', glow: 'rgba(0,200,255,0.1)'
  },

  {
    id: 'neural', label: 'Neural', cat: 'Tech',
    bg: '#060408', bg2: '#0e080e', textColor: '#f0c8ff', accent: '#c040ff', mode: 'gradient',
    overlay: `radial-gradient(circle at 20% 50%, rgba(192,64,255,0.05) 0%, transparent 25%), radial-gradient(circle at 80% 50%, rgba(192,64,255,0.05) 0%, transparent 25%), radial-gradient(circle at 50% 20%, rgba(192,64,255,0.04) 0%, transparent 25%), radial-gradient(circle at 50% 80%, rgba(192,64,255,0.04) 0%, transparent 25%)`,
    border: 'rgba(192,64,255,0.12)', glow: 'rgba(192,64,255,0.08)'
  },

  {
    id: 'waveform', label: 'Waveform', cat: 'Tech',
    bg: '#020810', bg2: '#040e1e', textColor: '#c0e8ff', accent: '#0088ff', mode: 'gradient',
    overlay: `repeating-linear-gradient(0deg, transparent 0px, transparent 9px, rgba(0,136,255,0.025) 9px, rgba(0,136,255,0.025) 10px), radial-gradient(ellipse 80% 20% at 50% 30%, rgba(0,136,255,0.06) 0%, transparent 100%), radial-gradient(ellipse 60% 20% at 50% 60%, rgba(0,136,255,0.04) 0%, transparent 100%)`,
    border: 'rgba(0,136,255,0.15)', glow: 'rgba(0,136,255,0.1)'
  },

  // ── CLASSIC (5 nuevos) ─────────────────────────────────────────
  {
    id: 'noir', label: 'Noir', cat: 'Classic',
    bg: '#080808', bg2: '#141414', textColor: '#e8e8e8', accent: '#e8e8e8', mode: 'gradient',
    overlay: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
    border: 'rgba(255,255,255,0.08)', glow: 'rgba(255,255,255,0.04)'
  },

  {
    id: 'parchment', label: 'Parchment', cat: 'Classic',
    bg: '#f5f0e8', bg2: '#ede4d0', textColor: '#2a2010', accent: '#8b6914', mode: 'solid',
    overlay: `repeating-linear-gradient(45deg, rgba(139,105,20,0.03) 0px, rgba(139,105,20,0.03) 1px, transparent 1px, transparent 8px)`,
    border: 'rgba(139,105,20,0.12)', glow: 'rgba(139,105,20,0.04)'
  },

  {
    id: 'bordeaux', label: 'Bordeaux', cat: 'Classic',
    bg: '#1a0008', bg2: '#2d0010', textColor: '#ffe8f0', accent: '#ff6080', mode: 'gradient',
    overlay: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,96,128,0.08) 0%, transparent 60%)`,
    border: 'rgba(255,96,128,0.12)', glow: 'rgba(255,96,128,0.08)'
  },

  {
    id: 'verdant', label: 'Verdant', cat: 'Classic',
    bg: '#040e06', bg2: '#081808', textColor: '#e0f0e4', accent: '#60c880', mode: 'gradient',
    overlay: `linear-gradient(160deg, rgba(96,200,128,0.06) 0%, transparent 40%, rgba(96,200,128,0.04) 80%, transparent 100%)`,
    border: 'rgba(96,200,128,0.12)', glow: 'rgba(96,200,128,0.06)'
  },

  {
    id: 'cobalt', label: 'Cobalt', cat: 'Classic',
    bg: '#000818', bg2: '#001028', textColor: '#e0eeff', accent: '#4080ff', mode: 'gradient',
    overlay: `linear-gradient(135deg, rgba(64,128,255,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(64,128,255,0.08) 0%, transparent 40%)`,
    border: 'rgba(64,128,255,0.15)', glow: 'rgba(64,128,255,0.08)'
  },

]

const CATS = [...new Set(TEMPLATES.map(t => t.cat))]

const FONTS = [
  { id: 'dm', name: 'DM Sans', css: "'DM Sans',sans-serif" },
  { id: 'syne', name: 'Syne', css: "'Syne',sans-serif" },
  { id: 'playfair', name: 'Playfair', css: "'Playfair Display',serif" },
  { id: 'cormorant', name: 'Cormorant', css: "'Cormorant Garamond',serif" },
  { id: 'bebas', name: 'Bebas Neue', css: "'Bebas Neue',cursive" },
  { id: 'josefin', name: 'Josefin', css: "'Josefin Sans',sans-serif" },
]

type Form = {
  fullName: string; title: string; company: string; photoUrl: string; logoUrl: string;
  phone: string; whatsapp: string; email: string; tagline: string; bio: string;
  services: string; telegram: string; instagram: string; linkedin: string;
  twitter: string; tiktok: string; youtube: string; website: string; address: string;
}
type Design = { template: string; font: string; mode: string; bg: string; bg2: string; textColor: string; accent: string }
type Pos = { x: number; y: number }

const INIT_FORM: Form = {
  fullName: '', title: '', company: '', photoUrl: '', logoUrl: '', phone: '', whatsapp: '',
  email: '', tagline: '', bio: '', services: '', telegram: '', instagram: '', linkedin: '',
  twitter: '', tiktok: '', youtube: '', website: '', address: '',
}
const INIT_DESIGN: Design = {
  template: 'vynk-dark', font: 'dm', mode: 'gradient',
  bg: '#0D0F12', bg2: '#1a1a24', textColor: '#BFC3C9', accent: '#D4A84F',
}

const nmInp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: C.g, boxShadow: insetSm,
  border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', color: C.silver,
  fontFamily: "'DM Sans',sans-serif", fontSize: '13px', outline: 'none',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '10px', color: C.smoke,
  marginBottom: '5px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' as const,
}

export default function BuilderPage() {
  const router = useRouter()
  const photoRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<Form>(INIT_FORM)
  const [design, setDesign] = useState<Design>(INIT_DESIGN)
  const [originalForm, setOriginal] = useState<Form | null>(null)
  const [existingCard, setExisting] = useState<any>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoValid, setPromoValid] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [paidChanges, setPaidChanges] = useState<string[]>([])
  const [activeCat, setActiveCat] = useState('Premium')
  const [activeTab, setActiveTab] = useState<'front' | 'back' | 'design'>('front')

  // Draggable positions for photo and logo
  const [photoPos, setPhotoPos] = useState<Pos>({ x: 70, y: 12 })
  const [logoPos, setLogoPos] = useState<Pos>({ x: 12, y: 70 })
  const [dragging, setDragging] = useState<'photo' | 'logo' | null>(null)
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    fetch('/api/cards').then(r => r.json()).then(d => {
      if (!d.card) return
      setExisting(d.card)
      const c = d.card
      const f: Form = {
        fullName: c.fullName || '', title: c.title || '', company: c.company || '',
        photoUrl: c.photoUrl || '', logoUrl: c.logoUrl || '', phone: c.phone || '',
        whatsapp: c.whatsapp || '', email: c.email || '', tagline: c.tagline || '',
        bio: c.bio || '', services: (c.services || []).join(', '),
        telegram: c.telegram || '', instagram: c.instagram || '', linkedin: c.linkedin || '',
        twitter: c.twitter || '', tiktok: c.tiktok || '', youtube: c.youtube || '',
        website: c.website || '', address: c.address || '',
      }
      setForm(f); setOriginal(f)
      if (c.design) setDesign(c.design)
    }).catch(() => { })
  }, [])

  // Drag handlers
  const startDrag = useCallback((e: React.MouseEvent, type: 'photo' | 'logo') => {
    e.preventDefault(); e.stopPropagation()
    const pos = type === 'photo' ? photoPos : logoPos
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y }
    setDragging(type)
  }, [photoPos, logoPos])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const dx = ((e.clientX - dragStart.current.mx) / rect.width) * 100
      const dy = ((e.clientY - dragStart.current.my) / rect.height) * 100
      const nx = Math.max(0, Math.min(80, dragStart.current.ox + dx))
      const ny = Math.max(0, Math.min(80, dragStart.current.oy + dy))
      if (dragging === 'photo') setPhotoPos({ x: nx, y: ny })
      else setLogoPos({ x: nx, y: ny })
    }
    const onUp = () => { setDragging(null); dragStart.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging])

  const set = (k: keyof Form, v: string) => setForm(f => ({ ...f, [k]: v }))
  const setD = (k: keyof Design, v: string) => setDesign(d => ({ ...d, [k]: v }))

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setDesign(d => ({ ...d, template: t.id, bg: t.bg, bg2: t.bg2, textColor: t.textColor, accent: t.accent, mode: t.mode }))
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'logoUrl') {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    const reader = new FileReader()
    reader.onload = ev => set(field, ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function validatePromo() {
    if (!promoCode.trim()) return
    const res = await fetch(`/api/promos/validate?code=${promoCode.trim()}`)
    const data = await res.json()
    setPromoValid(data.valid)
    data.valid ? toast.success('Promo applied!') : toast.error(data.error || 'Invalid code')
  }

  async function submit(confirmed = false) {
    if (!form.fullName.trim()) { toast.error('Full name is required'); return }
    if (existingCard && !confirmed && originalForm) {
      const changed = (Object.keys(form) as (keyof Form)[]).filter(k => form[k] !== originalForm[k])
      const paid = changed.filter(k => requiresPayment([k]))
      if (paid.length > 0) { setPaidChanges(paid); setShowWarning(true); return }
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/cards', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, services: form.services.split(',').map(s => s.trim()).filter(Boolean), design, promoCode: promoValid ? promoCode : undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      if (data.free) { toast.success('Card published!'); router.push(`/c/${data.slug}`) }
      else if (data.url) { window.location.href = data.url }
    } catch (e: any) { toast.error(e.message) }
    finally { setSubmitting(false) }
  }

  const tpl = TEMPLATES.find(t => t.id === design.template) || TEMPLATES[0]
  const cardBg = design.mode === 'gradient'
    ? `linear-gradient(135deg,${design.bg},${design.bg2})`
    : design.bg
  const fontCss = FONTS.find(f => f.id === design.font)?.css || FONTS[0].css
  const initials = form.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'YN'

  const tabBtn = (id: 'front' | 'back' | 'design', label: string) => (
    <button onClick={() => setActiveTab(id)}
      style={{
        flex: 1, padding: '9px', borderRadius: '10px', border: 'none',
        background: activeTab === id ? `rgba(212,168,79,0.1)` : C.g,
        boxShadow: activeTab === id ? insetSm : raisedSm,
        color: activeTab === id ? C.gold : C.smoke,
        fontSize: '12px', fontWeight: activeTab === id ? 700 : 400,
        cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all .15s',
        borderBottom: activeTab === id ? `1px solid rgba(212,168,79,0.2)` : '1px solid transparent',
      }}>
      {label}
    </button>
  )

  return (
    <div style={{ height: '100dvh', background: C.g, display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans',sans-serif", overflow: 'hidden' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: C.g, boxShadow: `0 4px 16px ${C.nd}`, borderBottom: '1px solid rgba(255,255,255,0.03)', flexShrink: 0 }}>
        <div style={{ padding: '8px 14px', background: C.g, boxShadow: raised, borderRadius: '12px', border: '1px solid rgba(212,168,79,0.07)', display: 'inline-flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Vynk" style={{ width: '80px', height: 'auto', display: 'block' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: C.smoke, padding: '6px 12px', background: C.g, boxShadow: insetSm, borderRadius: '8px' }}>Card Builder</div>
          {existingCard && <Link href={`/c/${existingCard.slug}`} style={{ fontSize: '11px', color: C.gold, textDecoration: 'none', padding: '6px 12px', background: C.g, boxShadow: raisedSm, borderRadius: '8px' }}>View card →</Link>}
        </div>
      </nav>

      {/* WARNING */}
      {showWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,6,7,0.88)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: C.g, boxShadow: `14px 14px 36px ${C.nd},-8px -8px 24px ${C.nl}`, borderRadius: '24px', padding: '36px', maxWidth: '420px', width: '100%', border: '1px solid rgba(212,168,79,0.08)' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: C.silver, fontFamily: "'Syne',sans-serif" }}>Identity change detected</h2>
            <p style={{ color: C.smoke, fontSize: '13px', marginBottom: '20px', lineHeight: 1.7 }}>
              Changed: <span style={{ color: C.gold, fontWeight: 600 }}>{paidChanges.map(k => FIELD_LABELS[k] || k).join(', ')}</span><br /><br />
              Your current card will be <strong style={{ color: C.silver }}>archived</strong> and a new one published for <strong style={{ color: C.gold }}>$10</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowWarning(false); setPaidChanges([]) }} style={{ flex: 1, padding: '12px', background: C.g, boxShadow: raisedSm, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', color: C.smoke, fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={() => { setShowWarning(false); submit(true) }} style={{ flex: 1, padding: '12px', background: `linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`, color: C.carbon, borderRadius: '12px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: goldBox, fontFamily: "'DM Sans',sans-serif" }}>Pay $10 & update</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT PANEL */}
        <aside style={{ width: '320px', flexShrink: 0, background: C.g, borderRight: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)', flexShrink: 0 }}>
            {tabBtn('front', 'Front')}
            {tabBtn('back', 'Back')}
            {tabBtn('design', 'Design')}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* FRONT TAB */}
            {activeTab === 'front' && (
              <>
                <div style={{ fontSize: '9px', color: C.gold, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '16px', height: '1px', background: C.gold }} /> Identity — $10 to change
                </div>
                <div><label style={lbl}>Full Name *</label><input style={nmInp} placeholder="Alexandra Reyes" value={form.fullName} onChange={e => set('fullName', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><label style={lbl}>Title</label><input style={nmInp} placeholder="CEO" value={form.title} onChange={e => set('title', e.target.value)} /></div>
                  <div><label style={lbl}>Company</label><input style={nmInp} placeholder="Acme" value={form.company} onChange={e => set('company', e.target.value)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><label style={lbl}>Phone</label><input style={nmInp} placeholder="+1 555 0100" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
                  <div><label style={lbl}>WhatsApp</label><input style={nmInp} placeholder="15550100" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} /></div>
                </div>
                <div><label style={lbl}>Email</label><input style={nmInp} placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={lbl}>Profile Photo <span style={{ color: C.smoke, fontWeight: 400 }}>(drag on card)</span></label>
                    <button onClick={() => photoRef.current?.click()} style={{ width: '100%', padding: '9px', background: C.g, boxShadow: form.photoUrl ? insetSm : raisedSm, border: `1px solid ${form.photoUrl ? 'rgba(212,168,79,0.2)' : 'rgba(255,255,255,0.04)'}`, borderRadius: '10px', color: form.photoUrl ? C.gold : C.smoke, fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                      {form.photoUrl ? '✓ Uploaded' : 'Upload photo'}
                    </button>
                    <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e, 'photoUrl')} />
                  </div>
                  <div>
                    <label style={lbl}>Logo <span style={{ color: C.smoke, fontWeight: 400 }}>(drag on card)</span></label>
                    <button onClick={() => logoRef.current?.click()} style={{ width: '100%', padding: '9px', background: C.g, boxShadow: form.logoUrl ? insetSm : raisedSm, border: `1px solid ${form.logoUrl ? 'rgba(212,168,79,0.2)' : 'rgba(255,255,255,0.04)'}`, borderRadius: '10px', color: form.logoUrl ? C.gold : C.smoke, fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                      {form.logoUrl ? '✓ Uploaded' : 'Upload logo'}
                    </button>
                    <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e, 'logoUrl')} />
                  </div>
                </div>
              </>
            )}

            {/* BACK TAB */}
            {activeTab === 'back' && (
              <>
                <div style={{ fontSize: '9px', color: '#4ade80', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '16px', height: '1px', background: '#4ade80' }} /> Content — always free
                </div>
                <div><label style={lbl}>Tagline</label><input style={nmInp} placeholder="We craft brands that move people." value={form.tagline} onChange={e => set('tagline', e.target.value)} /></div>
                <div><label style={lbl}>Bio</label><textarea style={{ ...nmInp, height: '72px', resize: 'none' as const, lineHeight: 1.5 }} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief description..." /></div>
                <div><label style={lbl}>Services (comma-separated)</label><input style={nmInp} placeholder="Branding, Strategy, UX" value={form.services} onChange={e => set('services', e.target.value)} /></div>
                <div><label style={lbl}>Website</label><input style={nmInp} placeholder="yoursite.com" value={form.website} onChange={e => set('website', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {(['instagram', 'linkedin', 'twitter', 'telegram', 'tiktok', 'youtube'] as const).map(k => (
                    <div key={k}><label style={lbl}>{k.charAt(0).toUpperCase() + k.slice(1)}</label><input style={nmInp} placeholder="@handle" value={form[k]} onChange={e => set(k, e.target.value)} /></div>
                  ))}
                </div>
              </>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
              <>
                {/* Category filter */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {CATS.map(cat => (
                    <button key={cat} onClick={() => setActiveCat(cat)}
                      style={{ padding: '4px 10px', borderRadius: '20px', border: 'none', background: activeCat === cat ? `rgba(212,168,79,0.12)` : 'rgba(255,255,255,0.04)', color: activeCat === cat ? C.gold : C.smoke, fontSize: '10px', fontWeight: activeCat === cat ? 700 : 400, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all .15s' }}>
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Template grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '5px', marginBottom: '14px' }}>
                  {TEMPLATES.filter(t => t.cat === activeCat).map(t => (
                    <button key={t.id} title={t.label} onClick={() => applyTemplate(t)}
                      style={{
                        height: '40px', borderRadius: '10px', cursor: 'pointer',
                        background: t.mode === 'gradient' ? `linear-gradient(135deg,${t.bg},${t.bg2})` : t.bg,
                        border: `2px solid ${design.template === t.id ? t.accent : 'rgba(255,255,255,0.06)'}`,
                        boxShadow: design.template === t.id ? `0 0 0 1px ${t.accent}66, 3px 3px 8px ${C.nd}` : raisedSm,
                        transition: 'all .15s', position: 'relative', overflow: 'hidden',
                      }}>
                      <div style={{ position: 'absolute', inset: 0, background: t.overlay === 'none' ? 'none' : t.overlay, opacity: .8 }} />
                      <div style={{ position: 'absolute', bottom: '3px', right: '4px', width: '5px', height: '5px', borderRadius: '50%', background: t.accent }} />
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '14px' }}>
                  {TEMPLATES.filter(t => t.cat === activeCat).map(t => (
                    <button key={t.id} onClick={() => applyTemplate(t)}
                      style={{ padding: '3px 8px', borderRadius: '20px', border: 'none', background: design.template === t.id ? `rgba(212,168,79,0.1)` : 'rgba(255,255,255,0.03)', color: design.template === t.id ? C.gold : C.smoke, fontSize: '9px', fontWeight: design.template === t.id ? 700 : 400, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Font */}
                <label style={lbl}>Font</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '5px', marginBottom: '12px' }}>
                  {FONTS.map(f => (
                    <button key={f.id} onClick={() => setD('font', f.id)}
                      style={{ fontFamily: f.css, padding: '7px 4px', borderRadius: '9px', background: C.g, boxShadow: design.font === f.id ? insetSm : raisedSm, border: `1px solid ${design.font === f.id ? 'rgba(212,168,79,0.2)' : 'rgba(255,255,255,0.04)'}`, color: design.font === f.id ? C.gold : C.smoke, fontSize: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all .15s', outline: 'none' }}>
                      {f.name}
                    </button>
                  ))}
                </div>

                {/* Custom colors */}
                <label style={lbl}>Custom colors</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { k: 'bg', l: 'BG' }, { k: 'bg2', l: 'BG2' }, { k: 'textColor', l: 'Text' }, { k: 'accent', l: 'Accent' }
                  ].map(({ k, l }) => (
                    <div key={k}>
                      <label style={{ ...lbl, fontSize: '9px' }}>{l}</label>
                      <input type="color" value={(design as any)[k] || '#000000'} onChange={e => setD(k as keyof Design, e.target.value)}
                        style={{ width: '100%', height: '30px', borderRadius: '7px', border: 'none', background: C.g, boxShadow: raisedSm, cursor: 'pointer', padding: '2px' }} />
                    </div>
                  ))}
                </div>

                {/* Mode toggle */}
                <label style={lbl}>Background</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {['solid', 'gradient'].map(m => (
                    <button key={m} onClick={() => setD('mode', m)}
                      style={{ flex: 1, padding: '7px', borderRadius: '9px', background: C.g, boxShadow: design.mode === m ? insetSm : raisedSm, border: `1px solid ${design.mode === m ? 'rgba(212,168,79,0.2)' : 'rgba(255,255,255,0.04)'}`, color: design.mode === m ? C.gold : C.smoke, fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' as const, transition: 'all .15s', outline: 'none' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Promo + Submit */}
          <div style={{ padding: '14px', borderTop: '1px solid rgba(255,255,255,0.03)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input style={{ ...nmInp, flex: 1, padding: '8px 10px', fontSize: '12px' }} placeholder="Promo code" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} />
              <button onClick={validatePromo} style={{ padding: '8px 12px', background: C.g, boxShadow: raisedSm, border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', color: promoValid ? C.gold : C.smoke, fontSize: '11px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>Apply</button>
            </div>
            <button onClick={() => submit()} disabled={submitting}
              style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`, color: C.carbon, borderRadius: '12px', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: goldBox, opacity: submitting ? .6 : 1, fontFamily: "'DM Sans',sans-serif" }}>
              {submitting ? 'Processing…' : existingCard ? 'Update card' : '✨ Generate my card — $20'}
            </button>
            <p style={{ fontSize: '10px', color: C.smoke, textAlign: 'center' as const, opacity: .6 }}>
              {existingCard ? 'Free changes instant · Identity $10' : 'One-time · Colors & content free'}
            </p>
          </div>
        </aside>

        {/* RIGHT — Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.g, padding: '32px', gap: '16px', overflow: 'auto', position: 'relative' }}>

          {/* Background ambient glow */}
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${tpl.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <p style={{ fontSize: '9px', color: C.smoke, textTransform: 'uppercase' as const, letterSpacing: '.1em', position: 'relative' }}>
            Live Preview · Click card to flip · Drag photo/logo to reposition
          </p>

          {/* Card tray */}
          <div style={{ background: C.g, boxShadow: `14px 14px 36px ${C.nd}, -8px -8px 24px ${C.nl}`, borderRadius: '28px', padding: '20px', border: `1px solid ${tpl.border}`, width: '100%', maxWidth: '560px', position: 'relative' }}>
            <div style={{ perspective: '1200px' }}>
              <div ref={cardRef} onClick={() => !dragging && setIsFlipped(f => !f)}
                style={{ position: 'relative', transformStyle: 'preserve-3d', transition: dragging ? 'none' : 'transform 0.7s cubic-bezier(0.23,1,0.32,1)', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', cursor: 'pointer', minHeight: '300px', borderRadius: '20px', userSelect: 'none' }}>

                {/* ── FRONT ── */}
                <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: cardBg, borderRadius: '20px', padding: '32px', color: design.textColor, minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: fontCss, boxShadow: `0 24px 64px ${C.nd}`, position: 'relative', overflow: 'hidden' }}>

                  {/* Overlay texture */}
                  {tpl.overlay !== 'none' && <div style={{ position: 'absolute', inset: 0, background: tpl.overlay, pointerEvents: 'none' }} />}

                  {/* Accent border */}
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '20px', border: `1px solid ${tpl.border}`, pointerEvents: 'none' }} />

                  {/* Draggable photo */}
                  {form.photoUrl && (
                    <div
                      onMouseDown={e => startDrag(e, 'photo')}
                      style={{ position: 'absolute', left: `${photoPos.x}%`, top: `${photoPos.y}%`, width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${design.accent}60`, cursor: 'grab', zIndex: 10, boxShadow: `0 4px 16px rgba(0,0,0,0.4)`, transform: dragging === 'photo' ? 'scale(1.05)' : 'scale(1)', transition: dragging === 'photo' ? 'none' : 'transform .15s' }}>
                      <img src={form.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                    </div>
                  )}

                  {/* Draggable logo */}
                  {form.logoUrl && (
                    <div
                      onMouseDown={e => startDrag(e, 'logo')}
                      style={{ position: 'absolute', left: `${logoPos.x}%`, top: `${logoPos.y}%`, cursor: 'grab', zIndex: 10, transform: dragging === 'logo' ? 'scale(1.05)' : 'scale(1)', transition: dragging === 'logo' ? 'none' : 'transform .15s' }}>
                      <img src={form.logoUrl} alt="logo" style={{ height: '32px', objectFit: 'contain', filter: `drop-shadow(0 2px 8px rgba(0,0,0,0.5))` }} draggable={false} />
                    </div>
                  )}

                  {/* Card content */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.14em', opacity: .3, textTransform: 'uppercase' as const, marginBottom: '20px', color: design.accent }}>VYNK</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.15, marginBottom: '6px' }}>{form.fullName || 'Your Name'}</div>
                    <div style={{ fontSize: '13px', opacity: .7, marginBottom: '6px' }}>{[form.title, form.company].filter(Boolean).join(' · ') || 'Title · Company'}</div>
                    {form.tagline && <div style={{ fontSize: '11px', opacity: .5, lineHeight: 1.6, maxWidth: '55%' }}>{form.tagline}</div>}
                  </div>

                  {/* Avatar placeholder if no photo */}
                  {!form.photoUrl && (
                    <div style={{ position: 'absolute', top: '28px', right: '28px', width: '60px', height: '60px', borderRadius: '50%', background: `${design.accent}18`, border: `2px solid ${design.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: design.accent }}>
                      {initials}
                    </div>
                  )}

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    {form.email && <div style={{ fontSize: '11px', opacity: .55, marginBottom: '2px' }}>{form.email}</div>}
                    {form.website && <div style={{ fontSize: '11px', opacity: .35 }}>{form.website.replace(/^https?:\/\//, '')}</div>}
                    <div style={{ marginTop: '16px', width: '100%', height: '1px', background: `linear-gradient(90deg,${design.accent}50,transparent)` }} />
                  </div>
                </div>

                {/* ── BACK ── */}
                <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: cardBg, borderRadius: '20px', padding: '32px', color: design.textColor, minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: fontCss, filter: 'brightness(0.85)', overflow: 'hidden' }}>
                  {tpl.overlay !== 'none' && <div style={{ position: 'absolute', inset: 0, background: tpl.overlay, pointerEvents: 'none' }} />}
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '20px', border: `1px solid ${tpl.border}`, pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                    <div style={{ fontSize: '9px', opacity: .3, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: design.accent }}>VYNK · SERVICES</div>
                    {form.services && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {form.services.split(',').filter(Boolean).map(s => (
                          <span key={s} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: `${design.accent}18`, border: `1px solid ${design.accent}35`, color: design.accent }}>{s.trim()}</span>
                        ))}
                      </div>
                    )}
                    {form.bio && <div style={{ fontSize: '12px', opacity: .65, lineHeight: 1.7 }}>{form.bio}</div>}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                      {(['whatsapp', 'instagram', 'linkedin', 'twitter', 'tiktok', 'telegram'] as const).filter(k => form[k]).map(k => (
                        <span key={k} style={{ width: '32px', height: '32px', borderRadius: '9px', background: `${design.accent}15`, border: `1px solid ${design.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: design.accent }}>
                          {k.slice(0, 2).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', padding: '0 4px' }}>
              <span style={{ fontSize: '10px', color: C.smoke }}>
                <span style={{ color: C.gold, fontWeight: 700 }}>{tpl.label}</span> · {FONTS.find(f => f.id === design.font)?.name}
              </span>
              <span style={{ fontSize: '10px', color: C.smoke }}>Click to flip ↻</span>
            </div>
          </div>

          {existingCard && (
            <div style={{ background: C.g, boxShadow: insetSm, borderRadius: '10px', padding: '8px 16px', fontSize: '11px', color: C.smoke, position: 'relative' }}>
              Active: <span style={{ color: C.gold }}>/c/{existingCard.slug}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
