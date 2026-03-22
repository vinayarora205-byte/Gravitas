"use client";
/* eslint-disable */
// @ts-nocheck

import React, { useState, useEffect } from "react";

export default function AdminUsersPage() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [addAmount, setAddAmount] = useState<number | string>(10);
  const [addLoading, setAddLoading] = useState(false);

  const ADMIN_SECRET = "gravitas_admin_2024";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_SECRET) {
      setIsAuthorized(true);
      setError("");
    } else {
      setError("❌ Incorrect password");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?secret=${ADMIN_SECRET}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized]);

  const handleOpenModal = (user: any) => {
    setSelectedUser(user);
    setModalOpen(true);
    setAddAmount(10);
  };

  const handleAddHiries = async () => {
    if (!selectedUser) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/add-hiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUser.email,
          amount: parseInt(addAmount.toString()),
          secret: ADMIN_SECRET
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchUsers();
      } else {
        alert("Failed to add Hiries");
      }
    } catch (err) {
      console.error(err);
    }
    setAddLoading(false);
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
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-gray-900"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#FF6B3D] hover:bg-[#FF8F6B] text-white font-bold py-3 rounded-lg transition-all"
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <a href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">←</a>
            <h1 className="text-3xl font-extrabold tracking-tight">User <span className="text-[#FF6B3D]">Management</span></h1>
          </div>
          <button onClick={fetchUsers} disabled={loading} className="text-sm font-semibold text-gray-400 hover:text-[#FF6B3D]">
            {loading ? "Refreshing..." : "Refresh List ⟳"}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{u.full_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'RECRUITER' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">💎 {u.hiries_balance}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleOpenModal(u)}
                      className="text-xs font-bold text-[#FF6B3D] hover:bg-orange-50 px-3 py-1.5 rounded transition-colors"
                    >
                      + Add 💎
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2">Add Hiries</h3>
            <p className="text-sm text-gray-500 mb-6">Adding credits to <b>{selectedUser?.email}</b></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Amount</label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 font-bold text-lg"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHiries}
                  disabled={addLoading}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#FF6B3D] text-white font-bold hover:bg-[#FF8F6B] disabled:opacity-50 transition-colors shadow-lg shadow-orange-500/20"
                >
                  {addLoading ? "..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
