import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from "react-native";
import { theme } from "../../theme";

const MOCK_REPLIES = [
  "Классический фейд — отличный выбор для любой формы лица. Рекомендую барбера Алексея, он специализируется на fade-стрижках.",
  "Для ухода за волосами используйте масло арганы 2 раза в неделю. Хотите — подберу товары в нашем маркетплейсе?",
  "Судя по вашему описанию, вам подойдёт текстурированная стрижка с удлинённой чёлкой. Показать барберов, которые это делают?",
];

export function AIChatScreen() {
  const [messages, setMessages] = useState([
    { id: "0", role: "assistant", content: "Привет! Я ваш AI-стилист. Загрузите фото или опишите, какую стрижку хотите — и я подберу лучший вариант." },
  ]);
  const [input, setInput] = useState("");
  const [credits, setCredits] = useState(3);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim() || credits <= 0) return;

    const userMsg = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Mock AI reply
    setTimeout(() => {
      const reply =
        MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
      const aiMsg = { id: (Date.now() + 1).toString(), role: "assistant", content: reply };
      setMessages((prev) => [...prev, aiMsg]);
      setCredits((c) => c - 1);
    }, 800);
  };

  const renderMessage = ({ item }: any) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        <View style={[styles.msgBubble, isUser ? styles.msgUser : styles.msgAI]}>
          <Text style={[styles.msgText, isUser && styles.msgTextUser]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.creditBar}>
        <Text style={styles.creditText}>
          🤖 AI-кредиты: <Text style={styles.creditNum}>{credits}</Text>
        </Text>
        {credits <= 0 && (
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeText}>Купить</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Опишите стрижку или задайте вопрос..."
            placeholderTextColor={theme.colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || credits <= 0) && styles.sendDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || credits <= 0}
          >
            <Text style={styles.sendText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  creditBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderColor: theme.colors.border,
  },
  creditText: { fontSize: theme.fontSize.sm, color: theme.colors.textDim },
  creditNum: { color: theme.colors.primary, fontWeight: "700" },
  upgradeBtn: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md, paddingVertical: 4,
  },
  upgradeText: { fontSize: theme.fontSize.xs, fontWeight: "700", color: theme.colors.black },
  msgList: { padding: theme.spacing.md, flexGrow: 1 },
  msgRow: { marginBottom: theme.spacing.md, alignItems: "flex-start" },
  msgRowUser: { alignItems: "flex-end" },
  msgBubble: {
    maxWidth: "80%", borderRadius: theme.borderRadius.lg, padding: theme.spacing.md,
  },
  msgAI: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 4 },
  msgUser: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  msgText: { fontSize: theme.fontSize.md, color: theme.colors.text, lineHeight: 22 },
  msgTextUser: { color: theme.colors.black },
  inputRow: {
    flexDirection: "row", alignItems: "flex-end",
    padding: theme.spacing.sm, backgroundColor: theme.colors.surface,
    borderTopWidth: 1, borderColor: theme.colors.border,
  },
  input: {
    flex: 1, backgroundColor: theme.colors.surfaceLight, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center", marginLeft: theme.spacing.sm,
  },
  sendDisabled: { opacity: 0.4 },
  sendText: { fontSize: 20, color: theme.colors.black, fontWeight: "700" },
});
