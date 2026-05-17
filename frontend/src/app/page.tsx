import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, MapPin, Zap, CreditCard } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative bg-gradient-to-b from-amber-50 to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Найди своего{" "}
            <span className="text-primary">барбера</span> за минуту
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ClipMate — маркетплейс, где барберы находят клиентов, а клиенты —
            идеальную стрижку. Бронируй, оплачивай, оценивай.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link href="/auth">
              <Button size="lg" className="gap-2">
                <Scissors className="w-5 h-5" /> Найти барбера
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline">
                Я барбер
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: MapPin, title: "Найди рядом", desc: "Барберы в твоём городе с рейтингом и портфолио работ" },
            { icon: Zap, title: "Забронируй instantly", desc: "Свободные слоты в реальном времени, бронь за 30 секунд" },
            { icon: CreditCard, title: "Оплати онлайн", desc: "Безопасная оплата картой, деньги барберу после визита" },
          ].map((f, i) => (
            <Card key={i} className="text-center">
              <CardHeader>
                <f.icon className="w-10 h-10 text-primary mx-auto" />
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
      <section className="bg-primary/5 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-bold">Готов найти своего барбера?</h2>
          <p className="text-muted-foreground">Присоединяйся к сотням довольных клиентов</p>
          <Link href="/auth"><Button size="lg">Начать бесплатно</Button></Link>
        </div>
      </section>
    </main>
  );
}
