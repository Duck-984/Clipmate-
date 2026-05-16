import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, Image,
} from "react-native";
import { theme } from "../../theme";
import { useAuth } from "../../hooks/useAuth";

const MOCK_BARBERS = [
  {
    id: "1",
    user: { name: "Алексей Иванов", avatarUrl: null, city: "Ташкент" },
    avgRating: 4.9,
    totalReviews: 156,
    subscriptionTier: "PREMIUM",
    services: [
      { id: "s1", name: "Мужская стрижка", price: 150000, duration: 45 },
      { id: "s2", name: "Fade", price: 120000, duration: 30 },
    ],
    portfolio: [{ imageUrl: null, title: "Classic Fade" }],
    distance: 1.2,
  },
  {
    id: "2",
    user: { name: "Руслан Каримов", avatarUrl: null, city: "Ташкент" },
    avgRating: 4.7,
    totalReviews: 89,
    subscriptionTier: "PRO",
    services: [
      { id: "s1", name: "Мужская стрижка", price: 100000, duration: 40 },
    ],
    portfolio: [],
    distance: 2.5,
  },
  {
    id: "3",
    user: { name: "Дмитрий Соколов", avatarUrl: null, city: "Ташкент" },
    avgRating: 4.5,
    totalReviews: 42,
    subscriptionTier: "FREE",
    services: [
      { id: "s1", name: "Стрижка + борода", price: 180000, duration: 60 },
    ],
    portfolio: [],
    distance: 3.8,
  },
];

function getTierBadge(tier: string) {
  const map: Record<string, { label: string; color: string }> = {
    PREMIUM: { label: "PREMIUM", color: theme.colors.premium },
    PRO: { label: "PRO", color: theme.colors.pro },
    FREE: { label: "", color: "transparent" },
  };
  return map[tier] || map.FREE;
}

export function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [barbers] = useState(MOCK_BARBERS);

  const filtered = search
    ? barbers.filter(
        (b) =>
          b.user.name.toLowerCase().includes(search.toLowerCase()) ||
          b.services.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
      )
    : barbers;

  const renderBarber = ({ item }: any) => {
    const badge = getTierBadge(item.subscriptionTier);
    const minPrice = Math.min(...item.services.map((s: any) => s.price));

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("BarberDetail", { barber: item })}
        activeOpacity={0.8}
      >
        <View style={styles.cardImage}>
          <Text style={styles.cardImagePlaceholder}>🪒</Text>
          {badge.label ? (
            <View style={[styles.badge, { backgroundColor: badge.color }]}>
              <Text style={styles.badgeText}>{badge.label}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.user.name}</Text>
          <Text style={styles.cardCity}>{item.user.city}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardRating}>★ {item.avgRating}</Text>
            <Text style={styles.cardReviews}>({item.totalReviews})</Text>
            <Text style={styles.cardDistance}>{item.distance} км</Text>
          </View>
          <Text style={styles.cardPrice}>от {minPrice.toLocaleString()} UZS</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Привет, {user?.name?.split(" ")[0] || "Гость"}</Text>
          <Text style={styles.subtitle}>Найди своего барбера</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.aiBtn}
            onPress={() => navigation.navigate("AIChat")}
          >
            <Text style={styles.aiBtnText}>🤖 AI</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск барбера или услуги..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>Барберы рядом</Text>
      <FlatList
        data={filtered}
        renderItem={renderBarber}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom tabs placeholder */}
      <View style={styles.bottomTabs}>
        {["🏠", "🔍", "📅", "🛒", "👤"].map((icon, i) => (
          <TouchableOpacity key={i} style={styles.tab}>
            <Text style={styles.tabIcon}>{icon}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md,
  },
  greeting: { fontSize: theme.fontSize.xl, fontWeight: "700", color: theme.colors.text },
  subtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textDim, marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  aiBtn: {
    backgroundColor: theme.colors.surfaceLight, borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
  },
  aiBtnText: { fontSize: theme.fontSize.sm, color: theme.colors.primary },
  logoutBtn: { paddingHorizontal: theme.spacing.sm },
  logoutText: { fontSize: theme.fontSize.xs, color: theme.colors.error },
  searchRow: { paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.lg },
  searchInput: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg, fontWeight: "600", color: theme.colors.text,
    paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm,
  },
  list: { paddingHorizontal: theme.spacing.md, paddingBottom: 100 },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    flexDirection: "row", marginBottom: theme.spacing.md, overflow: "hidden",
    ...theme.shadows.card,
  },
  cardImage: {
    width: 100, height: 110, backgroundColor: theme.colors.surfaceLight,
    justifyContent: "center", alignItems: "center",
  },
  cardImagePlaceholder: { fontSize: 40 },
  badge: {
    position: "absolute", top: theme.spacing.xs, right: theme.spacing.xs,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  badgeText: { fontSize: 9, fontWeight: "700", color: theme.colors.white },
  cardInfo: { flex: 1, padding: theme.spacing.md, justifyContent: "center" },
  cardName: { fontSize: theme.fontSize.md, fontWeight: "600", color: theme.colors.text },
  cardCity: { fontSize: theme.fontSize.xs, color: theme.colors.textDim },
  cardMeta: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  cardRating: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: "700" },
  cardReviews: { fontSize: theme.fontSize.xs, color: theme.colors.textDim },
  cardDistance: { fontSize: theme.fontSize.xs, color: theme.colors.textDim, marginLeft: "auto" },
  cardPrice: {
    fontSize: theme.fontSize.sm, color: theme.colors.accent, fontWeight: "600", marginTop: 2,
  },
  bottomTabs: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-around",
    backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.sm, paddingBottom: theme.spacing.lg,
  },
  tab: { padding: theme.spacing.sm },
  tabIcon: { fontSize: 22 },
});
