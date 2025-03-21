import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image, Spinner, Toast } from "native-base";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { jwtDecode } from "jwt-decode";
import { useNavigation } from "@react-navigation/native";
export default function SplashScreen() {
  const navigation = useNavigation();
  useEffect(() => {
    // AsyncStorage.removeItem("token");
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        let routeName = "Login";
        if (token) {
          const decoded = jwtDecode(token);
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp && decoded.exp > currentTime) {
            routeName = "dashboard";
          } else {
            await AsyncStorage.removeItem("token");
            Toast.show({
              title: "Session expired. Please login again.",
              duration: 3000,
            });
          }
        }
        setTimeout(() => {
          navigation.replace(routeName);
        }, 3500);
      } catch (error) {
        console.error("Error checking token:", error);
        setTimeout(() => {
          navigation.replace("Login");
        }, 3500);
      }
    };
    checkToken();
  }, []);
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/Meet Owner Logo 1.png")}
        alt="Meet Owner Logo"
        resizeMode="contain"
      />
      <Spinner size="lg" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: 300,
    height: 300,
  },
});
