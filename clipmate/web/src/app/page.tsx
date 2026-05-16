"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3, Users, Scissors, Calendar, DollarSign, Star,
  TrendingUp, LogOut, Menu, X, Zap, ShoppingBag
} from "lucide-react";

const menuItems = [
  { icon: BarChart3, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "Клиенты", id: "clients" },
  { icon: Scissors, label: "Барберы", id: "barbers" },
  { icon: Calendar, label: "Заказы", id: "bookings" },
  { icon: DollarSign, label: "Платежи", id: "payments" },
  { icon: Zap, label: "AI", id: "ai" },
  { icon: ShoppingBag, label: "Marketplace", id: "marketplace" },
];

interface Stats {
  totalBarbers: number;
  totalClients: number;
  totalBookings: number;
  revenue: number;
  activeAiUsers: number;
  avgRating: number;
  growth: number;
}

function DashboardView() {
  const [stats] = useState<Stats>({
    totalBarbers: 24,
    totalClients: 312,
    totalBookings: 1890,
    revenue: 45200,
    activeAiUsers: 87,
    avgRating: 4.7,
    growth: 23.5,
  });

  const cards = [
    { label: "Барберы", value: stats.totalBarbers, icon: Scissors, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Клиенты", value: stats.totalClients, icon: Users, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Заказы", value: stats.totalBookings, icon: Calendar, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Выручка", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-gold", bg: "bg-gold/10" },
    { label: "AI юзеры", value: stats.activeAiUsers, icon: Zap, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Рейтинг", value: stats.avgRating, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-textMuted text-sm">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.bg}`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Рост за месяц</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-4xl font-bold text-green-400">+{stats.growth}%</div>
          <div className="text-textMuted text-sm mt-1">vs прошлый месяц</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Быстрые действия</h3>
          <div className="space-y-3">
            <button className="w-full bg-gold text-black rounded-lg py-3 font-semibold hover:bg-goldLight transition">
              ➕ Добавить барбера
            </button>
            <button className="w-full bg-surfaceLight text-text rounded-lg py-3 font-semibold hover:bg-border transition">
              📊 Отчёт за месяц
            </button>
            <button className="w-full bg-surfaceLight text-text rounded-lg py-3 font-semibold hover:bg-border transition">
              🤖 Обновить AI-модели
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarbersView() {
  const barbers = [
    { id: 1, name: "Алексей Петров", rating: 4.9, bookings: 142, revenue: 8700, status: "Premium", shop: "BarberHouse" },
    { id: 2, name: "Дмитрий Иванов", rating: 4.7, bookings: 98, revenue: 5100, status: "Pro", shop: "Gentlemen" },
    { id: 3, name: "Руслан Ким", rating: 4.5, bookings: 43, revenue: 1800, status: "Free", shop: "OldBoy" },
    { id: 4, name: "Сергей Ли", rating: 4.8, bookings: 115, revenue: 6400, status: "Premium", shop: "BarberHouse" },
    { id: 5, name: "Артур Шакиров", rating: 4.6, bookings: 67, revenue: 3200, status: "Pro", shop: "Chop-Chop" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Барберы</h1>
        <button className="bg-gold text-black px-4 py-2 rounded-lg font-semibold hover:bg-goldLight transition">
          ➕ Добавить
        </button>
      </div>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-textMuted text-sm">
              <th className="text-left p-4">Имя</th>
              <th className="text-left p-4">Барбершоп</th>
              <th className="text-center p-4">Рейтинг</th>
              <th className="text-center p-4">Заказы</th>
              <th className="text-right p-4">Выручка</th>
              <th className="text-center p-4">Тариф</th>
            </tr>
          </thead>
          <tbody>
            {barbers.map((b) => (
              <tr key={b.id} className="border-b border-border hover:bg-surfaceLight transition">
                <td className="p-4 font-medium">{b.name}</td>
                <td className="p-4 text-textMuted">{b.shop}</td>
                <td className="p-4 text-center">
                  <span className="text-yellow-400">★</span> {b.rating}
                </td>
                <td className="p-4 text-center">{b.bookings}</td>
                <td className="p-4 text-right text-gold font-semibold">${b.revenue.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    b.status === "Premium" ? "bg-gold/20 text-gold" :
                    b.status === "Pro" ? "bg-blue-400/20 text-blue-400" :
                    "bg-gray-400/20 text-gray-400"
                  }`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingsView() {
  const bookings = [
    { id: 1, client: "Анна М.", barber: "Алексей Петров", service: "Стрижка + борода", date: "2026-05-15 14:00", status: "confirmed", amount: 45 },
    { id: 2, client: "Максим К.", barber: "Дмитрий Иванов", service: "Стрижка", date: "2026-05-15 15:30", status: "in_progress", amount: 30 },
    { id: 3, client: "Олег В.", barber: "Руслан Ким", service: "Борода", date: "2026-05-15 16:00", status: "pending", amount: 20 },
    { id: 4, client: "Игорь С.", barber: "Сергей Ли", service: "Стрижка + укладка", date: "2026-05-15 17:00", status: "completed", amount: 55 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Заказы</h1>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-textMuted text-sm">
              <th className="text-left p-4">Клиент</th>
              <th className="text-left p-4">Барбер</th>
              <th className="text-left p-4">Услуга</th>
              <th className="text-center p-4">Дата</th>
              <th className="text-right p-4">Сумма</th>
              <th className="text-center p-4">Статус</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-border hover:bg-surfaceLight transition">
                <td className="p-4 font-medium">{b.client}</td>
                <td className="p-4 text-textMuted">{b.barber}</td>
                <td className="p-4">{b.service}</td>
                <td className="p-4 text-center text-sm">{b.date}</td>
                <td className="p-4 text-right text-gold font-semibold">${b.amount}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    b.status === "confirmed" ? "bg-blue-400/20 text-blue-400" :
                    b.status === "in_progress" ? "bg-orange-400/20 text-orange-400" :
                    b.status === "completed" ? "bg-green-400/20 text-green-400" :
                    "bg-gray-400/20 text-gray-400"
                  }`}>
                    {b.status === "confirmed" ? "Подтверждён" :
                     b.status === "in_progress" ? "В работе" :
                     b.status === "completed" ? "Завершён" : "Ожидает"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("clipmate_token");
    if (!token) router.push("/login");
  }, [router]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardView />;
      case "barbers": return <BarbersView />;
      case "bookings": return <BookingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-surface border-r border-border p-4 flex flex-col
        transform transition-transform lg:transform-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-black font-bold">C</div>
          <span className="font-bold text-lg">ClipMate</span>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left
                ${activeTab === item.id ? "bg-gold/10 text-gold" : "text-textMuted hover:bg-surfaceLight hover:text-text"}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-400/10 transition mt-auto"
          onClick={() => { localStorage.removeItem("clipmate_token"); router.push("/login"); }}
        >
          <LogOut className="w-5 h-5" />
          Выйти
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6">
        <button className="lg:hidden mb-4 p-2 rounded-lg bg-surface border border-border" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </button>
        {renderContent()}
      </main>
    </div>
  );
}
