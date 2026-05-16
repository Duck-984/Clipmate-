import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { theme } from "../../theme";
import { useAuth } from "../../hooks/useAuth";

const ROLES = [
  { key: "CLIENT", label: "Клиент" },
  { key: "BARBER", label: "Барбер" },
];

export function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CLIENT");
  const { login } = useAuth();

  const handleRegister = async () => {
    // MVP mock registration
    await login(
      { id: "mock", phone, name, role },
      "mock_jwt_token"
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.logo}>ClipMate</Text>
          <Text style={styles.tagline}>Создать аккаунт</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Я регистрируюсь как</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleBtn, role === r.key && styles.roleActive]}
                onPress={() => setRole(r.key)}
              >
                <Text style={[styles.roleText, role === r.key && styles.roleTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Имя</Text>
          <TextInput
            style={styles.input}
            placeholder="Ваше имя"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Телефон</Text>
          <TextInput
            style={styles.input}
            placeholder="+998 XX XXX XX XX"
            placeholderTextColor={theme.colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Пароль</Text>
          <TextInput
            style={styles.input}
            placeholder="Придумайте пароль"
            placeholderTextColor={theme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Зарегистрироваться</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>
              Уже есть аккаунт? <Text style={styles.linkAccent}>Войти</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  inner: { flexGrow: 1, justifyContent: "center", padding: theme.spacing.lg },
  header: { alignItems: "center", marginBottom: theme.spacing.xl },
  logo: { fontSize: theme.fontSize.hero, fontWeight: "800", color: theme.colors.primary },
  tagline: { fontSize: theme.fontSize.sm, color: theme.colors.textDim, marginTop: theme.spacing.xs },
  form: {},
  label: { fontSize: theme.fontSize.sm, color: theme.colors.textDim, marginBottom: theme.spacing.xs, marginTop: theme.spacing.md },
  input: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  roleRow: { flexDirection: "row", gap: theme.spacing.sm },
  roleBtn: {
    flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    alignItems: "center",
  },
  roleActive: { borderColor: theme.colors.primary, backgroundColor: "#1A1A0A" },
  roleText: { fontSize: theme.fontSize.md, color: theme.colors.textDim },
  roleTextActive: { color: theme.colors.primary, fontWeight: "600" },
  button: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, alignItems: "center", marginTop: theme.spacing.xl,
  },
  buttonText: { fontSize: theme.fontSize.lg, fontWeight: "700", color: theme.colors.black },
  link: { alignItems: "center", marginTop: theme.spacing.lg },
  linkText: { fontSize: theme.fontSize.sm, color: theme.colors.textDim },
  linkAccent: { color: theme.colors.primary },
});
