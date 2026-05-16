"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Demo login
    if (phone === "admin" && password === "admin") {
      localStorage.setItem("clipmate_token", "demo_admin_token");
      router.push("/");
      return;
    }
    setError("Неверный логин или пароль");
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold">ClipMate Admin</h1>
          <p className="text-textMuted mt-1">Войдите в панель управления</p>
        </div>

        <form onSubmit={handleLogin} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-textMuted mb-1">Логин</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-surfaceLight border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-gold transition"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm text-textMuted mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surfaceLight border border-border rounded-lg px-4 py-3 text-text focus:outline-none focus:border-gold transition"
              placeholder="••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gold text-black rounded-lg py-3 font-bold hover:bg-goldLight transition"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
