import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { FlatList, StatusBar } from "native-base";
import HerosSection from "./components/HerosSection";
import Properties from "./components/Properties";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Sell");
  const handleActiveTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <FlatList
            ListHeaderComponent={
              <HerosSection handleActiveTab={handleActiveTab} />
            }
            data={[]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={null}
            ListFooterComponent={<Properties activeTab={activeTab} />}
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
    paddingHorizontal: 10,
  },
});
