import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { HStack, Icon, Image, FlatList, StatusBar } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import HerosSection from "./components/HerosSection";
import Properties from "./components/Properties";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <FlatList
            ListHeaderComponent={<HerosSection />}
            data={[]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={null}
            ListFooterComponent={<Properties />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 18,
  },
  logo: {
    width: 120,
    height: 70,
  },
  flatListContainer: {
    paddingHorizontal: 15,
  },
});
