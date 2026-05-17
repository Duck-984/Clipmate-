"use client";

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql",
  headers: {
    Authorization: typeof window !== "undefined"
      ? `Bearer ${localStorage.getItem("clipmate_token")}`
      : "",
  },
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
