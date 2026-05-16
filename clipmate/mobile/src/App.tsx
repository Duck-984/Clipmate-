import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApolloProvider } from "@apollo/client";
import { View, Text, StyleSheet } from "react-native";
import { apolloClient } from "./services/api";
import { theme } from "./theme";
import { LoginScreen } from "./screens/auth/LoginScreen";
import { RegisterScreen } from "./screens/auth/RegisterScreen";
import { HomeScreen } from "./screens/client/HomeScreen";
import { BarberDetailScreen } from "./screens/client/BarberDetailScreen";
import { BookingScreen } from "./screens/client/BookingScreen";
import { AIChatScreen } from "./screens/client/AIChatScreen";
import { BarberDashboardScreen } from "./screens/barber/BarberDashboardScreen";
import { useAuth } from "./hooks/useAuth";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: theme.colors.bg },
  headerTintColor: theme.colors.text,
  headerTitleStyle: { fontWeight: "600" as const },
  contentStyle: { backgroundColor: theme.colors.bg },
  animation: "slide_from_right" as const,
};

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>ClipMate</Text>
        <Text style={styles.splashSubtitle}>AI-Powered Barber Marketplace</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!user ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : user.role === "BARBER" ? (
        <>
          <Stack.Screen
            name="BarberDashboard"
            component={BarberDashboardScreen}
            options={{ title: "ClipMate" }}
          />
          <Stack.Screen
            name="AIChat"
            component={AIChatScreen}
            options={{ title: "AI Ассистент" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BarberDetail"
            component={BarberDetailScreen}
            options={{ title: "Барбер" }}
          />
          <Stack.Screen
            name="Booking"
            component={BookingScreen}
            options={{ title: "Запись" }}
          />
          <Stack.Screen
            name="AIChat"
            component={AIChatScreen}
            options={{ title: "AI Стилист" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  splashTitle: {
    fontSize: theme.fontSize.hero,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  splashSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDim,
    marginTop: theme.spacing.sm,
  },
});
