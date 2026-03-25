'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FIELD_LABELS, requiresPayment } from '@/lib/rules'

const C = {
  g:'#0D0F12', gold:'#D4A84F', goldLt:'#E8C06A', goldDk:'#A07830',
  silver:'#BFC3C9', smoke:'#6F737A', carbon:'#050607',
  nd:'#08090B', nl:'#141720',
}
const raised   = `5px 5px 14px ${C.nd}, -3px -3px 10px ${C.nl}`
const raisedSm = `3px 3px 8px ${C.nd}, -2px -2px 6px ${C.nl}`
const insetSm  = `inset 2px 2px 6px ${C.nd}, inset -2px -2px 5px ${C.nl}`
const goldBox  = `4px 4px 14px ${C.nd}, -2px -2px 8px ${C.nl}, 0 0 22px rgba(212,168,79,0.2)`

// ─── CSS overlay snippets as JS strings ───────────────────────
// Each template has a unique SVG/CSS overlay rendered as background

const TEMPLATES = [
  // ━━ PREMIUM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id:'vynk-dark', label:'Vynk Dark', cat:'Premium',
    bg:'#0D0F12', bg2:'#1a1a24', textColor:'#BFC3C9', accent:'#D4A84F', mode:'gradient',
    overlay:`radial-gradient(ellipse 80% 60% at 20% 80%, rgba(212,168,79,0.07) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 80% 20%, rgba(212,168,79,0.04) 0%, transparent 50%)`,
    border:'rgba(212,168,79,0.15)', glow:'rgba(212,168,79,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><line x1='0' y1='220' x2='400' y2='220' stroke='rgba(212,168,79,0.08)' stroke-width='1'/><line x1='0' y1='225' x2='400' y2='225' stroke='rgba(212,168,79,0.04)' stroke-width='0.5'/><circle cx='380' cy='30' r='60' fill='none' stroke='rgba(212,168,79,0.06)' stroke-width='1'/><circle cx='380' cy='30' r='40' fill='none' stroke='rgba(212,168,79,0.04)' stroke-width='0.5'/></svg>` },

  { id:'carbon-gold', label:'Carbon Gold', cat:'Premium',
    bg:'#050607', bg2:'#111118', textColor:'#D4A84F', accent:'#D4A84F', mode:'gradient',
    overlay:`linear-gradient(135deg, rgba(212,168,79,0.05) 0%, transparent 50%, rgba(212,168,79,0.03) 100%)`,
    border:'rgba(212,168,79,0.25)', glow:'rgba(212,168,79,0.15)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><polygon points='350,0 400,0 400,80 350,0' fill='rgba(212,168,79,0.06)'/><polygon points='360,0 400,0 400,60 360,0' fill='rgba(212,168,79,0.04)'/><line x1='0' y1='240' x2='280' y2='240' stroke='rgba(212,168,79,0.12)' stroke-width='1'/><line x1='0' y1='244' x2='180' y2='244' stroke='rgba(212,168,79,0.06)' stroke-width='0.5'/></svg>` },

  { id:'obsidian', label:'Obsidian', cat:'Premium',
    bg:'#080810', bg2:'#0f0f1e', textColor:'#e8e8f8', accent:'#818cf8', mode:'gradient',
    overlay:`radial-gradient(circle at 80% 20%, rgba(129,140,248,0.1) 0%, transparent 45%)`,
    border:'rgba(129,140,248,0.15)', glow:'rgba(129,140,248,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><polygon points='400,0 400,250 320,250' fill='none' stroke='rgba(129,140,248,0.08)' stroke-width='1'/><polygon points='400,0 400,250 280,250' fill='none' stroke='rgba(129,140,248,0.05)' stroke-width='0.5'/><circle cx='20' cy='230' r='80' fill='none' stroke='rgba(129,140,248,0.05)' stroke-width='1'/></svg>` },

  { id:'midnight-pro', label:'Midnight Pro', cat:'Premium',
    bg:'#0a0a1e', bg2:'#1a1a3e', textColor:'#e8e8f0', accent:'#6366f1', mode:'gradient',
    overlay:`radial-gradient(ellipse 100% 60% at 50% 100%, rgba(99,102,241,0.08) 0%, transparent 60%)`,
    border:'rgba(99,102,241,0.2)', glow:'rgba(99,102,241,0.12)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,180 Q100,160 200,180 Q300,200 400,180' fill='none' stroke='rgba(99,102,241,0.08)' stroke-width='1'/><path d='M0,190 Q100,170 200,190 Q300,210 400,190' fill='none' stroke='rgba(99,102,241,0.05)' stroke-width='0.5'/><path d='M0,200 Q100,180 200,200 Q300,220 400,200' fill='none' stroke='rgba(99,102,241,0.03)' stroke-width='0.5'/></svg>` },

  { id:'phantom', label:'Phantom', cat:'Premium',
    bg:'#0a0a0a', bg2:'#1a0a1a', textColor:'#f0e8f8', accent:'#c084fc', mode:'gradient',
    overlay:`radial-gradient(ellipse 60% 80% at 90% -10%, rgba(192,132,252,0.1) 0%, transparent 55%)`,
    border:'rgba(192,132,252,0.15)', glow:'rgba(192,132,252,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><circle cx='380' cy='-20' r='120' fill='none' stroke='rgba(192,132,252,0.07)' stroke-width='1'/><circle cx='380' cy='-20' r='90' fill='none' stroke='rgba(192,132,252,0.05)' stroke-width='0.5'/><circle cx='380' cy='-20' r='60' fill='none' stroke='rgba(192,132,252,0.04)' stroke-width='0.5'/><line x1='0' y1='235' x2='200' y2='235' stroke='rgba(192,132,252,0.06)' stroke-width='1'/></svg>` },

  { id:'void', label:'Void', cat:'Premium',
    bg:'#000000', bg2:'#050510', textColor:'#ffffff', accent:'#D4A84F', mode:'gradient',
    overlay:`radial-gradient(circle at 50% 50%, rgba(212,168,79,0.04) 0%, transparent 60%)`,
    border:'rgba(212,168,79,0.2)', glow:'rgba(212,168,79,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><circle cx='200' cy='125' r='200' fill='none' stroke='rgba(212,168,79,0.04)' stroke-width='1'/><circle cx='200' cy='125' r='140' fill='none' stroke='rgba(212,168,79,0.03)' stroke-width='0.5'/><circle cx='200' cy='125' r='80' fill='none' stroke='rgba(212,168,79,0.025)' stroke-width='0.5'/></svg>` },

  { id:'abyss', label:'Abyss', cat:'Premium',
    bg:'#020208', bg2:'#0a0a18', textColor:'#e0e0ff', accent:'#7c83ff', mode:'gradient',
    overlay:`repeating-conic-gradient(rgba(124,131,255,0.025) 0deg, transparent 1deg, transparent 29deg, rgba(124,131,255,0.025) 30deg)`,
    border:'rgba(124,131,255,0.12)', glow:'rgba(124,131,255,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><line x1='200' y1='0' x2='400' y2='250' stroke='rgba(124,131,255,0.05)' stroke-width='0.5'/><line x1='100' y1='0' x2='400' y2='200' stroke='rgba(124,131,255,0.04)' stroke-width='0.5'/><line x1='300' y1='0' x2='400' y2='67' stroke='rgba(124,131,255,0.03)' stroke-width='0.5'/></svg>` },

  { id:'eclipse', label:'Eclipse', cat:'Premium',
    bg:'#08060e', bg2:'#120a1e', textColor:'#f0e8ff', accent:'#b060ff', mode:'gradient',
    overlay:`radial-gradient(ellipse 120% 80% at 110% 50%, rgba(176,96,255,0.1) 0%, transparent 50%)`,
    border:'rgba(176,96,255,0.15)', glow:'rgba(176,96,255,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><ellipse cx='420' cy='125' rx='130' ry='130' fill='none' stroke='rgba(176,96,255,0.08)' stroke-width='1'/><ellipse cx='420' cy='125' rx='100' ry='100' fill='none' stroke='rgba(176,96,255,0.06)' stroke-width='0.5'/><ellipse cx='420' cy='125' rx='70' ry='70' fill='none' stroke='rgba(176,96,255,0.04)' stroke-width='0.5'/></svg>` },

  { id:'sovereign', label:'Sovereign', cat:'Premium',
    bg:'#0a0800', bg2:'#1a1400', textColor:'#fff8e0', accent:'#fbbf24', mode:'gradient',
    overlay:`linear-gradient(60deg, rgba(251,191,36,0.025) 0px, transparent 1px)`,
    border:'rgba(251,191,36,0.15)', glow:'rgba(251,191,36,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><polygon points='200,0 400,125 200,250 0,125' fill='none' stroke='rgba(251,191,36,0.06)' stroke-width='1'/><polygon points='200,30 370,125 200,220 30,125' fill='none' stroke='rgba(251,191,36,0.04)' stroke-width='0.5'/></svg>` },

  { id:'zenith', label:'Zenith', cat:'Premium',
    bg:'#030310', bg2:'#08081e', textColor:'#e8f0ff', accent:'#60a5fa', mode:'gradient',
    overlay:`radial-gradient(ellipse 200% 100% at 50% 100%, rgba(96,165,250,0.07) 0%, transparent 55%)`,
    border:'rgba(96,165,250,0.12)', glow:'rgba(96,165,250,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,250 L200,50 L400,250' fill='none' stroke='rgba(96,165,250,0.06)' stroke-width='1'/><path d='M0,250 L200,80 L400,250' fill='none' stroke='rgba(96,165,250,0.04)' stroke-width='0.5'/><path d='M0,250 L200,110 L400,250' fill='none' stroke='rgba(96,165,250,0.03)' stroke-width='0.5'/></svg>` },

  // ━━ METAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id:'titanium', label:'Titanium', cat:'Metal',
    bg:'#1c1c20', bg2:'#2a2a30', textColor:'#e8eaed', accent:'#9aa0a6', mode:'gradient',
    overlay:`repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 8px)`,
    border:'rgba(154,160,166,0.2)', glow:'rgba(154,160,166,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><rect x='0' y='230' width='400' height='1' fill='rgba(154,160,166,0.15)'/><rect x='0' y='234' width='300' height='0.5' fill='rgba(154,160,166,0.08)'/><rect x='320' y='0' width='1' height='250' fill='rgba(154,160,166,0.06)'/></svg>` },

  { id:'steel', label:'Steel Blue', cat:'Metal',
    bg:'#0f172a', bg2:'#1e3a5f', textColor:'#e2e8f0', accent:'#38bdf8', mode:'gradient',
    overlay:`linear-gradient(180deg, rgba(56,189,248,0.05) 0%, transparent 100%)`,
    border:'rgba(56,189,248,0.15)', glow:'rgba(56,189,248,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><line x1='0' y1='0' x2='400' y2='0' stroke='rgba(56,189,248,0.1)' stroke-width='1'/><line x1='0' y1='4' x2='400' y2='4' stroke='rgba(56,189,248,0.05)' stroke-width='0.5'/><rect x='350' y='20' width='30' height='1' fill='rgba(56,189,248,0.12)'/><rect x='340' y='24' width='40' height='0.5' fill='rgba(56,189,248,0.06)'/></svg>` },

  { id:'chrome', label:'Chrome', cat:'Metal',
    bg:'#12131a', bg2:'#1e2030', textColor:'#BFC3C9', accent:'#BFC3C9', mode:'gradient',
    overlay:`linear-gradient(135deg, rgba(191,195,201,0.06) 0%, transparent 40%, rgba(191,195,201,0.04) 100%)`,
    border:'rgba(191,195,201,0.15)', glow:'rgba(191,195,201,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,125 Q200,80 400,125' fill='none' stroke='rgba(191,195,201,0.06)' stroke-width='1'/><path d='M0,130 Q200,85 400,130' fill='none' stroke='rgba(191,195,201,0.04)' stroke-width='0.5'/></svg>` },

  { id:'copper', label:'Copper', cat:'Metal',
    bg:'#1a0e08', bg2:'#2d1a0e', textColor:'#fde8d0', accent:'#c2855a', mode:'gradient',
    overlay:`radial-gradient(circle at 30% 70%, rgba(194,133,90,0.1) 0%, transparent 45%)`,
    border:'rgba(194,133,90,0.2)', glow:'rgba(194,133,90,0.12)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,200 Q80,180 160,200 Q240,220 320,200 Q360,190 400,200' fill='none' stroke='rgba(194,133,90,0.1)' stroke-width='1'/><path d='M0,210 Q80,190 160,210 Q240,230 320,210 Q360,200 400,210' fill='none' stroke='rgba(194,133,90,0.06)' stroke-width='0.5'/></svg>` },

  { id:'platinum', label:'Platinum', cat:'Metal',
    bg:'#f0f0f5', bg2:'#e0e0ea', textColor:'#1a1a2e', accent:'#1a1a2e', mode:'gradient',
    overlay:`linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%)`,
    border:'rgba(26,26,46,0.1)', glow:'rgba(26,26,46,0.05)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><rect x='0' y='0' width='400' height='2' fill='rgba(26,26,46,0.06)'/><rect x='0' y='248' width='400' height='2' fill='rgba(26,26,46,0.06)'/><circle cx='380' cy='20' r='40' fill='none' stroke='rgba(26,26,46,0.05)' stroke-width='0.5'/></svg>` },

  { id:'tungsten', label:'Tungsten', cat:'Metal',
    bg:'#0f0f12', bg2:'#1e1e24', textColor:'#d0d4dc', accent:'#8892a4', mode:'gradient',
    overlay:`repeating-linear-gradient(0deg, rgba(136,146,164,0.015) 0px, rgba(136,146,164,0.015) 1px, transparent 1px, transparent 4px)`,
    border:'rgba(136,146,164,0.15)', glow:'rgba(136,146,164,0.06)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><rect x='0' y='245' width='400' height='1' fill='rgba(136,146,164,0.1)'/><rect x='380' y='0' width='1' height='250' fill='rgba(136,146,164,0.06)'/><rect x='376' y='0' width='0.5' height='250' fill='rgba(136,146,164,0.04)'/></svg>` },

  { id:'gold-leaf', label:'Gold Leaf', cat:'Metal',
    bg:'#1a1000', bg2:'#2a1a00', textColor:'#fff8e8', accent:'#D4A84F', mode:'gradient',
    overlay:`repeating-linear-gradient(45deg, rgba(212,168,79,0.025) 0px, rgba(212,168,79,0.025) 1px, transparent 1px, transparent 6px)`,
    border:'rgba(212,168,79,0.2)', glow:'rgba(212,168,79,0.12)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><polygon points='0,0 60,0 0,60' fill='rgba(212,168,79,0.06)'/><polygon points='0,0 40,0 0,40' fill='rgba(212,168,79,0.04)'/><line x1='0' y1='240' x2='400' y2='240' stroke='rgba(212,168,79,0.08)' stroke-width='1'/></svg>` },

  { id:'nickel', label:'Nickel', cat:'Metal',
    bg:'#141418', bg2:'#1e1e24', textColor:'#c8ccd4', accent:'#a0a8b8', mode:'gradient',
    overlay:`radial-gradient(ellipse 150% 100% at 50% 0%, rgba(160,168,184,0.07) 0%, transparent 55%)`,
    border:'rgba(160,168,184,0.12)', glow:'rgba(160,168,184,0.06)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><line x1='0' y1='2' x2='400' y2='2' stroke='rgba(160,168,184,0.08)' stroke-width='1.5'/><line x1='0' y1='6' x2='400' y2='6' stroke='rgba(160,168,184,0.04)' stroke-width='0.5'/></svg>` },

  { id:'bronze', label:'Bronze', cat:'Metal',
    bg:'#140c06', bg2:'#241408', textColor:'#f4e4c8', accent:'#cd7f32', mode:'gradient',
    overlay:`radial-gradient(circle at 80% 80%, rgba(205,127,50,0.1) 0%, transparent 40%)`,
    border:'rgba(205,127,50,0.18)', glow:'rgba(205,127,50,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><circle cx='380' cy='240' r='100' fill='none' stroke='rgba(205,127,50,0.08)' stroke-width='1'/><circle cx='380' cy='240' r='70' fill='none' stroke='rgba(205,127,50,0.06)' stroke-width='0.5'/><circle cx='380' cy='240' r='40' fill='none' stroke='rgba(205,127,50,0.05)' stroke-width='0.5'/></svg>` },

  { id:'iridium', label:'Iridium', cat:'Metal',
    bg:'#080c14', bg2:'#101828', textColor:'#e0e8f8', accent:'#4488cc', mode:'gradient',
    overlay:`linear-gradient(135deg, rgba(68,136,204,0.05) 0%, rgba(100,180,255,0.04) 50%, rgba(68,136,204,0.07) 100%)`,
    border:'rgba(68,136,204,0.15)', glow:'rgba(68,136,204,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,0 L400,250' stroke='rgba(68,136,204,0.06)' stroke-width='1'/><path d='M0,50 L350,250' stroke='rgba(68,136,204,0.04)' stroke-width='0.5'/><path d='M50,0 L400,200' stroke='rgba(68,136,204,0.04)' stroke-width='0.5'/></svg>` },

  // ━━ NATURE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id:'forest-pro', label:'Forest', cat:'Nature',
    bg:'#022c22', bg2:'#064e3b', textColor:'#ecfdf5', accent:'#4ade80', mode:'gradient',
    overlay:`radial-gradient(ellipse 100% 60% at 50% 100%, rgba(74,222,128,0.07) 0%, transparent 55%)`,
    border:'rgba(74,222,128,0.15)', glow:'rgba(74,222,128,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M20,250 L20,180 Q20,170 30,165 L50,155 Q60,150 60,140 L60,100 Q60,90 70,85 L85,78 Q95,73 95,63 L95,30' fill='none' stroke='rgba(74,222,128,0.07)' stroke-width='1.5' stroke-linecap='round'/><path d='M350,250 L355,190 Q356,178 365,172 L378,165 Q388,160 390,150 L392,120' fill='none' stroke='rgba(74,222,128,0.05)' stroke-width='1' stroke-linecap='round'/><path d='M0,230 Q100,225 200,230 Q300,235 400,228' fill='none' stroke='rgba(74,222,128,0.08)' stroke-width='0.5'/></svg>` },

  { id:'ocean-deep', label:'Ocean Deep', cat:'Nature',
    bg:'#0c1445', bg2:'#1a237e', textColor:'#e3f2fd', accent:'#29b6f6', mode:'gradient',
    overlay:`repeating-linear-gradient(0deg, rgba(41,182,246,0.025) 0px, rgba(41,182,246,0.025) 1px, transparent 1px, transparent 20px)`,
    border:'rgba(41,182,246,0.15)', glow:'rgba(41,182,246,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,180 Q50,168 100,175 Q150,182 200,170 Q250,158 300,168 Q350,178 400,165' fill='none' stroke='rgba(41,182,246,0.08)' stroke-width='1'/><path d='M0,195 Q50,183 100,190 Q150,197 200,185 Q250,173 300,183 Q350,193 400,180' fill='none' stroke='rgba(41,182,246,0.06)' stroke-width='0.7'/><path d='M0,210 Q50,198 100,205 Q150,212 200,200 Q250,188 300,198 Q350,208 400,195' fill='none' stroke='rgba(41,182,246,0.04)' stroke-width='0.5'/></svg>` },

  { id:'aurora', label:'Aurora', cat:'Nature',
    bg:'#0a1628', bg2:'#0d2137', textColor:'#e0f7fa', accent:'#4dd0e1', mode:'gradient',
    overlay:`linear-gradient(135deg, rgba(77,208,225,0.07) 0%, rgba(129,212,250,0.05) 50%, rgba(165,214,167,0.05) 100%)`,
    border:'rgba(77,208,225,0.15)', glow:'rgba(77,208,225,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,80 Q100,40 200,70 Q300,100 400,50' fill='none' stroke='rgba(77,208,225,0.08)' stroke-width='8' stroke-linecap='round' opacity='0.4'/><path d='M0,100 Q100,60 200,90 Q300,120 400,70' fill='none' stroke='rgba(165,214,167,0.06)' stroke-width='6' stroke-linecap='round' opacity='0.4'/><path d='M0,120 Q100,80 200,110 Q300,140 400,90' fill='none' stroke='rgba(129,212,250,0.05)' stroke-width='4' stroke-linecap='round' opacity='0.4'/></svg>` },

  { id:'volcanic', label:'Volcanic', cat:'Nature',
    bg:'#1a0500', bg2:'#3d0a00', textColor:'#fff3e0', accent:'#ff7043', mode:'gradient',
    overlay:`radial-gradient(circle at 50% 100%, rgba(255,112,67,0.12) 0%, transparent 55%)`,
    border:'rgba(255,112,67,0.2)', glow:'rgba(255,112,67,0.12)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M200,250 L160,200 L120,210 L90,170 L50,180 L0,130' fill='none' stroke='rgba(255,112,67,0.08)' stroke-width='1' stroke-linejoin='round'/><path d='M200,250 L240,200 L280,210 L310,170 L350,180 L400,130' fill='none' stroke='rgba(255,112,67,0.06)' stroke-width='0.7' stroke-linejoin='round'/><path d='M200,250 L200,180 L185,160 L195,130 L188,100' fill='none' stroke='rgba(255,112,67,0.1)' stroke-width='1' stroke-linecap='round'/></svg>` },

  { id:'rose-gold', label:'Rose Gold', cat:'Nature',
    bg:'#1a0814', bg2:'#2d1020', textColor:'#fce4ec', accent:'#f48fb1', mode:'gradient',
    overlay:`radial-gradient(ellipse 80% 80% at 20% 20%, rgba(244,143,177,0.08) 0%, transparent 55%)`,
    border:'rgba(244,143,177,0.15)', glow:'rgba(244,143,177,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M200,30 C180,50 160,45 150,60 C140,75 155,90 145,105 C135,120 110,115 105,130 C100,145 120,155 115,170' fill='none' stroke='rgba(244,143,177,0.07)' stroke-width='1' stroke-linecap='round'/><path d='M200,30 C220,50 240,45 250,60 C260,75 245,90 255,105 C265,120 290,115 295,130 C300,145 280,155 285,170' fill='none' stroke='rgba(244,143,177,0.05)' stroke-width='0.7' stroke-linecap='round'/><circle cx='200' cy='25' r='6' fill='none' stroke='rgba(244,143,177,0.1)' stroke-width='1'/></svg>` },

  { id:'nebula', label:'Nebula', cat:'Nature',
    bg:'#06010f', bg2:'#10022a', textColor:'#f0e8ff', accent:'#d08aff', mode:'gradient',
    overlay:`radial-gradient(ellipse 80% 60% at 20% 30%, rgba(208,138,255,0.08) 0%, transparent 45%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(100,160,255,0.06) 0%, transparent 45%)`,
    border:'rgba(208,138,255,0.15)', glow:'rgba(208,138,255,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><ellipse cx='100' cy='80' rx='60' ry='40' fill='none' stroke='rgba(208,138,255,0.06)' stroke-width='1'/><ellipse cx='300' cy='170' rx='50' ry='35' fill='none' stroke='rgba(100,160,255,0.05)' stroke-width='1'/><circle cx='200' cy='125' r='3' fill='rgba(208,138,255,0.15)'/><circle cx='150' cy='60' r='1.5' fill='rgba(255,255,255,0.2)'/><circle cx='320' cy='80' r='1' fill='rgba(255,255,255,0.15)'/><circle cx='80' cy='180' r='2' fill='rgba(100,160,255,0.2)'/></svg>` },

  { id:'arctic', label:'Arctic', cat:'Nature',
    bg:'#e8f4f8', bg2:'#d0e8f4', textColor:'#1a2a3a', accent:'#2a6a9a', mode:'gradient',
    overlay:`linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%)`,
    border:'rgba(42,106,154,0.12)', glow:'rgba(42,106,154,0.06)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><polygon points='50,250 80,200 110,250' fill='rgba(42,106,154,0.04)'/><polygon points='120,250 160,180 200,250' fill='rgba(42,106,154,0.03)'/><polygon points='200,250 250,190 300,250' fill='rgba(42,106,154,0.035)'/><polygon points='310,250 350,210 390,250' fill='rgba(42,106,154,0.025)'/><line x1='0' y1='235' x2='400' y2='235' stroke='rgba(42,106,154,0.08)' stroke-width='0.5'/></svg>` },

  { id:'jungle', label:'Jungle', cat:'Nature',
    bg:'#010a04', bg2:'#02140a', textColor:'#e0f4e8', accent:'#2ecc71', mode:'gradient',
    overlay:`radial-gradient(circle at 30% 20%, rgba(46,204,113,0.07) 0%, transparent 40%)`,
    border:'rgba(46,204,113,0.15)', glow:'rgba(46,204,113,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M30,0 Q20,40 40,60 Q60,80 50,120 Q40,160 60,200 Q70,230 50,250' fill='none' stroke='rgba(46,204,113,0.07)' stroke-width='1.5' stroke-linecap='round'/><path d='M370,0 Q385,50 365,80 Q345,110 360,150 Q375,190 355,250' fill='none' stroke='rgba(46,204,113,0.05)' stroke-width='1' stroke-linecap='round'/><path d='M30,80 Q60,70 80,85 Q100,100 90,115' fill='none' stroke='rgba(46,204,113,0.06)' stroke-width='1' stroke-linecap='round'/><path d='M370,100 Q340,90 320,105' fill='none' stroke='rgba(46,204,113,0.05)' stroke-width='1' stroke-linecap='round'/></svg>` },

  { id:'dusk', label:'Dusk', cat:'Nature',
    bg:'#0e0618', bg2:'#1a0828', textColor:'#ffe8f0', accent:'#ff6b9d', mode:'gradient',
    overlay:`linear-gradient(180deg, rgba(255,107,157,0.05) 0%, rgba(255,150,50,0.07) 50%, rgba(255,200,100,0.04) 100%)`,
    border:'rgba(255,107,157,0.15)', glow:'rgba(255,107,157,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,140 Q100,120 200,135 Q300,150 400,130' fill='none' stroke='rgba(255,107,157,0.07)' stroke-width='1'/><path d='M0,155 Q100,135 200,150 Q300,165 400,145' fill='none' stroke='rgba(255,150,80,0.05)' stroke-width='0.7'/><ellipse cx='200' cy='140' rx='180' ry='8' fill='none' stroke='rgba(255,200,100,0.04)' stroke-width='0.5'/></svg>` },

  { id:'glacial', label:'Glacial', cat:'Nature',
    bg:'#010810', bg2:'#021020', textColor:'#e0f0ff', accent:'#60c8f0', mode:'gradient',
    overlay:`repeating-linear-gradient(30deg, rgba(96,200,240,0.02) 0px, rgba(96,200,240,0.02) 1px, transparent 1px, transparent 25px)`,
    border:'rgba(96,200,240,0.15)', glow:'rgba(96,200,240,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><polygon points='0,250 60,180 120,210 180,160 240,200 300,150 360,190 400,140 400,250' fill='none' stroke='rgba(96,200,240,0.07)' stroke-width='1' stroke-linejoin='round'/><polygon points='0,250 60,200 120,230 180,185 240,220 300,175 360,210 400,165 400,250' fill='none' stroke='rgba(96,200,240,0.04)' stroke-width='0.5' stroke-linejoin='round'/></svg>` },

  // ━━ TECH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id:'circuit', label:'Circuit', cat:'Tech',
    bg:'#001a0e', bg2:'#003320', textColor:'#00ff88', accent:'#00ff88', mode:'gradient',
    overlay:`repeating-linear-gradient(90deg, rgba(0,255,136,0.025) 0px, rgba(0,255,136,0.025) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(0deg, rgba(0,255,136,0.02) 0px, rgba(0,255,136,0.02) 1px, transparent 1px, transparent 40px)`,
    border:'rgba(0,255,136,0.2)', glow:'rgba(0,255,136,0.12)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M20,20 L20,80 L60,80 L60,120 L100,120 L100,80 L160,80' fill='none' stroke='rgba(0,255,136,0.12)' stroke-width='1' stroke-linecap='square'/><circle cx='60' cy='80' r='3' fill='none' stroke='rgba(0,255,136,0.15)' stroke-width='1'/><circle cx='100' cy='120' r='3' fill='none' stroke='rgba(0,255,136,0.15)' stroke-width='1'/><path d='M300,180 L340,180 L340,220 L380,220' fill='none' stroke='rgba(0,255,136,0.08)' stroke-width='1' stroke-linecap='square'/><circle cx='340' cy='180' r='2' fill='none' stroke='rgba(0,255,136,0.12)' stroke-width='1'/></svg>` },

  { id:'holographic', label:'Holographic', cat:'Tech',
    bg:'#0d0d1a', bg2:'#1a0d2e', textColor:'#f0e8ff', accent:'#c084fc', mode:'gradient',
    overlay:`linear-gradient(135deg, rgba(192,132,252,0.08) 0%, rgba(56,189,248,0.06) 33%, rgba(74,222,128,0.06) 66%, rgba(251,191,36,0.08) 100%)`,
    border:'rgba(192,132,252,0.2)', glow:'rgba(192,132,252,0.12)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,125 L400,125' stroke='rgba(192,132,252,0.06)' stroke-width='0.5'/><path d='M0,0 L400,250' stroke='rgba(56,189,248,0.04)' stroke-width='0.5'/><path d='M0,250 L400,0' stroke='rgba(74,222,128,0.04)' stroke-width='0.5'/><rect x='185' y='110' width='30' height='30' fill='none' stroke='rgba(251,191,36,0.08)' stroke-width='0.5' transform='rotate(15 200 125)'/></svg>` },

  { id:'neon-noir', label:'Neon Noir', cat:'Tech',
    bg:'#050510', bg2:'#0a0a20', textColor:'#f0f0ff', accent:'#00f0ff', mode:'gradient',
    overlay:`radial-gradient(circle at 50% 50%, rgba(0,240,255,0.04) 0%, transparent 65%)`,
    border:'rgba(0,240,255,0.2)', glow:'rgba(0,240,255,0.15)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><line x1='0' y1='0' x2='0' y2='250' stroke='rgba(0,240,255,0.08)' stroke-width='1'/><line x1='400' y1='0' x2='400' y2='250' stroke='rgba(0,240,255,0.08)' stroke-width='1'/><line x1='0' y1='0' x2='400' y2='0' stroke='rgba(0,240,255,0.06)' stroke-width='1'/><line x1='0' y1='250' x2='400' y2='250' stroke='rgba(0,240,255,0.06)' stroke-width='1'/><rect x='10' y='10' width='380' height='230' fill='none' stroke='rgba(0,240,255,0.04)' stroke-width='0.5'/></svg>` },

  { id:'matrix', label:'Matrix', cat:'Tech',
    bg:'#000800', bg2:'#001200', textColor:'#00ff41', accent:'#00ff41', mode:'gradient',
    overlay:`repeating-linear-gradient(180deg, rgba(0,255,65,0.015) 0px, rgba(0,255,65,0.015) 2px, transparent 2px, transparent 8px)`,
    border:'rgba(0,255,65,0.2)', glow:'rgba(0,255,65,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><text x='30' y='40' font-family='monospace' font-size='8' fill='rgba(0,255,65,0.08)'>01001011 01111001</text><text x='60' y='60' font-family='monospace' font-size='7' fill='rgba(0,255,65,0.05)'>10110100 01001110</text><text x='20' y='210' font-family='monospace' font-size='8' fill='rgba(0,255,65,0.06)'>11001010 00110101</text><text x='280' y='230' font-family='monospace' font-size='7' fill='rgba(0,255,65,0.05)'>01110011</text></svg>` },

  { id:'diamond', label:'Diamond', cat:'Tech',
    bg:'#0a0a14', bg2:'#14142a', textColor:'#f0f8ff', accent:'#67e8f9', mode:'gradient',
    overlay:`repeating-linear-gradient(45deg, rgba(103,232,249,0.025) 0px, rgba(103,232,249,0.025) 1px, transparent 1px, transparent 14px)`,
    border:'rgba(103,232,249,0.15)', glow:'rgba(103,232,249,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><polygon points='200,10 260,80 200,150 140,80' fill='none' stroke='rgba(103,232,249,0.08)' stroke-width='1'/><polygon points='200,30 248,85 200,140 152,85' fill='none' stroke='rgba(103,232,249,0.05)' stroke-width='0.5'/><line x1='140' y1='80' x2='260' y2='80' stroke='rgba(103,232,249,0.06)' stroke-width='0.5'/></svg>` },

  { id:'fibonacci', label:'Fibonacci', cat:'Tech',
    bg:'#060810', bg2:'#0c1020', textColor:'#e0e8ff', accent:'#6080ff', mode:'gradient',
    overlay:`radial-gradient(circle at 50% 50%, rgba(96,128,255,0.03) 20%, transparent 21%)`,
    border:'rgba(96,128,255,0.12)', glow:'rgba(96,128,255,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M200,125 Q200,80 245,80 Q290,80 290,125 Q290,195 200,195 Q110,195 110,125 Q110,30 200,30 Q340,30 340,125' fill='none' stroke='rgba(96,128,255,0.07)' stroke-width='1'/></svg>` },

  { id:'binary', label:'Binary', cat:'Tech',
    bg:'#000a04', bg2:'#001408', textColor:'#80ff80', accent:'#40ff80', mode:'gradient',
    overlay:`repeating-linear-gradient(90deg, rgba(64,255,128,0.015) 0px, rgba(64,255,128,0.015) 8px, transparent 8px, transparent 16px)`,
    border:'rgba(64,255,128,0.15)', glow:'rgba(64,255,128,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><text x='10' y='30' font-family='monospace' font-size='9' fill='rgba(64,255,128,0.07)'>1 0 1 1 0 0 1 0 1 1</text><text x='10' y='220' font-family='monospace' font-size='9' fill='rgba(64,255,128,0.06)'>0 1 0 0 1 1 0 1 0 0</text><text x='330' y='125' font-family='monospace' font-size='8' fill='rgba(64,255,128,0.05)' transform='rotate(90 330 125)'>1 0 1 0 1 1</text></svg>` },

  { id:'quantum', label:'Quantum', cat:'Tech',
    bg:'#040810', bg2:'#081020', textColor:'#c0e8ff', accent:'#00c8ff', mode:'gradient',
    overlay:`radial-gradient(circle at 25% 25%, rgba(0,200,255,0.05) 0%, transparent 28%), radial-gradient(circle at 75% 75%, rgba(0,200,255,0.05) 0%, transparent 28%)`,
    border:'rgba(0,200,255,0.15)', glow:'rgba(0,200,255,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><circle cx='200' cy='125' r='80' fill='none' stroke='rgba(0,200,255,0.06)' stroke-width='1' stroke-dasharray='4 8'/><circle cx='200' cy='125' r='50' fill='none' stroke='rgba(0,200,255,0.05)' stroke-width='0.5' stroke-dasharray='2 6'/><line x1='120' y1='125' x2='280' y2='125' stroke='rgba(0,200,255,0.05)' stroke-width='0.5'/><line x1='200' y1='45' x2='200' y2='205' stroke='rgba(0,200,255,0.05)' stroke-width='0.5'/></svg>` },

  { id:'neural', label:'Neural', cat:'Tech',
    bg:'#060408', bg2:'#0e080e', textColor:'#f0c8ff', accent:'#c040ff', mode:'gradient',
    overlay:`radial-gradient(circle at 20% 50%, rgba(192,64,255,0.04) 0%, transparent 22%)`,
    border:'rgba(192,64,255,0.12)', glow:'rgba(192,64,255,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><circle cx='60' cy='60' r='4' fill='none' stroke='rgba(192,64,255,0.15)' stroke-width='1'/><circle cx='200' cy='30' r='4' fill='none' stroke='rgba(192,64,255,0.12)' stroke-width='1'/><circle cx='340' cy='70' r='4' fill='none' stroke='rgba(192,64,255,0.12)' stroke-width='1'/><circle cx='120' cy='180' r='4' fill='none' stroke='rgba(192,64,255,0.1)' stroke-width='1'/><circle cx='280' cy='190' r='4' fill='none' stroke='rgba(192,64,255,0.1)' stroke-width='1'/><line x1='60' y1='60' x2='200' y2='30' stroke='rgba(192,64,255,0.07)' stroke-width='0.5'/><line x1='200' y1='30' x2='340' y2='70' stroke='rgba(192,64,255,0.07)' stroke-width='0.5'/><line x1='60' y1='60' x2='120' y2='180' stroke='rgba(192,64,255,0.06)' stroke-width='0.5'/><line x1='340' y1='70' x2='280' y2='190' stroke='rgba(192,64,255,0.06)' stroke-width='0.5'/><line x1='120' y1='180' x2='280' y2='190' stroke='rgba(192,64,255,0.05)' stroke-width='0.5'/><line x1='200' y1='30' x2='120' y2='180' stroke='rgba(192,64,255,0.04)' stroke-width='0.5'/></svg>` },

  { id:'waveform', label:'Waveform', cat:'Tech',
    bg:'#020810', bg2:'#040e1e', textColor:'#c0e8ff', accent:'#0088ff', mode:'gradient',
    overlay:`repeating-linear-gradient(0deg, transparent 0px, transparent 9px, rgba(0,136,255,0.02) 9px, rgba(0,136,255,0.02) 10px)`,
    border:'rgba(0,136,255,0.15)', glow:'rgba(0,136,255,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,125 Q25,105 50,125 Q75,145 100,125 Q125,105 150,125 Q175,145 200,125 Q225,105 250,125 Q275,145 300,125 Q325,105 350,125 Q375,145 400,125' fill='none' stroke='rgba(0,136,255,0.08)' stroke-width='1'/><path d='M0,135 Q25,115 50,135 Q75,155 100,135 Q125,115 150,135 Q175,155 200,135 Q225,115 250,135 Q275,155 300,135 Q325,115 350,135 Q375,155 400,135' fill='none' stroke='rgba(0,136,255,0.05)' stroke-width='0.6'/></svg>` },

  // ━━ CLASSIC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { id:'pure-black', label:'Pure Black', cat:'Classic',
    bg:'#000000', bg2:'#0a0a0a', textColor:'#ffffff', accent:'#D4A84F', mode:'solid',
    overlay:'none', border:'rgba(212,168,79,0.1)', glow:'rgba(212,168,79,0.05)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><line x1='0' y1='248' x2='400' y2='248' stroke='rgba(212,168,79,0.08)' stroke-width='1'/><line x1='0' y1='2' x2='400' y2='2' stroke='rgba(212,168,79,0.06)' stroke-width='0.5'/></svg>` },

  { id:'ivory', label:'Ivory', cat:'Classic',
    bg:'#faf8f5', bg2:'#f0ece5', textColor:'#1a1a1a', accent:'#8b6914', mode:'solid',
    overlay:`linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 60%)`,
    border:'rgba(139,105,20,0.1)', glow:'rgba(139,105,20,0.05)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><rect x='10' y='10' width='380' height='230' fill='none' stroke='rgba(139,105,20,0.07)' stroke-width='0.5'/><rect x='16' y='16' width='368' height='218' fill='none' stroke='rgba(139,105,20,0.04)' stroke-width='0.5'/></svg>` },

  { id:'slate', label:'Slate', cat:'Classic',
    bg:'#1e293b', bg2:'#334155', textColor:'#f1f5f9', accent:'#94a3b8', mode:'gradient',
    overlay:'none', border:'rgba(148,163,184,0.1)', glow:'rgba(148,163,184,0.05)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><line x1='0' y1='240' x2='400' y2='240' stroke='rgba(148,163,184,0.08)' stroke-width='1'/><line x1='0' y1='10' x2='400' y2='10' stroke='rgba(148,163,184,0.06)' stroke-width='0.5'/></svg>` },

  { id:'royal-blue', label:'Royal Blue', cat:'Classic',
    bg:'#1e1b4b', bg2:'#312e81', textColor:'#ede9fe', accent:'#a78bfa', mode:'gradient',
    overlay:`radial-gradient(ellipse 60% 40% at 80% 20%, rgba(167,139,250,0.12) 0%, transparent 55%)`,
    border:'rgba(167,139,250,0.15)', glow:'rgba(167,139,250,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><circle cx='360' cy='20' r='80' fill='none' stroke='rgba(167,139,250,0.07)' stroke-width='1'/><circle cx='360' cy='20' r='55' fill='none' stroke='rgba(167,139,250,0.05)' stroke-width='0.5'/><line x1='0' y1='238' x2='300' y2='238' stroke='rgba(167,139,250,0.06)' stroke-width='0.5'/></svg>` },

  { id:'sunset', label:'Sunset', cat:'Classic',
    bg:'#1a0a00', bg2:'#2d1a00', textColor:'#fff7ed', accent:'#fb923c', mode:'gradient',
    overlay:`linear-gradient(135deg, rgba(251,146,60,0.08) 0%, rgba(239,68,68,0.06) 100%)`,
    border:'rgba(251,146,60,0.15)', glow:'rgba(251,146,60,0.1)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,200 Q100,180 200,195 Q300,210 400,190' fill='none' stroke='rgba(251,146,60,0.08)' stroke-width='1'/><path d='M0,215 Q100,195 200,210 Q300,225 400,205' fill='none' stroke='rgba(239,68,68,0.05)' stroke-width='0.6'/><ellipse cx='200' cy='250' rx='200' ry='60' fill='none' stroke='rgba(251,146,60,0.04)' stroke-width='0.5'/></svg>` },

  { id:'noir', label:'Noir', cat:'Classic',
    bg:'#080808', bg2:'#141414', textColor:'#e8e8e8', accent:'#e8e8e8', mode:'gradient',
    overlay:`linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 50%)`,
    border:'rgba(255,255,255,0.08)', glow:'rgba(255,255,255,0.04)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><line x1='0' y1='0' x2='400' y2='250' stroke='rgba(255,255,255,0.03)' stroke-width='0.5'/><line x1='0' y1='125' x2='400' y2='125' stroke='rgba(255,255,255,0.025)' stroke-width='0.5'/></svg>` },

  { id:'parchment', label:'Parchment', cat:'Classic',
    bg:'#f5f0e8', bg2:'#ede4d0', textColor:'#2a2010', accent:'#8b6914', mode:'solid',
    overlay:`repeating-linear-gradient(45deg, rgba(139,105,20,0.025) 0px, rgba(139,105,20,0.025) 1px, transparent 1px, transparent 8px)`,
    border:'rgba(139,105,20,0.12)', glow:'rgba(139,105,20,0.04)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M10,10 L10,240 L390,240 L390,10 Z' fill='none' stroke='rgba(139,105,20,0.08)' stroke-width='0.5'/><path d='M18,18 L18,232 L382,232 L382,18 Z' fill='none' stroke='rgba(139,105,20,0.05)' stroke-width='0.5'/></svg>` },

  { id:'bordeaux', label:'Bordeaux', cat:'Classic',
    bg:'#1a0008', bg2:'#2d0010', textColor:'#ffe8f0', accent:'#ff6080', mode:'gradient',
    overlay:`radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,96,128,0.07) 0%, transparent 55%)`,
    border:'rgba(255,96,128,0.12)', glow:'rgba(255,96,128,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,1 L400,1' stroke='rgba(255,96,128,0.1)' stroke-width='1.5'/><path d='M0,5 L400,5' stroke='rgba(255,96,128,0.05)' stroke-width='0.5'/><path d='M0,240 L400,240' stroke='rgba(255,96,128,0.06)' stroke-width='0.5'/></svg>` },

  { id:'verdant', label:'Verdant', cat:'Classic',
    bg:'#040e06', bg2:'#081808', textColor:'#e0f0e4', accent:'#60c880', mode:'gradient',
    overlay:`linear-gradient(160deg, rgba(96,200,128,0.05) 0%, transparent 40%)`,
    border:'rgba(96,200,128,0.12)', glow:'rgba(96,200,128,0.06)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><path d='M0,240 Q200,220 400,240' fill='none' stroke='rgba(96,200,128,0.07)' stroke-width='1'/><line x1='0' y1='2' x2='400' y2='2' stroke='rgba(96,200,128,0.05)' stroke-width='0.5'/></svg>` },

  { id:'cobalt', label:'Cobalt', cat:'Classic',
    bg:'#000818', bg2:'#001028', textColor:'#e0eeff', accent:'#4080ff', mode:'gradient',
    overlay:`linear-gradient(135deg, rgba(64,128,255,0.05) 0%, transparent 55%)`,
    border:'rgba(64,128,255,0.15)', glow:'rgba(64,128,255,0.08)',
    svg:`<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 250' preserveAspectRatio='xMidYMid slice'><circle cx='380' cy='240' r='80' fill='none' stroke='rgba(64,128,255,0.07)' stroke-width='1'/><circle cx='380' cy='240' r='55' fill='none' stroke='rgba(64,128,255,0.05)' stroke-width='0.5'/><line x1='0' y1='248' x2='400' y2='248' stroke='rgba(64,128,255,0.06)' stroke-width='0.5'/></svg>` },
]

const CATS = [...new Set(TEMPLATES.map(t=>t.cat))]

const FONTS = [
  { id:'dm',        name:'DM Sans',    css:"'DM Sans',sans-serif" },
  { id:'syne',      name:'Syne',       css:"'Syne',sans-serif" },
  { id:'playfair',  name:'Playfair',   css:"'Playfair Display',serif" },
  { id:'cormorant', name:'Cormorant',  css:"'Cormorant Garamond',serif" },
  { id:'bebas',     name:'Bebas Neue', css:"'Bebas Neue',cursive" },
  { id:'josefin',   name:'Josefin',    css:"'Josefin Sans',sans-serif" },
]

type Form = {
  fullName:string;title:string;company:string;photoUrl:string;logoUrl:string;
  phone:string;whatsapp:string;email:string;tagline:string;bio:string;
  services:string;telegram:string;instagram:string;linkedin:string;
  twitter:string;tiktok:string;youtube:string;website:string;address:string;
}
type Design = { template:string;font:string;mode:string;bg:string;bg2:string;textColor:string;accent:string }
type Pos = { x:number; y:number }

const INIT_FORM: Form = {
  fullName:'',title:'',company:'',photoUrl:'',logoUrl:'',phone:'',whatsapp:'',
  email:'',tagline:'',bio:'',services:'',telegram:'',instagram:'',linkedin:'',
  twitter:'',tiktok:'',youtube:'',website:'',address:'',
}
const INIT_DESIGN: Design = {
  template:'vynk-dark',font:'dm',mode:'gradient',
  bg:'#0D0F12',bg2:'#1a1a24',textColor:'#BFC3C9',accent:'#D4A84F',
}

const nmInp:React.CSSProperties = {
  width:'100%', padding:'9px 12px', background:C.g, boxShadow:insetSm,
  border:'1px solid rgba(255,255,255,0.04)', borderRadius:'10px', color:C.silver,
  fontFamily:"'DM Sans',sans-serif", fontSize:'13px', outline:'none',
}
const lbl:React.CSSProperties = {
  display:'block', fontSize:'10px', color:C.smoke,
  marginBottom:'5px', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' as const,
}

export default function BuilderPage() {
  const router = useRouter()
  const photoRef = useRef<HTMLInputElement>(null)
  const logoRef  = useRef<HTMLInputElement>(null)
  const cardRef  = useRef<HTMLDivElement>(null)

  const [form, setForm]             = useState<Form>(INIT_FORM)
  const [design, setDesign]         = useState<Design>(INIT_DESIGN)
  const [originalForm, setOriginal] = useState<Form|null>(null)
  const [existingCard, setExisting] = useState<any>(null)
  const [isFlipped, setIsFlipped]   = useState(false)
  const [promoCode, setPromoCode]   = useState('')
  const [promoValid, setPromoValid] = useState<boolean|null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [paidChanges, setPaidChanges] = useState<string[]>([])
  const [activeCat, setActiveCat]   = useState('Premium')
  const [activeTab, setActiveTab]   = useState<'front'|'back'|'design'|'preview'>('front')
  const [photoPos, setPhotoPos]     = useState<Pos>({x:72, y:10})
  const [logoPos, setLogoPos]       = useState<Pos>({x:10, y:72})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile]     = useState(false)

  useEffect(()=>{
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  },[])
  const [dragging, setDragging]     = useState<'photo'|'logo'|null>(null)
  const dragStart = useRef<{mx:number;my:number;ox:number;oy:number}|null>(null)

  useEffect(()=>{
    fetch('/api/cards').then(r=>r.json()).then(d=>{
      if(!d.card) return
      setExisting(d.card)
      const c=d.card
      const f:Form={
        fullName:c.fullName||'',title:c.title||'',company:c.company||'',
        photoUrl:c.photoUrl||'',logoUrl:c.logoUrl||'',phone:c.phone||'',
        whatsapp:c.whatsapp||'',email:c.email||'',tagline:c.tagline||'',
        bio:c.bio||'',services:(c.services||[]).join(', '),
        telegram:c.telegram||'',instagram:c.instagram||'',linkedin:c.linkedin||'',
        twitter:c.twitter||'',tiktok:c.tiktok||'',youtube:c.youtube||'',
        website:c.website||'',address:c.address||'',
      }
      setForm(f); setOriginal(f)
      if(c.design) setDesign(c.design)
    }).catch(()=>{})
  },[])

  const startDrag = useCallback((e:React.MouseEvent, type:'photo'|'logo')=>{
    e.preventDefault(); e.stopPropagation()
    const pos = type==='photo' ? photoPos : logoPos
    dragStart.current = { mx:e.clientX, my:e.clientY, ox:pos.x, oy:pos.y }
    setDragging(type)
  },[photoPos, logoPos])

  useEffect(()=>{
    if(!dragging) return
    const onMove = (e:MouseEvent) => {
      if(!dragStart.current || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const dx = ((e.clientX - dragStart.current.mx) / rect.width) * 100
      const dy = ((e.clientY - dragStart.current.my) / rect.height) * 100
      const nx = Math.max(0, Math.min(82, dragStart.current.ox + dx))
      const ny = Math.max(0, Math.min(82, dragStart.current.oy + dy))
      if(dragging==='photo') setPhotoPos({x:nx,y:ny})
      else setLogoPos({x:nx,y:ny})
    }
    const onUp = () => { setDragging(null); dragStart.current=null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  },[dragging])

  const set  = (k:keyof Form,v:string)   => setForm(f=>({...f,[k]:v}))
  const setD = (k:keyof Design,v:string) => setDesign(d=>({...d,[k]:v}))

  function applyTemplate(t:typeof TEMPLATES[0]) {
    setDesign(d=>({...d, template:t.id, bg:t.bg, bg2:t.bg2, textColor:t.textColor, accent:t.accent, mode:t.mode}))
  }

  function handleFile(e:React.ChangeEvent<HTMLInputElement>,field:'photoUrl'|'logoUrl'){
    const file=e.target.files?.[0]; if(!file) return
    if(file.size>5*1024*1024){toast.error('Image must be under 5MB');return}
    const reader=new FileReader()
    reader.onload=ev=>set(field,ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function validatePromo(){
    if(!promoCode.trim()) return
    const res=await fetch(`/api/promos/validate?code=${promoCode.trim()}`)
    const data=await res.json()
    setPromoValid(data.valid)
    data.valid?toast.success('Promo applied!'):toast.error(data.error||'Invalid code')
  }

  async function submit(confirmed=false){
    if(!form.fullName.trim()){toast.error('Full name is required');return}
    if(existingCard&&!confirmed&&originalForm){
      const changed=(Object.keys(form) as(keyof Form)[]).filter(k=>form[k]!==originalForm[k])
      const paid=changed.filter(k=>requiresPayment([k]))
      if(paid.length>0){setPaidChanges(paid);setShowWarning(true);return}
    }
    setSubmitting(true)
    try{
      const res=await fetch('/api/cards',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...form, services:form.services.split(',').map(s=>s.trim()).filter(Boolean), design, promoCode:promoValid?promoCode:undefined})
      })
      const data=await res.json()
      if(!res.ok) throw new Error(data.error||'Something went wrong')
      if(data.free){toast.success('Card published!');router.push(`/c/${data.slug}`)}
      else if(data.url){window.location.href=data.url}
    }catch(e:any){toast.error(e.message)}
    finally{setSubmitting(false)}
  }

  const tpl = TEMPLATES.find(t=>t.id===design.template)||TEMPLATES[0]
  const cardBg = design.mode==='gradient' ? `linear-gradient(135deg,${design.bg},${design.bg2})` : design.bg
  const fontCss = FONTS.find(f=>f.id===design.font)?.css||FONTS[0].css
  const initials = form.fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()||'YN'

  const tabBtn = (id:'front'|'back'|'design', label:string) => (
    <button onClick={()=>setActiveTab(id)} style={{flex:1,padding:'9px',borderRadius:'10px',border:'none',background:activeTab===id?`rgba(212,168,79,0.1)`:C.g,boxShadow:activeTab===id?insetSm:raisedSm,color:activeTab===id?C.gold:C.smoke,fontSize:'12px',fontWeight:activeTab===id?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s',borderBottom:activeTab===id?`1px solid rgba(212,168,79,0.2)`:'1px solid transparent'}}>
      {label}
    </button>
  )

  // SVG overlay as data URI
  const svgOverlay = tpl.svg ? `url("data:image/svg+xml;utf8,${encodeURIComponent(tpl.svg)}")` : 'none'


  // Mobile: bottom sheet height
  const [sheetH, setSheetH] = useState(220)
  const [showRotateHint, setShowRotateHint] = useState(true)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(()=>{
    const checkOri = () => {
      const land = window.innerWidth > window.innerHeight
      setIsLandscape(land)
      if(land) setShowRotateHint(false)
    }
    checkOri()
    window.addEventListener("resize", checkOri)
    return () => window.removeEventListener("resize", checkOri)
  },[])
  const sheetDragRef = useRef<{startY:number;startH:number}|null>(null)

  function onSheetDragStart(e:React.TouchEvent) {
    e.stopPropagation()
    sheetDragRef.current = {startY: e.touches[0].clientY, startH: sheetH}
  }
  function onSheetDragMove(e:React.TouchEvent) {
    if(!sheetDragRef.current) return
    e.preventDefault()
    const dy = sheetDragRef.current.startY - e.touches[0].clientY
    const nh = Math.max(80, Math.min(window.innerHeight * 0.88, sheetDragRef.current.startH + dy))
    setSheetH(nh)
  }
  function onSheetDragEnd() { sheetDragRef.current = null }

  const MOBILE_TABS = [
    {id:'front',icon:'👤',label:'Info'},
    {id:'back', icon:'📝',label:'Content'},
    {id:'design',icon:'🎨',label:'Design'},
    {id:'preview',icon:'👁',label:'Preview'},
  ] as const

  // ── MOBILE LAYOUT ──────────────────────────────────────────────
  // LANDSCAPE MOBILE
  if (isMobile && isLandscape) return (
    <div style={{height:'100dvh',width:'100vw',background:C.g,display:'flex',flexDirection:'row',fontFamily:"'DM Sans',sans-serif",overflow:'hidden'}}>
      {showWarning&&(
        <div style={{position:'fixed',inset:0,background:'rgba(5,6,7,0.9)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
          <div style={{background:C.g,borderRadius:'20px',padding:'20px',width:'100%',maxWidth:'320px',border:'1px solid rgba(212,168,79,0.08)'}}>
            <h2 style={{fontSize:'13px',fontWeight:700,marginBottom:'6px',color:C.silver}}>Identity change — $10</h2>
            <p style={{color:C.smoke,fontSize:'11px',marginBottom:'12px'}}>Changed: <span style={{color:C.gold}}>{paidChanges.map(k=>FIELD_LABELS[k]||k).join(', ')}</span></p>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>{setShowWarning(false);setPaidChanges([])}} style={{flex:1,padding:'9px',background:C.g,boxShadow:raisedSm,border:'none',borderRadius:'9px',color:C.smoke,fontSize:'11px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
              <button onClick={()=>{setShowWarning(false);submit(true)}} style={{flex:1,padding:'9px',background:`linear-gradient(135deg,${C.gold},${C.goldLt})`,color:C.carbon,borderRadius:'9px',fontSize:'11px',fontWeight:700,border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Pay $10</button>
            </div>
          </div>
        </div>
      )}
      {/* LEFT panel — ocultable */}
      <div style={{width:sidebarOpen?'190px':'0px',flexShrink:0,overflow:'hidden',transition:'width .2s',background:C.g,borderRight:'1px solid rgba(255,255,255,0.03)',display:'flex',flexDirection:'column'}}>
        <div style={{width:'190px',height:'100%',display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',gap:'3px',padding:'6px',borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
            {([['front','Info'],['back','Content'],['design','Design']] as const).map(([id,lbl])=>(
              <button key={id} onClick={()=>setActiveTab(id)} style={{flex:1,padding:'5px 3px',borderRadius:'7px',border:'none',background:activeTab===id?'rgba(212,168,79,0.1)':C.g,boxShadow:activeTab===id?insetSm:raisedSm,color:activeTab===id?C.gold:C.smoke,fontSize:'9px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{lbl}</button>
            ))}
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'6px',display:'flex',flexDirection:'column',gap:'5px'}}>
            {activeTab==='front'&&(<>
              <input style={{...nmInp,fontSize:'11px',padding:'6px 8px'}} placeholder="Full Name *" value={form.fullName} onChange={e=>set('fullName',e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px'}}>
                <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Title" value={form.title} onChange={e=>set('title',e.target.value)}/>
                <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Company" value={form.company} onChange={e=>set('company',e.target.value)}/>
              </div>
              <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Email" value={form.email} onChange={e=>set('email',e.target.value)}/>
              <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Phone" value={form.phone} onChange={e=>set('phone',e.target.value)}/>
            </>)}
            {activeTab==='back'&&(<>
              <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Tagline" value={form.tagline} onChange={e=>set('tagline',e.target.value)}/>
              <textarea style={{...nmInp,fontSize:'10px',padding:'5px 7px',height:'48px',resize:'none',lineHeight:1.4}} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Bio..."/>
              <input style={{...nmInp,fontSize:'10px',padding:'5px 7px'}} placeholder="Services (comma sep)" value={form.services} onChange={e=>set('services',e.target.value)}/>
            </>)}
            {activeTab==='design'&&(<>
              <div style={{display:'flex',gap:'2px',flexWrap:'wrap'}}>
                {CATS.map(cat=>(<button key={cat} onClick={()=>setActiveCat(cat)} style={{padding:'2px 5px',borderRadius:'20px',border:'none',background:activeCat===cat?'rgba(212,168,79,0.12)':'rgba(255,255,255,0.04)',color:activeCat===cat?C.gold:C.smoke,fontSize:'8px',fontWeight:activeCat===cat?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{cat}</button>))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'3px'}}>
                {TEMPLATES.filter(t=>t.cat===activeCat).map(t=>(<button key={t.id} onClick={()=>applyTemplate(t)} style={{height:'26px',borderRadius:'6px',cursor:'pointer',background:t.mode==='gradient'?`linear-gradient(135deg,${t.bg},${t.bg2})`:t.bg,border:`2px solid ${design.template===t.id?t.accent:'rgba(255,255,255,0.06)'}`,position:'relative',overflow:'hidden'}}><div style={{position:'absolute',bottom:'2px',right:'2px',width:'3px',height:'3px',borderRadius:'50%',background:t.accent}}/></button>))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'3px'}}>
                {FONTS.map(f=>(<button key={f.id} onClick={()=>setD('font',f.id)} style={{fontFamily:f.css,padding:'5px 2px',borderRadius:'7px',background:C.g,boxShadow:design.font===f.id?insetSm:raisedSm,border:`1px solid ${design.font===f.id?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,color:design.font===f.id?C.gold:C.smoke,fontSize:'9px',fontWeight:600,cursor:'pointer',outline:'none'}}>{f.name}</button>))}
              </div>
            </>)}
          </div>
          <div style={{padding:'6px',borderTop:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
            <button onClick={()=>submit()} disabled={submitting} style={{width:'100%',padding:'9px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'9px',fontWeight:700,fontSize:'11px',border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif",opacity:submitting?.7:1}}>
              {submitting?'…':existingCard?'Save':'$20'}
            </button>
          </div>
        </div>
      </div>

      {/* CANVAS */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 60% 80% at 50% 50%, ${tpl.glow} 0%, transparent 70%)`,pointerEvents:'none'}}/>
        {/* Toggle left */}
        <button onClick={()=>setSidebarOpen(v=>!v)} style={{position:'absolute',left:'6px',top:'50%',transform:'translateY(-50%)',zIndex:10,width:'24px',height:'44px',borderRadius:'7px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',color:C.smoke,fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',touchAction:'manipulation'}}>
          {sidebarOpen?'‹':'›'}
        </button>
        {/* Card - ocupa el alto disponible */}
        <div style={{background:C.g,boxShadow:`8px 8px 20px ${C.nd},-5px -5px 14px ${C.nl}`,borderRadius:'16px',padding:'8px',border:`1px solid ${tpl.border}`,height:'calc(100dvh - 16px)',aspectRatio:'1.6/1',position:'relative'}}>
          <div style={{perspective:'800px',height:'100%'}}>
            <div ref={cardRef} onClick={()=>!dragging&&setIsFlipped(f=>!f)} style={{position:'relative',transformStyle:'preserve-3d',transition:dragging?'none':'transform .6s cubic-bezier(0.23,1,0.32,1)',transform:isFlipped?'rotateY(180deg)':'rotateY(0deg)',cursor:'pointer',height:'100%',borderRadius:'12px',userSelect:'none'}}>
              <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',background:cardBg,borderRadius:'12px',padding:'16px',color:design.textColor,height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',fontFamily:fontCss,position:'relative',overflow:'hidden'}}>
                {tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                <div style={{position:'absolute',inset:0,borderRadius:'12px',border:`1px solid ${tpl.border}`,pointerEvents:'none'}}/>
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:'7px',fontWeight:700,letterSpacing:'.12em',opacity:.3,textTransform:'uppercase',marginBottom:'10px',color:design.accent}}>VYNK</div>
                  <div style={{fontSize:'20px',fontWeight:700,lineHeight:1.15}}>{form.fullName||'Your Name'}</div>
                  <div style={{fontSize:'11px',opacity:.7,marginTop:'3px'}}>{[form.title,form.company].filter(Boolean).join(' · ')||'Title · Company'}</div>
                </div>
                {!form.photoUrl&&<div style={{position:'absolute',top:'14px',right:'14px',width:'38px',height:'38px',borderRadius:'50%',background:`${design.accent}18`,border:`2px solid ${design.accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:700,color:design.accent}}>{initials}</div>}
                <div style={{position:'relative',zIndex:1}}>
                  {form.email&&<div style={{fontSize:'10px',opacity:.55}}>{form.email}</div>}
                  <div style={{marginTop:'10px',width:'50%',height:'1px',background:`linear-gradient(90deg,${design.accent}60,transparent)`}}/>
                </div>
              </div>
              <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',position:'absolute',top:0,left:0,right:0,bottom:0,background:cardBg,borderRadius:'12px',padding:'16px',color:design.textColor,height:'100%',display:'flex',flexDirection:'column',gap:'8px',fontFamily:fontCss,filter:'brightness(0.85)',overflow:'hidden'}}>
                {tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:'7px',opacity:.3,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:'6px',color:design.accent}}>SERVICES</div>
                  {form.services&&<div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>{form.services.split(',').filter(Boolean).map(s=><span key={s} style={{padding:'2px 7px',borderRadius:'20px',fontSize:'9px',fontWeight:600,background:`${design.accent}18`,border:`1px solid ${design.accent}35`,color:design.accent}}>{s.trim()}</span>)}</div>}
                  {form.bio&&<div style={{fontSize:'10px',opacity:.6,lineHeight:1.6,marginTop:'6px'}}>{form.bio}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Actions right */}
        <div style={{position:'absolute',right:'6px',top:'50%',transform:'translateY(-50%)',display:'flex',flexDirection:'column',gap:'5px',zIndex:10}}>
          <button onClick={()=>setIsFlipped(f=>!f)} style={{width:'26px',height:'26px',borderRadius:'7px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',color:C.smoke,fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',touchAction:'manipulation'}}>↻</button>
          {existingCard&&<a href={`/c/${existingCard.slug}`} style={{width:'26px',height:'26px',borderRadius:'7px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(212,168,79,0.1)',color:C.gold,fontSize:'9px',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,touchAction:'manipulation'}}>→</a>}
        </div>
        <div style={{position:'absolute',bottom:'4px',left:'50%',transform:'translateX(-50%)',fontSize:'8px',color:C.smoke,whiteSpace:'nowrap'}}>
          <span style={{color:C.gold,fontWeight:700}}>{tpl.label}</span> · tap to flip
        </div>
      </div>
    </div>
  )

  if (isMobile) return (
    <div style={{height:'100dvh',background:C.g,display:'flex',flexDirection:'column',fontFamily:"'DM Sans',sans-serif",overflow:'hidden',position:'relative'}}>

      {/* Rotate hint overlay */}
      {showRotateHint && !isLandscape && (
        <div
          onClick={()=>setShowRotateHint(false)}
          onTouchStart={()=>setShowRotateHint(false)}
          style={{position:"fixed",inset:0,zIndex:200,background:"rgba(5,6,7,0.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"24px",cursor:"pointer"}}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="35" y="10" width="50" height="80" rx="8" fill="none" stroke="rgba(212,168,79,0.2)" strokeWidth="2"/>
            <rect x="39" y="14" width="42" height="72" rx="6" fill="rgba(212,168,79,0.04)"/>
            <circle cx="60" cy="78" r="3" fill="rgba(212,168,79,0.4)"/>
            <path d="M 90 50 C 100 30 110 40 105 55" stroke="#D4A84F" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>
            <path d="M 105 55 L 108 48 M 105 55 L 99 53" stroke="#D4A84F" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 30 50 C 20 30 10 40 15 55" stroke="rgba(212,168,79,0.4)" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M 15 55 L 12 48 M 15 55 L 21 53" stroke="rgba(212,168,79,0.4)" strokeWidth="2" strokeLinecap="round"/>
            <rect x="10" y="35" width="80" height="50" rx="8" fill="none" stroke="#BFC3C9" strokeWidth="2" strokeDasharray="4 3" opacity="0.3"/>
          </svg>
          <div style={{textAlign:"center",padding:"0 32px"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"18px",color:"#D4A84F",marginBottom:"8px"}}>Rotate for better editing</div>
            <div style={{fontSize:"13px",color:"#6F737A",lineHeight:1.6}}>Turn your device horizontally<br/>for full builder experience</div>
          </div>
          <div style={{padding:"10px 24px",background:"rgba(212,168,79,0.08)",border:"1px solid rgba(212,168,79,0.2)",borderRadius:"20px",fontSize:"12px",color:"#D4A84F",fontWeight:600}}>Tap anywhere to dismiss</div>
        </div>
      )}
      {/* Mobile topbar — minimal */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',background:C.g,boxShadow:`0 3px 12px ${C.nd}`,borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0,zIndex:10}}>
        <div style={{padding:'6px 10px',background:C.g,boxShadow:raised,borderRadius:'10px',border:'1px solid rgba(212,168,79,0.07)'}}>
          <img src="/logo.png" alt="Vynk" style={{height:'22px',width:'auto',display:'block'}}/>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          {existingCard&&<Link href={`/c/${existingCard.slug}`} style={{fontSize:'11px',color:C.gold,textDecoration:'none',padding:'5px 10px',background:C.g,boxShadow:raisedSm,borderRadius:'8px'}}>View →</Link>}
          <button onClick={()=>submit()} disabled={submitting}
            style={{padding:'7px 14px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'10px',fontWeight:700,fontSize:'11px',border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif",opacity:submitting?.7:1}}>
            {submitting?'…':existingCard?'Save':'$20'}
          </button>
        </div>
      </div>

      {/* Warning modal */}
      {showWarning&&(
        <div style={{position:'fixed',inset:0,background:'rgba(5,6,7,0.9)',zIndex:100,display:'flex',alignItems:'flex-end',padding:'0'}}>
          <div style={{background:C.g,boxShadow:`0 -8px 32px ${C.nd}`,borderRadius:'24px 24px 0 0',padding:'28px 24px',width:'100%',border:'1px solid rgba(212,168,79,0.08)'}}>
            <h2 style={{fontSize:'16px',fontWeight:700,marginBottom:'8px',color:C.silver,fontFamily:"'Syne',sans-serif"}}>⚠️ Identity change — $10</h2>
            <p style={{color:C.smoke,fontSize:'13px',marginBottom:'20px',lineHeight:1.6}}>Changed: <span style={{color:C.gold}}>{paidChanges.map(k=>FIELD_LABELS[k]||k).join(', ')}</span></p>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>{setShowWarning(false);setPaidChanges([])}} style={{flex:1,padding:'12px',background:C.g,boxShadow:raisedSm,border:'none',borderRadius:'12px',color:C.smoke,fontSize:'13px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
              <button onClick={()=>{setShowWarning(false);submit(true)}} style={{flex:1,padding:'12px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'12px',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif"}}>Pay $10</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview area — fills space above bottom sheet */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'12px',overflow:'hidden',paddingBottom:`${sheetH + 56}px`}}>
        <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 70% 50% at 50% 40%, ${tpl.glow} 0%, transparent 70%)`,pointerEvents:'none'}}/>
        <div style={{background:C.g,boxShadow:`8px 8px 24px ${C.nd},-5px -5px 16px ${C.nl}`,borderRadius:'20px',padding:'12px',border:`1px solid ${tpl.border}`,width:'100%',maxWidth:'360px',position:'relative',zIndex:1}}>
          <div style={{perspective:'800px'}}>
            <div ref={cardRef} onClick={()=>!dragging&&setIsFlipped(f=>!f)}
              style={{position:'relative',transformStyle:'preserve-3d',transition:dragging?'none':'transform .6s cubic-bezier(0.23,1,0.32,1)',transform:isFlipped?'rotateY(180deg)':'rotateY(0deg)',cursor:'pointer',minHeight:'180px',borderRadius:'16px',userSelect:'none'}}>

              {/* FRONT */}
              <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',background:cardBg,borderRadius:'16px',padding:'20px',color:design.textColor,minHeight:'180px',display:'flex',flexDirection:'column',justifyContent:'space-between',fontFamily:fontCss,position:'relative',overflow:'hidden'}}>
                {tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                <div style={{position:'absolute',inset:0,borderRadius:'16px',border:`1px solid ${tpl.border}`,pointerEvents:'none'}}/>
                {form.photoUrl&&(
                  <div onMouseDown={e=>startDrag(e,'photo')} style={{position:'absolute',left:`${photoPos.x}%`,top:`${photoPos.y}%`,width:'44px',height:'44px',borderRadius:'50%',overflow:'hidden',border:`2px solid ${design.accent}60`,cursor:'grab',zIndex:10}}>
                    <img src={form.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} draggable={false}/>
                  </div>
                )}
                {form.logoUrl&&(
                  <div onMouseDown={e=>startDrag(e,'logo')} style={{position:'absolute',left:`${logoPos.x}%`,top:`${logoPos.y}%`,cursor:'grab',zIndex:10}}>
                    <img src={form.logoUrl} alt="logo" style={{height:'20px',objectFit:'contain'}} draggable={false}/>
                  </div>
                )}
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:'7px',fontWeight:700,letterSpacing:'.12em',opacity:.3,textTransform:'uppercase',marginBottom:'12px',color:design.accent}}>VYNK</div>
                  <div style={{fontSize:'18px',fontWeight:700,lineHeight:1.2}}>{form.fullName||'Your Name'}</div>
                  <div style={{fontSize:'11px',opacity:.7,marginTop:'3px'}}>{[form.title,form.company].filter(Boolean).join(' · ')||'Title · Company'}</div>
                </div>
                {!form.photoUrl&&<div style={{position:'absolute',top:'16px',right:'16px',width:'38px',height:'38px',borderRadius:'50%',background:`${design.accent}18`,border:`2px solid ${design.accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:700,color:design.accent}}>{initials}</div>}
                <div style={{position:'relative',zIndex:1}}>
                  {form.email&&<div style={{fontSize:'10px',opacity:.55}}>{form.email}</div>}
                  <div style={{marginTop:'10px',width:'50%',height:'1px',background:`linear-gradient(90deg,${design.accent}60,transparent)`}}/>
                </div>
              </div>

              {/* BACK */}
              <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',position:'absolute',top:0,left:0,right:0,bottom:0,background:cardBg,borderRadius:'16px',padding:'20px',color:design.textColor,minHeight:'180px',display:'flex',flexDirection:'column',gap:'10px',fontFamily:fontCss,filter:'brightness(0.85)',overflow:'hidden'}}>
                {tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                <div style={{position:'relative',zIndex:1}}>
                  <div style={{fontSize:'7px',opacity:.3,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:'8px',color:design.accent}}>SERVICES</div>
                  {form.services&&<div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>{form.services.split(',').filter(Boolean).map(s=><span key={s} style={{padding:'3px 8px',borderRadius:'20px',fontSize:'9px',fontWeight:600,background:`${design.accent}18`,border:`1px solid ${design.accent}35`,color:design.accent}}>{s.trim()}</span>)}</div>}
                  {form.bio&&<div style={{fontSize:'10px',opacity:.6,lineHeight:1.6,marginTop:'8px'}}>{form.bio}</div>}
                </div>
              </div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'8px',padding:'0 2px'}}>
            <span style={{fontSize:'9px',color:C.smoke}}><span style={{color:C.gold,fontWeight:700}}>{tpl.label}</span> · {FONTS.find(f=>f.id===design.font)?.name}</span>
            <span style={{fontSize:'9px',color:C.smoke}}>tap ↻</span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM SHEET ── */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:30,
        background:C.g, borderRadius:'20px 20px 0 0',
        boxShadow:`0 -8px 32px ${C.nd}`,
        border:'1px solid rgba(255,255,255,0.04)',
        height:`${sheetH}px`,
        display:'flex', flexDirection:'column',
        transition: sheetDragRef.current ? 'none' : 'height .2s',
      }}>
        {/* Drag handle — área táctil grande para mayor sensibilidad */}
        <div
          onTouchStart={onSheetDragStart}
          onTouchMove={onSheetDragMove}
          onTouchEnd={onSheetDragEnd}
          style={{padding:'16px 0 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',cursor:'grab',flexShrink:0,touchAction:'none',minHeight:'44px',justifyContent:'center'}}>
          <div style={{width:'48px',height:'5px',borderRadius:'3px',background:C.smoke,opacity:.45}}/>
        </div>

        {/* Tab bar */}
        <div style={{display:'flex',gap:'6px',padding:'0 12px 8px',flexShrink:0}}>
          {MOBILE_TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id as any)}
              style={{flex:1,padding:'8px 4px',borderRadius:'10px',border:'none',background:activeTab===t.id?`rgba(212,168,79,0.1)`:C.g,boxShadow:activeTab===t.id?insetSm:raisedSm,color:activeTab===t.id?C.gold:C.smoke,fontSize:'9px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',transition:'all .15s'}}>
              <span style={{fontSize:'14px'}}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Sheet content */}
        <div style={{flex:1,overflowY:'auto',padding:'0 12px 12px',display:'flex',flexDirection:'column',gap:'8px'}}>

          {activeTab==='front'&&(
            <>
              <div style={{fontSize:'9px',color:C.gold,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Identity — $10 to change</div>
              <input style={nmInp} placeholder="Full Name *" value={form.fullName} onChange={e=>set('fullName',e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                <input style={nmInp} placeholder="Title" value={form.title} onChange={e=>set('title',e.target.value)}/>
                <input style={nmInp} placeholder="Company" value={form.company} onChange={e=>set('company',e.target.value)}/>
              </div>
              <input style={nmInp} placeholder="Email" value={form.email} onChange={e=>set('email',e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                <input style={nmInp} placeholder="Phone" value={form.phone} onChange={e=>set('phone',e.target.value)}/>
                <input style={nmInp} placeholder="WhatsApp" value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                <div style={{display:'flex',gap:'4px'}}>
                  <button onClick={()=>photoRef.current?.click()} style={{flex:1,padding:'8px',background:C.g,boxShadow:form.photoUrl?insetSm:raisedSm,border:`1px solid ${form.photoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'8px',color:form.photoUrl?C.gold:C.smoke,fontSize:'10px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{form.photoUrl?'✓ Photo':'📷 Photo'}</button>
                  {form.photoUrl&&<button onClick={()=>set('photoUrl','')} style={{padding:'8px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',color:'#ef4444',fontSize:'11px',cursor:'pointer'}}>✕</button>}
                  <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'photoUrl')}/>
                </div>
                <div style={{display:'flex',gap:'4px'}}>
                  <button onClick={()=>logoRef.current?.click()} style={{flex:1,padding:'8px',background:C.g,boxShadow:form.logoUrl?insetSm:raisedSm,border:`1px solid ${form.logoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'8px',color:form.logoUrl?C.gold:C.smoke,fontSize:'10px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{form.logoUrl?'✓ Logo':'🔷 Logo'}</button>
                  {form.logoUrl&&<button onClick={()=>set('logoUrl','')} style={{padding:'8px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',color:'#ef4444',fontSize:'11px',cursor:'pointer'}}>✕</button>}
                  <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'logoUrl')}/>
                </div>
              </div>
            </>
          )}

          {activeTab==='back'&&(
            <>
              <div style={{fontSize:'9px',color:'#4ade80',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>Content — free</div>
              <input style={nmInp} placeholder="Tagline" value={form.tagline} onChange={e=>set('tagline',e.target.value)}/>
              <textarea style={{...nmInp,height:'60px',resize:'none',lineHeight:1.5}} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Bio..."/>
              <input style={nmInp} placeholder="Services (comma-separated)" value={form.services} onChange={e=>set('services',e.target.value)}/>
              <input style={nmInp} placeholder="Website" value={form.website} onChange={e=>set('website',e.target.value)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                {(['instagram','linkedin','twitter','telegram','tiktok','youtube'] as const).map(k=>(
                  <input key={k} style={nmInp} placeholder={`@${k}`} value={form[k]} onChange={e=>set(k,e.target.value)}/>
                ))}
              </div>
            </>
          )}

          {activeTab==='design'&&(
            <>
              <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                {CATS.map(cat=>(
                  <button key={cat} onClick={()=>setActiveCat(cat)} style={{padding:'4px 8px',borderRadius:'20px',border:'none',background:activeCat===cat?`rgba(212,168,79,0.12)`:'rgba(255,255,255,0.04)',color:activeCat===cat?C.gold:C.smoke,fontSize:'10px',fontWeight:activeCat===cat?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                    {cat}
                  </button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'5px'}}>
                {TEMPLATES.filter(t=>t.cat===activeCat).map(t=>(
                  <button key={t.id} title={t.label} onClick={()=>applyTemplate(t)}
                    style={{height:'36px',borderRadius:'8px',cursor:'pointer',background:t.mode==='gradient'?`linear-gradient(135deg,${t.bg},${t.bg2})`:t.bg,border:`2px solid ${design.template===t.id?t.accent:'rgba(255,255,255,0.06)'}`,boxShadow:design.template===t.id?`0 0 0 1px ${t.accent}55`:raisedSm,transition:'all .15s',position:'relative',overflow:'hidden'}}>
                    {t.svg&&<div style={{position:'absolute',inset:0,backgroundImage:`url("data:image/svg+xml;utf8,${encodeURIComponent(t.svg)}")`,backgroundSize:'cover',opacity:.6}}/>}
                    <div style={{position:'absolute',bottom:'2px',right:'3px',width:'4px',height:'4px',borderRadius:'50%',background:t.accent,zIndex:1}}/>
                  </button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'5px'}}>
                {FONTS.map(f=>(
                  <button key={f.id} onClick={()=>setD('font',f.id)} style={{fontFamily:f.css,padding:'6px 4px',borderRadius:'8px',background:C.g,boxShadow:design.font===f.id?insetSm:raisedSm,border:`1px solid ${design.font===f.id?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,color:design.font===f.id?C.gold:C.smoke,fontSize:'10px',fontWeight:600,cursor:'pointer',transition:'all .15s',outline:'none'}}>
                    {f.name}
                  </button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'6px'}}>
                {[{k:'bg',l:'BG'},{k:'bg2',l:'BG2'},{k:'textColor',l:'Text'},{k:'accent',l:'Accent'}].map(({k,l})=>(
                  <div key={k}>
                    <div style={{fontSize:'9px',color:C.smoke,marginBottom:'3px',fontWeight:600,textAlign:'center'}}>{l}</div>
                    <input type="color" value={(design as any)[k]||'#000000'} onChange={e=>setD(k as keyof Design,e.target.value)} style={{width:'100%',height:'28px',borderRadius:'6px',border:'none',background:C.g,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'6px'}}>
                <input style={{...nmInp,flex:1,fontSize:'12px',padding:'8px 10px'}} placeholder="Promo code" value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())}/>
                <button onClick={validatePromo} style={{padding:'8px 12px',background:C.g,boxShadow:raisedSm,border:'none',borderRadius:'8px',color:promoValid?C.gold:C.smoke,fontSize:'11px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Apply</button>
              </div>
            </>
          )}

          {activeTab==='preview'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              <div style={{fontSize:'11px',color:C.smoke,textAlign:'center',opacity:.7}}>Tap the card above to flip it</div>
              <div style={{padding:'12px',background:C.g,boxShadow:insetSm,borderRadius:'12px',fontSize:'11px',color:C.smoke}}>
                <div style={{marginBottom:'4px'}}><span style={{color:C.gold,fontWeight:700}}>Template:</span> {tpl.label}</div>
                <div style={{marginBottom:'4px'}}><span style={{color:C.gold,fontWeight:700}}>Font:</span> {FONTS.find(f=>f.id===design.font)?.name}</div>
                {existingCard&&<div><span style={{color:C.gold,fontWeight:700}}>Live at:</span> /c/{existingCard.slug}</div>}
              </div>
              <button onClick={()=>submit()} disabled={submitting}
                style={{width:'100%',padding:'14px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'12px',fontWeight:700,fontSize:'14px',border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif",opacity:submitting?.6:1}}>
                {submitting?'Processing…':existingCard?'Update card':'✨ Generate my card — $20'}
              </button>
              <p style={{fontSize:'10px',color:C.smoke,textAlign:'center',opacity:.6}}>{existingCard?'Free changes instant · Identity $10':'One-time · Colors & content free'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── DESKTOP LAYOUT ─────────────────────────────────────────────
  return (
    <div style={{height:'100dvh',background:C.g,display:'flex',flexDirection:'column',fontFamily:"'DM Sans',sans-serif",overflow:'hidden'}}>

      {/* NAV */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 20px',background:C.g,boxShadow:`0 4px 16px ${C.nd}`,borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
        <div style={{padding:'8px 14px',background:C.g,boxShadow:raised,borderRadius:'12px',border:'1px solid rgba(212,168,79,0.07)',display:'inline-flex',alignItems:'center'}}>
          <img src="/logo.png" alt="Vynk" style={{width:'80px',height:'auto',display:'block'}}/>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <div style={{fontSize:'11px',color:C.smoke,padding:'6px 12px',background:C.g,boxShadow:insetSm,borderRadius:'8px'}}>Card Builder</div>
          {existingCard&&<Link href={`/c/${existingCard.slug}`} style={{fontSize:'11px',color:C.gold,textDecoration:'none',padding:'6px 12px',background:C.g,boxShadow:raisedSm,borderRadius:'8px'}}>View card →</Link>}
        </div>
      </nav>

      {showWarning&&(
        <div style={{position:'fixed',inset:0,background:'rgba(5,6,7,0.88)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:C.g,boxShadow:`14px 14px 36px ${C.nd},-8px -8px 24px ${C.nl}`,borderRadius:'24px',padding:'36px',maxWidth:'420px',width:'100%',border:'1px solid rgba(212,168,79,0.08)'}}>
            <div style={{fontSize:'28px',marginBottom:'12px'}}>⚠️</div>
            <h2 style={{fontSize:'16px',fontWeight:700,marginBottom:'8px',color:C.silver,fontFamily:"'Syne',sans-serif"}}>Identity change detected</h2>
            <p style={{color:C.smoke,fontSize:'13px',marginBottom:'20px',lineHeight:1.7}}>
              Changed: <span style={{color:C.gold,fontWeight:600}}>{paidChanges.map(k=>FIELD_LABELS[k]||k).join(', ')}</span><br/><br/>
              Your current card will be <strong style={{color:C.silver}}>archived</strong> and a new one published for <strong style={{color:C.gold}}>$10</strong>.
            </p>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>{setShowWarning(false);setPaidChanges([])}} style={{flex:1,padding:'12px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',borderRadius:'12px',color:C.smoke,fontSize:'13px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
              <button onClick={()=>{setShowWarning(false);submit(true)}} style={{flex:1,padding:'12px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'12px',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',boxShadow:goldBox,fontFamily:"'DM Sans',sans-serif"}}>Pay $10 & update</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>

        {/* LEFT PANEL — overlay on mobile */}
        {isMobile&&sidebarOpen&&(
          <div onClick={()=>setSidebarOpen(false)} style={{position:'fixed',inset:0,background:'rgba(5,6,7,0.7)',zIndex:40}}/>
        )}
        <aside style={{
          width:'320px', flexShrink:0, background:C.g,
          borderRight:'1px solid rgba(255,255,255,0.03)',
          display:'flex', flexDirection:'column', overflow:'hidden',
          ...(isMobile ? {
            position:'fixed', top:0, left:0, bottom:0, zIndex:50,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform .25s ease',
            boxShadow: `8px 0 32px ${C.nd}`,
          } : {}),
        }}>
          <div style={{display:'flex',gap:'6px',padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,0.03)',flexShrink:0}}>
            {tabBtn('front','Front')}
            {tabBtn('back','Back')}
            {tabBtn('design','Design')}
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'16px 14px',display:'flex',flexDirection:'column',gap:'10px'}}>

            {activeTab==='front'&&(
              <>
                <div style={{fontSize:'9px',color:C.gold,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{width:'16px',height:'1px',background:C.gold}}/> Identity — $10 to change
                </div>
                <div><label style={lbl}>Full Name *</label><input style={nmInp} placeholder="Alexandra Reyes" value={form.fullName} onChange={e=>set('fullName',e.target.value)}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <div><label style={lbl}>Title</label><input style={nmInp} placeholder="CEO" value={form.title} onChange={e=>set('title',e.target.value)}/></div>
                  <div><label style={lbl}>Company</label><input style={nmInp} placeholder="Acme" value={form.company} onChange={e=>set('company',e.target.value)}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <div><label style={lbl}>Phone</label><input style={nmInp} placeholder="+1 555 0100" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
                  <div><label style={lbl}>WhatsApp</label><input style={nmInp} placeholder="15550100" value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)}/></div>
                </div>
                <div><label style={lbl}>Email</label><input style={nmInp} placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  <div>
                    <label style={lbl}>Photo <span style={{color:C.smoke,fontWeight:400,fontSize:'9px'}}>(drag to reposition)</span></label>
                    <div style={{display:'flex',gap:'4px'}}>
                      <button onClick={()=>photoRef.current?.click()} style={{flex:1,padding:'9px',background:C.g,boxShadow:form.photoUrl?insetSm:raisedSm,border:`1px solid ${form.photoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'10px',color:form.photoUrl?C.gold:C.smoke,fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                        {form.photoUrl?'✓ Photo':'Upload'}
                      </button>
                      {form.photoUrl&&<button onClick={()=>set('photoUrl','')} style={{padding:'9px 10px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',color:'#ef4444',fontSize:'12px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>✕</button>}
                    </div>
                    <input ref={photoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'photoUrl')}/>
                  </div>
                  <div>
                    <label style={lbl}>Logo <span style={{color:C.smoke,fontWeight:400,fontSize:'9px'}}>(drag to reposition)</span></label>
                    <div style={{display:'flex',gap:'4px'}}>
                      <button onClick={()=>logoRef.current?.click()} style={{flex:1,padding:'9px',background:C.g,boxShadow:form.logoUrl?insetSm:raisedSm,border:`1px solid ${form.logoUrl?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,borderRadius:'10px',color:form.logoUrl?C.gold:C.smoke,fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                        {form.logoUrl?'✓ Logo':'Upload'}
                      </button>
                      {form.logoUrl&&<button onClick={()=>set('logoUrl','')} style={{padding:'9px 10px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',color:'#ef4444',fontSize:'12px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>✕</button>}
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e,'logoUrl')}/>
                  </div>
                </div>
              </>
            )}

            {activeTab==='back'&&(
              <>
                <div style={{fontSize:'9px',color:'#4ade80',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{width:'16px',height:'1px',background:'#4ade80'}}/> Content — always free
                </div>
                <div><label style={lbl}>Tagline</label><input style={nmInp} placeholder="We craft brands that move people." value={form.tagline} onChange={e=>set('tagline',e.target.value)}/></div>
                <div><label style={lbl}>Bio</label><textarea style={{...nmInp,height:'72px',resize:'none' as const,lineHeight:1.5}} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Brief description..."/></div>
                <div><label style={lbl}>Services (comma-separated)</label><input style={nmInp} placeholder="Branding, Strategy, UX" value={form.services} onChange={e=>set('services',e.target.value)}/></div>
                <div><label style={lbl}>Website</label><input style={nmInp} placeholder="yoursite.com" value={form.website} onChange={e=>set('website',e.target.value)}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  {(['instagram','linkedin','twitter','telegram','tiktok','youtube'] as const).map(k=>(
                    <div key={k}><label style={lbl}>{k.charAt(0).toUpperCase()+k.slice(1)}</label><input style={nmInp} placeholder="@handle" value={form[k]} onChange={e=>set(k,e.target.value)}/></div>
                  ))}
                </div>
              </>
            )}

            {activeTab==='design'&&(
              <>
                <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                  {CATS.map(cat=>(
                    <button key={cat} onClick={()=>setActiveCat(cat)} style={{padding:'4px 10px',borderRadius:'20px',border:'none',background:activeCat===cat?`rgba(212,168,79,0.12)`:'rgba(255,255,255,0.04)',color:activeCat===cat?C.gold:C.smoke,fontSize:'10px',fontWeight:activeCat===cat?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'all .15s'}}>
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Template grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'5px'}}>
                  {TEMPLATES.filter(t=>t.cat===activeCat).map(t=>(
                    <button key={t.id} title={t.label} onClick={()=>applyTemplate(t)}
                      style={{height:'38px',borderRadius:'9px',cursor:'pointer',
                        background:t.mode==='gradient'?`linear-gradient(135deg,${t.bg},${t.bg2})`:t.bg,
                        border:`2px solid ${design.template===t.id?t.accent:'rgba(255,255,255,0.06)'}`,
                        boxShadow:design.template===t.id?`0 0 0 1px ${t.accent}55, 3px 3px 8px ${C.nd}`:raisedSm,
                        transition:'all .15s', position:'relative', overflow:'hidden',
                      }}>
                      {t.svg&&<div style={{position:'absolute',inset:0,backgroundImage:`url("data:image/svg+xml;utf8,${encodeURIComponent(t.svg)}")`,backgroundSize:'cover',opacity:.6}}/>}
                      <div style={{position:'absolute',bottom:'3px',right:'4px',width:'5px',height:'5px',borderRadius:'50%',background:t.accent,zIndex:1}}/>
                    </button>
                  ))}
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>
                  {TEMPLATES.filter(t=>t.cat===activeCat).map(t=>(
                    <button key={t.id} onClick={()=>applyTemplate(t)} style={{padding:'3px 8px',borderRadius:'20px',border:'none',background:design.template===t.id?`rgba(212,168,79,0.1)`:'rgba(255,255,255,0.03)',color:design.template===t.id?C.gold:C.smoke,fontSize:'9px',fontWeight:design.template===t.id?700:400,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <label style={lbl}>Font</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'5px'}}>
                  {FONTS.map(f=>(
                    <button key={f.id} onClick={()=>setD('font',f.id)} style={{fontFamily:f.css,padding:'7px 4px',borderRadius:'9px',background:C.g,boxShadow:design.font===f.id?insetSm:raisedSm,border:`1px solid ${design.font===f.id?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,color:design.font===f.id?C.gold:C.smoke,fontSize:'10px',fontWeight:600,cursor:'pointer',transition:'all .15s',outline:'none'}}>
                      {f.name}
                    </button>
                  ))}
                </div>

                <label style={lbl}>Custom colors</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'6px'}}>
                  {[{k:'bg',l:'BG'},{k:'bg2',l:'BG2'},{k:'textColor',l:'Text'},{k:'accent',l:'Accent'}].map(({k,l})=>(
                    <div key={k}>
                      <label style={{...lbl,fontSize:'9px'}}>{l}</label>
                      <input type="color" value={(design as any)[k]||'#000000'} onChange={e=>setD(k as keyof Design,e.target.value)} style={{width:'100%',height:'30px',borderRadius:'7px',border:'none',background:C.g,boxShadow:raisedSm,cursor:'pointer',padding:'2px'}}/>
                    </div>
                  ))}
                </div>

                <label style={lbl}>Background</label>
                <div style={{display:'flex',gap:'5px'}}>
                  {['solid','gradient'].map(m=>(
                    <button key={m} onClick={()=>setD('mode',m)} style={{flex:1,padding:'7px',borderRadius:'9px',background:C.g,boxShadow:design.mode===m?insetSm:raisedSm,border:`1px solid ${design.mode===m?'rgba(212,168,79,0.2)':'rgba(255,255,255,0.04)'}`,color:design.mode===m?C.gold:C.smoke,fontSize:'11px',fontWeight:600,cursor:'pointer',textTransform:'capitalize' as const,transition:'all .15s',outline:'none'}}>
                      {m}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Submit */}
          <div style={{padding:'14px',borderTop:'1px solid rgba(255,255,255,0.03)',flexShrink:0,display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{display:'flex',gap:'6px'}}>
              <input style={{...nmInp,flex:1,padding:'8px 10px',fontSize:'12px'}} placeholder="Promo code" value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())}/>
              <button onClick={validatePromo} style={{padding:'8px 12px',background:C.g,boxShadow:raisedSm,border:'1px solid rgba(255,255,255,0.04)',borderRadius:'10px',color:promoValid?C.gold:C.smoke,fontSize:'11px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Apply</button>
            </div>
            <button onClick={()=>submit()} disabled={submitting} style={{width:'100%',padding:'14px',background:`linear-gradient(135deg,${C.gold},${C.goldLt},${C.goldDk})`,color:C.carbon,borderRadius:'12px',fontWeight:700,fontSize:'14px',border:'none',cursor:'pointer',boxShadow:goldBox,opacity:submitting?.6:1,fontFamily:"'DM Sans',sans-serif"}}>
              {submitting?'Processing…':existingCard?'Update card':'✨ Generate my card — $20'}
            </button>
            <p style={{fontSize:'10px',color:C.smoke,textAlign:'center' as const,opacity:.6}}>
              {existingCard?'Free changes instant · Identity $10':'One-time · Colors & content free'}
            </p>
          </div>
        </aside>

        {/* RIGHT — Preview */}
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:C.g,padding:'32px',gap:'16px',overflow:'auto',position:'relative'}}>
          <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 70% 60% at 50% 50%, ${tpl.glow} 0%, transparent 70%)`,pointerEvents:'none'}}/>

          <p style={{fontSize:'9px',color:C.smoke,textTransform:'uppercase' as const,letterSpacing:'.1em',position:'relative'}}>
            Live Preview · Click to flip · Drag 📷 and 🔷 to reposition
          </p>

          {/* Card tray */}
          <div style={{background:C.g,boxShadow:`14px 14px 36px ${C.nd}, -8px -8px 24px ${C.nl}`,borderRadius:'28px',padding:'20px',border:`1px solid ${tpl.border}`,width:'100%',maxWidth:'560px',position:'relative'}}>
            <div style={{perspective:'1200px'}}>
              <div ref={cardRef} onClick={()=>!dragging&&setIsFlipped(f=>!f)}
                style={{position:'relative',transformStyle:'preserve-3d',transition:dragging?'none':'transform 0.7s cubic-bezier(0.23,1,0.32,1)',transform:isFlipped?'rotateY(180deg)':'rotateY(0deg)',cursor:'pointer',minHeight:'300px',borderRadius:'20px',userSelect:'none'}}>

                {/* FRONT */}
                <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',background:cardBg,borderRadius:'20px',padding:'32px',color:design.textColor,minHeight:'300px',display:'flex',flexDirection:'column',justifyContent:'space-between',fontFamily:fontCss,boxShadow:`0 24px 64px ${C.nd}`,position:'relative',overflow:'hidden'}}>
                  {/* Overlay */}
                  {tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                  {/* SVG overlay */}
                  <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                  {/* Border */}
                  <div style={{position:'absolute',inset:0,borderRadius:'20px',border:`1px solid ${tpl.border}`,pointerEvents:'none'}}/>

                  {/* Draggable photo */}
                  {form.photoUrl&&(
                    <div onMouseDown={e=>startDrag(e,'photo')} style={{position:'absolute',left:`${photoPos.x}%`,top:`${photoPos.y}%`,width:'64px',height:'64px',borderRadius:'50%',overflow:'hidden',border:`2px solid ${design.accent}60`,cursor:dragging==='photo'?'grabbing':'grab',zIndex:10,boxShadow:`0 4px 16px rgba(0,0,0,0.5)`,transition:dragging==='photo'?'none':'transform .15s',transform:dragging==='photo'?'scale(1.06)':'scale(1)'}}>
                      <img src={form.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} draggable={false}/>
                    </div>
                  )}
                  {/* Draggable logo */}
                  {form.logoUrl&&(
                    <div onMouseDown={e=>startDrag(e,'logo')} style={{position:'absolute',left:`${logoPos.x}%`,top:`${logoPos.y}%`,cursor:dragging==='logo'?'grabbing':'grab',zIndex:10,transition:dragging==='logo'?'none':'transform .15s',transform:dragging==='logo'?'scale(1.06)':'scale(1)'}}>
                      <img src={form.logoUrl} alt="logo" style={{height:'30px',objectFit:'contain',filter:`drop-shadow(0 2px 8px rgba(0,0,0,0.6))`}} draggable={false}/>
                    </div>
                  )}

                  {/* Card text */}
                  <div style={{position:'relative',zIndex:1}}>
                    <div style={{fontSize:'9px',fontWeight:700,letterSpacing:'.14em',opacity:.3,textTransform:'uppercase' as const,marginBottom:'18px',color:design.accent}}>VYNK</div>
                    <div style={{fontSize:'28px',fontWeight:700,lineHeight:1.15,marginBottom:'6px'}}>{form.fullName||'Your Name'}</div>
                    <div style={{fontSize:'13px',opacity:.7}}>{[form.title,form.company].filter(Boolean).join(' · ')||'Title · Company'}</div>
                    {form.tagline&&<div style={{fontSize:'11px',opacity:.5,marginTop:'8px',lineHeight:1.6,maxWidth:'55%'}}>{form.tagline}</div>}
                  </div>

                  {!form.photoUrl&&(
                    <div style={{position:'absolute',top:'28px',right:'28px',width:'56px',height:'56px',borderRadius:'50%',background:`${design.accent}18`,border:`2px solid ${design.accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:700,color:design.accent}}>{initials}</div>
                  )}

                  <div style={{position:'relative',zIndex:1}}>
                    {form.email&&<div style={{fontSize:'11px',opacity:.55,marginBottom:'2px'}}>{form.email}</div>}
                    {form.website&&<div style={{fontSize:'11px',opacity:.35}}>{form.website.replace(/^https?:\/\//,'')}</div>}
                    <div style={{marginTop:'14px',width:'60%',height:'1px',background:`linear-gradient(90deg,${design.accent}60,transparent)`}}/>
                  </div>
                </div>

                {/* BACK */}
                <div style={{backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',position:'absolute',top:0,left:0,right:0,bottom:0,background:cardBg,borderRadius:'20px',padding:'32px',color:design.textColor,minHeight:'300px',display:'flex',flexDirection:'column',gap:'14px',fontFamily:fontCss,filter:'brightness(0.85)',overflow:'hidden'}}>
                  {tpl.overlay!=='none'&&<div style={{position:'absolute',inset:0,background:tpl.overlay,pointerEvents:'none'}}/>}
                  <div style={{position:'absolute',inset:0,backgroundImage:svgOverlay,backgroundSize:'100% 100%',pointerEvents:'none'}}/>
                  <div style={{position:'absolute',inset:0,borderRadius:'20px',border:`1px solid ${tpl.border}`,pointerEvents:'none'}}/>
                  <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',gap:'12px',height:'100%'}}>
                    <div style={{fontSize:'9px',opacity:.3,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase' as const,color:design.accent}}>VYNK · SERVICES</div>
                    {form.services&&(
                      <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
                        {form.services.split(',').filter(Boolean).map(s=>(
                          <span key={s} style={{padding:'4px 12px',borderRadius:'20px',fontSize:'10px',fontWeight:600,background:`${design.accent}18`,border:`1px solid ${design.accent}35`,color:design.accent}}>{s.trim()}</span>
                        ))}
                      </div>
                    )}
                    {form.bio&&<div style={{fontSize:'12px',opacity:.65,lineHeight:1.7}}>{form.bio}</div>}
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'auto'}}>
                      {(['whatsapp','instagram','linkedin','twitter','tiktok','telegram'] as const).filter(k=>form[k]).map(k=>(
                        <span key={k} style={{width:'32px',height:'32px',borderRadius:'9px',background:`${design.accent}15`,border:`1px solid ${design.accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,color:design.accent}}>{k.slice(0,2).toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'12px',padding:'0 4px'}}>
              <span style={{fontSize:'10px',color:C.smoke}}><span style={{color:C.gold,fontWeight:700}}>{tpl.label}</span> · {FONTS.find(f=>f.id===design.font)?.name}</span>
              <span style={{fontSize:'10px',color:C.smoke}}>Click to flip ↻</span>
            </div>
          </div>

          {existingCard&&(
            <div style={{background:C.g,boxShadow:insetSm,borderRadius:'10px',padding:'8px 16px',fontSize:'11px',color:C.smoke,position:'relative'}}>
              Active: <span style={{color:C.gold}}>/c/{existingCard.slug}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
