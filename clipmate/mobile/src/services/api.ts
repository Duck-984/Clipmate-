import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from "@apollo/client";
import * as SecureStore from "expo-secure-store";

const API_URL = __DEV__
  ? "http://192.168.1.100:4000/graphql"  // change to your local IP
  : "https://api.clipmate.uz/graphql";

const authLink = new ApolloLink((operation, forward) => {
  const token = SecureStore.getItem("auth_token");
  operation.setContext({
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  return forward(operation);
});

const httpLink = createHttpLink({ uri: API_URL });

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});

// Auth helpers
export const authStore = {
  setToken: (token: string) => SecureStore.setItem("auth_token", token),
  getToken: () => SecureStore.getItem("auth_token"),
  removeToken: () => SecureStore.deleteItemAsync("auth_token"),
  setUser: (user: any) => SecureStore.setItem("user_data", JSON.stringify(user)),
  getUser: async () => {
    const data = await SecureStore.getItem("user_data");
    return data ? JSON.parse(data) : null;
  },
  logout: async () => {
    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("user_data");
  },
};
