import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert,
} from "react-native";
import { theme } from "../../theme";

export function BookingScreen({ route, navigation }: any) {
  const { barber, service } = route.params;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      key: d.toISOString().split("T")[0],
      day: d.toLocaleDateString("ru", { weekday: "short" }),
      date: d.toLocaleDateString("ru", { day: "numeric", month: "short" }),
    };
  });

  // Mock time slots
  const times = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "13:00", "14:00", "14:30", "15:00", "16:00",
  ];

  const handleBook = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Выберите дату и время");
      return;
    }
    Alert.alert(
      "Подтверждение",
      `Запись к ${barber.user.name}\n${service.name}\n${selectedDate} в ${selectedTime}\nСтоимость: ${service.price.toLocaleString()} UZS`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Подтвердить",
          onPress: () => {
            Alert.alert("Готово!", "Запись создана. Барбер подтвердит её в ближайшее время.");
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Service info */}
        <View style={styles.serviceCard}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceMeta}>
            {service.duration} мин • {service.price.toLocaleString()} UZS
          </Text>
        </View>

        {/* Date selection */}
        <Text style={styles.sectionTitle}>Выберите дату</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.dateRow}>
            {dates.map((d) => (
              <TouchableOpacity
                key={d.key}
                style={[styles.dateBtn, selectedDate === d.key && styles.selectedBtn]}
                onPress={() => setSelectedDate(d.key)}
              >
                <Text style={[styles.dateDay, selectedDate === d.key && styles.selectedText]}>
                  {d.day}
                </Text>
                <Text style={[styles.dateNum, selectedDate === d.key && styles.selectedText]}>
                  {d.date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Time selection */}
        <Text style={styles.sectionTitle}>Выберите время</Text>
        <View style={styles.timeGrid}>
          {times.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.timeBtn, selectedTime === t && styles.selectedBtn]}
              onPress={() => setSelectedTime(t)}
            >
              <Text style={[styles.timeText, selectedTime === t && styles.selectedText]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Book button */}
      <View style={styles.bottom}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Итого:</Text>
          <Text style={styles.priceValue}>{service.price.toLocaleString()} UZS</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
          <Text style={styles.bookText}>Записаться</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.md, paddingBottom: 120 },
  serviceCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, marginBottom: theme.spacing.xl,
  },
  serviceName: { fontSize: theme.fontSize.lg, fontWeight: "600", color: theme.colors.text },
  serviceMeta: { fontSize: theme.fontSize.sm, color: theme.colors.textDim, marginTop: 4 },
  sectionTitle: {
    fontSize: theme.fontSize.md, fontWeight: "600", color: theme.colors.text,
    marginBottom: theme.spacing.md, marginTop: theme.spacing.md,
  },
  dateRow: { flexDirection: "row", gap: theme.spacing.sm, paddingRight: theme.spacing.md },
  dateBtn: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, alignItems: "center", width: 80,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  selectedBtn: { borderColor: theme.colors.primary, backgroundColor: "#1A1A0A" },
  dateDay: { fontSize: theme.fontSize.xs, color: theme.colors.textDim, textTransform: "capitalize" },
  dateNum: { fontSize: theme.fontSize.sm, color: theme.colors.text, marginTop: 4 },
  selectedText: { color: theme.colors.primary },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  timeBtn: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  timeText: { fontSize: theme.fontSize.sm, color: theme.colors.text },
  bottom: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border,
    padding: theme.spacing.md, paddingBottom: theme.spacing.xl,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  priceRow: {},
  priceLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textDim },
  priceValue: { fontSize: theme.fontSize.lg, fontWeight: "700", color: theme.colors.text },
  bookBtn: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md,
  },
  bookText: { fontSize: theme.fontSize.md, fontWeight: "700", color: theme.colors.black },
});
