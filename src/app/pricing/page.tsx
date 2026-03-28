/* eslint-disable */
// @ts-nocheck
"use client";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  const packages = [
    { name: "Starter", hiries: 10, price: 199, color: "#FF6B3D" },
    { name: "Pro", hiries: 30, price: 499, color: "#8B5CF6", popular: true },
    { name: "Business", hiries: 75, price: 999, color: "#22C55E" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#1A1A1A", color: "#E0E0E0", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "24px 32px", borderBottom: "1px solid #2A2A2A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>
          <span style={{ color: "#FF6B3D" }}>Clauhire</span>
        </h1>
        <button onClick={() => router.back()} style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #333", background: "transparent", color: "#E0E0E0", cursor: "pointer", fontSize: "14px" }}>
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "800", margin: "0 0 12px", background: "linear-gradient(135deg, #FF6B3D, #FF8F6B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            💎 How Hiries Work
          </h2>
          <p style={{ color: "#888", fontSize: "18px", margin: 0 }}>Your currency for making quality connections</p>
        </div>

        {/* Rules */}
        <div style={{ background: "#222", borderRadius: "16px", padding: "32px", marginBottom: "48px", border: "1px solid #2A2A2A" }}>
          <div style={{ display: "grid", gap: "16px" }}>
            {[
              { icon: "✓", text: "2 Hiries to accept a match", color: "#22C55E" },
              { icon: "✓", text: "Full refund if the other party declines", color: "#22C55E" },
              { icon: "✓", text: "Full refund if a hire is confirmed", color: "#22C55E" },
              { icon: "○", text: "New accounts start with 0 Hiries", color: "#888" },
            ].map((rule, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: rule.color, fontWeight: "700", fontSize: "18px", width: "24px" }}>{rule.icon}</span>
                <span style={{ fontSize: "16px" }}>{rule.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Packages */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "48px" }}>
          {packages.map((pkg) => (
            <div key={pkg.name} style={{
              background: "#222", borderRadius: "16px", padding: "32px", border: pkg.popular ? `2px solid ${pkg.color}` : "1px solid #2A2A2A",
              position: "relative", textAlign: "center",
            }}>
              {pkg.popular && (
                <span style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: pkg.color, color: "#fff", padding: "4px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                  POPULAR
                </span>
              )}
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 8px" }}>{pkg.name}</h3>
              <p style={{ fontSize: "48px", fontWeight: "800", margin: "16px 0 4px", color: pkg.color }}>{pkg.hiries}</p>
              <p style={{ color: "#888", margin: "0 0 4px", fontSize: "14px" }}>Hiries</p>
              <p style={{ fontSize: "24px", fontWeight: "700", margin: "16px 0" }}>₹{pkg.price}</p>
              <button disabled style={{
                width: "100%", padding: "12px", borderRadius: "10px", border: "none",
                background: "#333", color: "#888", fontWeight: "600", fontSize: "14px", cursor: "not-allowed",
              }}>
                Coming Soon
              </button>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ background: "linear-gradient(135deg, #2A1A0A, #1A1A2A)", borderRadius: "16px", padding: "32px", border: "1px solid #FF6B3D33", textAlign: "center" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 8px" }}>Want Hiries now? Contact us:</h3>
          <p style={{ color: "#888", margin: "0 0 20px" }}>We'll manually add Hiries to your account</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style={{
              padding: "12px 24px", borderRadius: "10px", background: "#25D366", color: "#fff",
              textDecoration: "none", fontWeight: "600", fontSize: "14px",
            }}>
              💬 WhatsApp
            </a>
            <a href="mailto:support@clauhire.ai" style={{
              padding: "12px 24px", borderRadius: "10px", background: "#FF6B3D", color: "#fff",
              textDecoration: "none", fontWeight: "600", fontSize: "14px",
            }}>
              ✉️ Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
