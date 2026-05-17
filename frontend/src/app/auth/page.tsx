"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"CLIENT" | "BARBER">("CLIENT");

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-amber-50 to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Scissors className="w-10 h-10 text-primary mx-auto mb-2" />
          <CardTitle>{mode === "login" ? "Вход" : "Регистрация"}</CardTitle>
          <CardDescription>
            {mode === "login" ? "Войди в свой аккаунт" : "Создай аккаунт за минуту"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role toggle */}
          <div className="flex rounded-lg border p-1">
            {["CLIENT", "BARBER"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r as typeof role)}
                className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                  role === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {r === "CLIENT" ? "Клиент" : "Барбер"}
              </button>
            ))}
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" placeholder="Ваше имя" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" type="tel" placeholder="+998901234567" />
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="city">Город</Label>
              <Input id="city" placeholder="Ташкент" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" placeholder="••••••" />
          </div>

          <Button className="w-full">
            {mode === "login" ? "Войти" : "Зарегистрироваться"}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary hover:underline"
            >
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </p>

          <Link href="/" className="block text-center text-sm text-muted-foreground hover:underline">
            ← На главную
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
