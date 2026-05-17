"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import { SEARCH_BARBERS, FEATURED_BARBERS } from "@/graphql/barbers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Star, MapPin, Scissors, ChevronDown, SlidersHorizontal, BadgeCheck } from "lucide-react";

const SORT_OPTIONS = [
  { value: "rating", label: "По рейтингу" },
  { value: "price", label: "По цене" },
  { value: "distance", label: "По расстоянию" },
];

const CATEGORIES = ["Все", "Стрижка", "Бритьё", "Окрашивание", "Укладка", "Борода"];

type Barber = {
  id: string;
  bio: string | null;
  isVerified: boolean;
  avgRating: number;
  totalReviews: number;
  totalBookings: number;
  distance: number | null;
  user: { id: string; name: string; avatarUrl: string | null; city: string | null };
  services: { id: string; name: string; price: number; duration: number; category: string | null }[];
  portfolio: { id: string; imageUrl: string; title: string | null }[];
};

function BarberCard({ barber }: { barber: Barber }) {
  const minPrice = Math.min(...barber.services.map((s) => s.price));
  const maxPrice = Math.max(...barber.services.map((s) => s.price));
  const priceLabel = minPrice === maxPrice ? `${minPrice} сум` : `от ${minPrice} сум`;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      <div className="relative h-48 bg-muted">
        {barber.portfolio[0] ? (
          <Image
            src={barber.portfolio[0].imageUrl}
            alt={barber.portfolio[0].title || barber.user.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Scissors className="w-12 h-12 opacity-30" />
          </div>
        )}
        {barber.isVerified && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
            <BadgeCheck className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{barber.user.name}</h3>
            {barber.user.city && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {barber.user.city}
                {barber.distance != null && <span>· {barber.distance.toFixed(1)} км</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium">{barber.avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs">({barber.totalReviews})</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{barber.bio || "Барбер-стилист"}</p>
        <div className="flex flex-wrap gap-1">
          {barber.services.slice(0, 3).map((s) => (
            <span key={s.id} className="text-[11px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
              {s.name}
            </span>
          ))}
          {barber.services.length > 3 && (
            <span className="text-[11px] text-muted-foreground px-1">+{barber.services.length - 3}</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-bold text-primary">{priceLabel}</span>
          <Button size="sm" className="h-8 text-xs gap-1">
            <Scissors className="w-3 h-3" /> Записаться
          </Button>
        </div>
      </div>
    </Card>
  );
}

function BarberCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse w-2/3" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-3 bg-muted rounded animate-pulse w-full" />
        <div className="flex gap-1">
          <div className="h-5 bg-muted rounded-full animate-pulse w-16" />
          <div className="h-5 bg-muted rounded-full animate-pulse w-14" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="h-5 bg-muted rounded animate-pulse w-20" />
          <div className="h-8 bg-muted rounded animate-pulse w-24" />
        </div>
      </div>
    </Card>
  );
}

export default function BarbersPage() {
  const [searchCity, setSearchCity] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchInput = useMemo(
    () => ({
      city: searchCity || undefined,
      lat: undefined as number | undefined,
      lng: undefined as number | undefined,
      radius: 20,
      minRating: minRating ?? undefined,
      maxPrice: maxPrice ?? undefined,
      serviceCategory: category === "Все" ? undefined : category ?? undefined,
      sortBy,
    }),
    [searchCity, minRating, maxPrice, category, sortBy]
  );

  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_BARBERS, {
    variables: { input: searchInput },
    skip: !isSearching || !searchCity,
  });

  const { data: featuredData, loading: featuredLoading } = useQuery(FEATURED_BARBERS, {
    variables: { limit: 12 },
    skip: isSearching,
  });

  const barbers: Barber[] = isSearching ? (searchData as { searchBarbers?: Barber[] })?.searchBarbers || [] : (featuredData as { featuredBarbers?: Barber[] })?.featuredBarbers || [];
  const loading = isSearching ? searchLoading : featuredLoading;

  const handleSearch = () => {
    if (searchCity.trim()) setIsSearching(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-amber-50 to-background py-12 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Найди своего <span className="text-primary">барбера</span>
          </h1>
          <p className="text-muted-foreground">Поиск по городу, рейтингу и услугам</p>

          {/* Search */}
          <div className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Введи город..."
                value={searchCity}
                onChange={(e) => {
                  setSearchCity(e.target.value);
                  if (!e.target.value) setIsSearching(false);
                }}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={!searchCity.trim()}>
              Найти
            </Button>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Фильтры
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>
      </section>

      {/* Filters panel */}
      {showFilters && (
        <section className="max-w-2xl mx-auto px-4 pb-8">
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Мин. рейтинг</Label>
                <select
                  className="w-full rounded-md border text-sm px-2 py-1.5 bg-background"
                  value={minRating ?? ""}
                  onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Любой</option>
                  <option value="4">4+</option>
                  <option value="4.5">4.5+</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Макс. цена (сум)</Label>
                <Input
                  type="number"
                  placeholder="Любая"
                  value={maxPrice ?? ""}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Категория</Label>
                <select
                  className="w-full rounded-md border text-sm px-2 py-1.5 bg-background"
                  value={category ?? "Все"}
                  onChange={(e) => setCategory(e.target.value === "Все" ? null : e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Сортировка</Label>
                <select
                  className="w-full rounded-md border text-sm px-2 py-1.5 bg-background"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => { setMinRating(null); setMaxPrice(null); setCategory(null); setSortBy("rating"); }}>
                Сбросить
              </Button>
            </div>
          </Card>
        </section>
      )}

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {isSearching && !loading && (
          <p className="text-sm text-muted-foreground mb-6">
            Найдено барберов: {barbers.length}
          </p>
        )}
        {!isSearching && !loading && (
          <h2 className="text-xl font-semibold mb-6">Рекомендованные барберы</h2>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <BarberCardSkeleton key={i} />
            ))}
          </div>
        ) : barbers.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Scissors className="w-16 h-16 text-muted-foreground opacity-30 mx-auto" />
            <p className="text-lg text-muted-foreground">
              {isSearching ? "Барберы не найдены. Попробуй другой город или убери фильтры." : "Пока нет рекомендованных барберов."}
            </p>
            {isSearching && (
              <Button variant="outline" onClick={() => { setIsSearching(false); setSearchCity(""); }}>
                Смотреть всех
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {barbers.map((barber) => (
              <BarberCard key={barber.id} barber={barber} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}