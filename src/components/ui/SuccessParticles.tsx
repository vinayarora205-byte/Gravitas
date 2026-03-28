"use client";
/* eslint-disable */
// @ts-nocheck

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function SuccessParticles() {
 const [particles, setParticles] = useState<any[]>([]);

 useEffect(() => {
 // @ts-ignore
 const newParticles = Array.from({ length: 40 }).map((_, i) => ({
 id: i,
 x: Math.random() * 100,
 y: Math.random() * 100,
 size: Math.random() * 4 + 2,
 color: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"][Math.floor(Math.random() * 4)],
 duration: Math.random() * 2 + 1,
 delay: Math.random() * 0.5,
 }));
 setParticles(newParticles);
 }, []);

 return (
 <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
 {particles.map((p) => (
 <motion.div
 key={p.id}
 initial={{ 
 opacity: 0, 
 scale: 0,
 x: "50%",
 y: "50%"
 }}
 animate={{ 
 opacity: [0, 1, 0],
 scale: [0, 1.5, 0],
 x: `${p.x}%`,
 y: `${p.y}%`
 }}
 transition={{ 
 duration: p.duration, 
 delay: p.delay,
 ease: "easeOut"
 }}
 className="absolute w-2 h-2 rounded-full"
 style={{ 
 backgroundColor: p.color,
 width: p.size,
 height: p.size,
 filter: "blur(0.5px)"
 }}
 />
 ))}
 </div>
 );
}
