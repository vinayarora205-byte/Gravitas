"use client";
/* eslint-disable */
// @ts-nocheck

import React, { useState, useEffect } from "react";

export default function AdminPage() {
 const [password, setPassword] = useState("");
 const [isAuthorized, setIsAuthorized] = useState(false);
 const [error, setError] = useState("");
 
 // Admin Panel State
 const [email, setEmail] = useState("");
 const [amount, setAmount] = useState("");
 const [status, setStatus] = useState({ type: "", message: "" });
 const [transactions, setTransactions] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);

 const ADMIN_SECRET = "clauhire@2025";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Check via API first
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthorized(true);
        localStorage.setItem('clauhire_admin', 'true');
        return;
      }
    } catch (e) {
      console.error(e);
    }
    
    // Local fallback
    if (password === 'gravitas_admin_2024' || 
        password === 'clauhire_admin_2024' ||
        password === 'clauhire@2025') {
      setIsAuthorized(true);
      localStorage.setItem('clauhire_admin', 'true');
      return;
    }
    
    setError("❌ Incorrect password");
  };

  useEffect(() => {
    if (localStorage.getItem('clauhire_admin') === 'true') {
      setIsAuthorized(true);
    }
  }, []);

 const fetchTransactions = async () => {
 try {
 const res = await fetch(`/api/admin/transactions?secret=${ADMIN_SECRET}`);
 if (res.ok) {
 const data = await res.json();
 setTransactions(data);
 }
 } catch (err) {
 console.error("Failed to fetch transactions:", err);
 }
 };

 useEffect(() => {
 if (isAuthorized) {
 fetchTransactions();
 const interval = setInterval(fetchTransactions, 30000);
 return () => clearInterval(interval);
 }
 }, [isAuthorized]);

 const handleAddHiries = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setStatus({ type: "", message: "" });

 try {
 const res = await fetch("/api/admin/add-hiries", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 email,
 amount: parseInt(amount),
 secret: ADMIN_SECRET
 }),
 });

 const data = await res.json();

 if (res.ok) {
 setStatus({ type: "success", message: `✅ Added ${amount} Hiries to ${email}` });
 setEmail("");
 setAmount("");
 fetchTransactions();
 } else {
 setStatus({ type: "error", message: `❌ ${data.error || "Failed to add Hiries"}` });
 }
 } catch (err) {
 setStatus({ type: "error", message: "❌ Server error" });
 }
 setLoading(false);
 };

 if (!isAuthorized) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
 <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
 <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
 <form onSubmit={handleLogin} className="space-y-4">
 <div>
 <input
 type="password"
 placeholder="Enter admin password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900"
 autoFocus
 />
 </div>
 {error && <p className="text-red-500 text-sm">{error}</p>}
 <button
 type="submit"
 className="w-full bg-[#FF6B3D] hover:bg-[#FF8F6B] text-white font-bold py-3 rounded-lg transition-all shadow-md shadow-orange-500/20"
 >
 Access Panel
 </button>
 </form>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-white text-gray-900 font-sans p-8">
 <div className="max-w-4xl mx-auto">
 <div className="flex justify-between items-center mb-12">
 <h1 className="text-3xl font-extrabold tracking-tight">Hiries <span className="text-[#FF6B3D]">Admin</span></h1>
 <div className="flex gap-4">
 <a href="/admin/users" className="text-sm font-semibold text-gray-600 hover:text-[#FF6B3D] transition-colors">Manage Users →</a>
 <button onClick={() => setIsAuthorized(false)} className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors">Logout</button>
 </div>
 </div>

 {/* Add Hiries Form */}
 <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-12">
 <h2 className="text-xl font-bold mb-6">Add Hiries to User</h2>
 <form onSubmit={handleAddHiries} className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="md:col-span-1">
 <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">User Email</label>
 <input
 type="email"
 required
 placeholder="user@example.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
 />
 </div>
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Amount</label>
 <input
 type="number"
 required
 placeholder="10"
 value={amount}
 onChange={(e) => setAmount(e.target.value)}
 className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
 />
 </div>
 <div className="flex items-end">
 <button
 type="submit"
 disabled={loading}
 className="w-full bg-[#FF6B3D] hover:bg-[#FF8F6B] disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all shadow-md shadow-orange-500/20"
 >
 {loading ? "Adding..." : "Add Hiries"}
 </button>
 </div>
 </form>
 {status.message && (
 <div className={`mt-6 p-4 rounded-lg font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
 {status.message}
 </div>
 )}
 </div>

 {/* Transactions Table */}
 <div>
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-bold">Recent Hiries Transactions</h2>
 <span className="text-xs text-gray-400">Refreshes every 30s</span>
 </div>
 <div className="overflow-hidden rounded-xl border border-gray-100">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
 <th className="px-6 py-4">User Email</th>
 <th className="px-6 py-4">Amount</th>
 <th className="px-6 py-4">Type</th>
 <th className="px-6 py-4">Date</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {transactions.length === 0 ? (
 <tr>
 <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">No transactions found</td>
 </tr>
 ) : (
 transactions.map((t) => (
 <tr key={t.id} className="hover:bg-gray-50 transition-colors">
 <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.email}</td>
 <td className={`px-6 py-4 text-sm font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
 {t.amount > 0 ? `+${t.amount}` : t.amount}
 </td>
 <td className="px-6 py-4 text-xs font-bold text-gray-500">
 <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">{t.type}</span>
 </td>
 <td className="px-6 py-4 text-sm text-gray-400">
 {new Date(t.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 <style jsx global>{`
 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
 body {
 font-family: 'Inter', sans-serif;
 }
 `}</style>
 </div>
 );
}
