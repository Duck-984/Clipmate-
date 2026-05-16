import React from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, ScrollView,
} from "react-native";
import { theme } from "../../theme";

export function BarberDetailScreen({ route, navigation }: any) {
  const { barber } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🪒</Text>
          </View>
          <Text style={styles.name}>{barber.user.name}</Text>
          <Text style={styles.city}>{barber.user.city}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {barber.avgRating}</Text>
            <Text style={styles.reviews}>({barber.totalReviews} отзывов)</Text>
          </View>
        </View>

        {/* Services */}
        <Text style={styles.sectionTitle}>Услуги</Text>
        {barber.services.map((svc: any) => (
          <TouchableOpacity
            key={svc.id}
            style={styles.serviceCard}
            onPress={() =>
              navigation.navigate("Booking", { barber, service: svc })
            }
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{svc.name}</Text>
              <Text style={styles.serviceDuration}>{svc.duration} мин</Text>
            </View>
            <Text style={styles.servicePrice}>
              {svc.price.toLocaleString()} UZS
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Book FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("Booking", {
            barber,
            service: barber.services[0],
          })
        }
      >
        <Text style={styles.fabText}>Записаться</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.md, paddingBottom: 100 },
  header: { alignItems: "center", marginBottom: theme.spacing.xl },
  avatar: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.surfaceLight,
    justifyContent: "center", alignItems: "center", marginBottom: theme.spacing.md,
  },
  avatarText: { fontSize: 48 },
  name: { fontSize: theme.fontSize.xl, fontWeight: "700", color: theme.colors.text },
  city: { fontSize: theme.fontSize.sm, color: theme.colors.textDim, marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  rating: { fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: "700" },
  reviews: { fontSize: theme.fontSize.sm, color: theme.colors.textDim },
  sectionTitle: {
    fontSize: theme.fontSize.lg, fontWeight: "600", color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  serviceCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: theme.spacing.sm,
  },
  serviceInfo: {},
  serviceName: { fontSize: theme.fontSize.md, color: theme.colors.text, fontWeight: "500" },
  serviceDuration: { fontSize: theme.fontSize.xs, color: theme.colors.textDim, marginTop: 2 },
  servicePrice: { fontSize: theme.fontSize.lg, fontWeight: "700", color: theme.colors.accent },
  fab: {
    position: "absolute", bottom: theme.spacing.lg, left: theme.spacing.md, right: theme.spacing.md,
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, alignItems: "center",
  },
  fabText: { fontSize: theme.fontSize.lg, fontWeight: "700", color: theme.colors.black },
});
