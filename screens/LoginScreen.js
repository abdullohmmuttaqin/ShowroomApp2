import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { login } from "../utils/auth";

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Peringatan", "Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);

    setIsLoading(false);

    if (result.error) {
      Alert.alert("Gagal", result.error);
      return;
    }

    onLoginSuccess(result.user);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>ShowroomApp</Text>
        <Text style={styles.subtitle}>Masuk untuk melanjutkan</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.btnLogin, isLoading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.btnLoginText}>
          {isLoading ? "Memproses..." : "Masuk"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2563eb",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    color: "#bfdbfe",
    marginTop: 6,
    fontSize: 14,
  },
  form: {
    backgroundColor: "#fff",
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
  },
  input: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
  },
  btnLogin: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  btnLoginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
