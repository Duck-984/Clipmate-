import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from "react-native";
import { theme } from "../../theme";
import { useAuth } from "../../hooks/useAuth";

export function BarberDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const stats = {
    todayBookings: 4,
    weekRevenue: 1200000,
    avgRating: 4.8,
    pendingBookings: 2,
  };

  const pending = [
    { id: "1", client: "Артём М.", service: "Мужская стрижка", time: "14:30", price: 150000 },
    { id: "2", client: "Игорь К.", service: "Fade", time: "16:00", price: 120000 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Привет, {user?.name?.split(" ")[0] || "Барбер"}
            </Text>
            <Text style={styles.subtitle}>
              {user?.barber?.subscriptionTier === "PREMIUM" ? "👑 Premium" : "💼 Pro"}
            </Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Выйти</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: "Сегодня", value: stats.todayBookings, suffix: "записей" },
            { label: "За неделю", value: `${(stats.weekRevenue / 1000).toFixed(0)}k`, suffix: "UZS" },
            { label: "Рейтинг", value: stats.avgRating, suffix: "★" },
            { label: "Ожидают", value: stats.pendingBookings, suffix: "подтв." },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statSuffix}>{s.suffix}</Text>
            </View>
          ))}
        </View>

        {/* Pending bookings */}
        <Text style={styles.sectionTitle}>Ожидают подтверждения</Text>
        {pending.map((b) => (
          <View key={b.id} style={styles.bookingCard}>
            <View>
              <Text style={styles.bookingClient}>{b.client}</Text>
              <Text style={styles.bookingService}>{b.service}</Text>
              <Text style={styles.bookingTime}>{b.time}</Text>
            </View>
            <View style={styles.bookingActions}>
              <Text style={styles.bookingPrice}>{b.price.toLocaleString()} UZS</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.confirmBtn}>
                  <Text style={styles.confirmText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn}>
                  <Text style={styles.rejectText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* AI Button */}
        <TouchableOpacity
          style={styles.aiCard}
          onPress={() => navigation.navigate("AIChat")}
        >
          <Text style={styles.aiIcon}>🤖</Text>
          <View style={styles.aiInfo}>
            <Text style={styles.aiTitle}>AI Ассистент</Text>
            <Text style={styles.aiSubtitle}>
              Советы по ценам, аналитика загрузки, маркетинг
            </Text>
          </View>
          <Text style={styles.aiArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.md },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  greeting: { fontSize: theme.fontSize.xl, fontWeight: "700", color: theme.colors.text },
  subtitle: { fontSize: theme.fontSize.sm, color: theme.colors.primary, marginTop: 2 },
  logout: { fontSize: theme.fontSize.sm, color: theme.colors.error },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginBottom: theme.spacing.xl },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md, padding: theme.spacing.md, alignItems: "center",
  },
  statValue: { fontSize: theme.fontSize.xl, fontWeight: "700", color: theme.colors.text },
  statLabel: { fontSize: theme.fontSize.xs, color: theme.colors.textDim, marginTop: 2 },
  statSuffix: { fontSize: theme.fontSize.xs, color: theme.colors.primary },
  sectionTitle: {
    fontSize: theme.fontSize.lg, fontWeight: "600", color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  bookingCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, flexDirection: "row", justifyContent: "space-between",
    marginBottom: theme.spacing.sm, alignItems: "center",
  },
  bookingClient: { fontSize: theme.fontSize.md, fontWeight: "600", color: theme.colors.text },
  bookingService: { fontSize: theme.fontSize.sm, color: theme.colors.textDim },
  bookingTime: { fontSize: theme.fontSize.sm, color: theme.colors.accent, marginTop: 2 },
  bookingActions: { alignItems: "flex-end" },
  bookingPrice: { fontSize: theme.fontSize.md, fontWeight: "700", color: theme.colors.accent },
  actionRow: { flexDirection: "row", gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  confirmBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.success,
    justifyContent: "center", alignItems: "center",
  },
  confirmText: { color: theme.colors.white, fontWeight: "700" },
  rejectBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.error,
    justifyContent: "center", alignItems: "center",
  },
  rejectText: { color: theme.colors.white, fontWeight: "700" },
  aiCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md, flexDirection: "row", alignItems: "center",
    marginTop: theme.spacing.lg,
  },
  aiIcon: { fontSize: 32, marginRight: theme.spacing.md },
  aiInfo: { flex: 1 },
  aiTitle: { fontSize: theme.fontSize.md, fontWeight: "600", color: theme.colors.text },
  aiSubtitle: { fontSize: theme.fontSize.xs, color: theme.colors.textDim, marginTop: 2 },
  aiArrow: { fontSize: 24, color: theme.colors.primary },
});
