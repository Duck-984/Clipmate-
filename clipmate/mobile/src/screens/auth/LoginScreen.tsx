import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from "react-native";
import { theme } from "../../theme";
import { authStore } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }
    setLoading(true);
    try {
      // For MVP — mock login (replace with GraphQL mutation)
      // In production: apolloClient.mutate({ mutation: LOGIN, variables: { input: { phone, password } } })
      const mockUser = {
        id: "1",
        phone,
        name: "Тестовый пользователь",
        role: "CLIENT",
      };
      const mockToken = "mock_jwt_token";
      await login(mockUser, mockToken);
    } catch (e: any) {
      Alert.alert("Ошибка", e.message || "Неверные данные");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.logo}>ClipMate</Text>
          <Text style={styles.tagline}>Ваш персональный барбер-маркетплейс</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Телефон</Text>
          <TextInput
            style={styles.input}
            placeholder="+998 XX XXX XX XX"
            placeholderTextColor={theme.colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <Text style={styles.label}>Пароль</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите пароль"
            placeholderTextColor={theme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Вход..." : "Войти"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.linkText}>
              Нет аккаунта? <Text style={styles.linkAccent}>Зарегистрироваться</Text>
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
  header: { alignItems: "center", marginBottom: theme.spacing.xxl },
  logo: {
    fontSize: theme.fontSize.hero,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  tagline: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDim,
    marginTop: theme.spacing.xs,
  },
  form: {},
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDim,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.black,
  },
  link: { alignItems: "center", marginTop: theme.spacing.lg },
  linkText: { fontSize: theme.fontSize.sm, color: theme.colors.textDim },
  linkAccent: { color: theme.colors.primary },
});
