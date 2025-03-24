import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image, Spinner, Toast } from "native-base";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { jwtDecode } from "jwt-decode";
import { useNavigation } from "@react-navigation/native";

export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const data = await AsyncStorage.getItem("userdetails");
        const parsedUserDetails = data ? JSON.parse(data) : null;

        let routeName = "Login";

        if (token) {
          const decoded = jwtDecode(token);
          const currentTime = Math.floor(Date.now() / 1000);

          // If user details are missing, clear all data
          if (!parsedUserDetails) {
            await AsyncStorage.clear(); // Clear all keys
            routeName = "Login";
          }
          // Check if token is valid and not expired
          else if (decoded.exp && decoded.exp > currentTime) {
            routeName = "dashboard";
          } else {
            // Token expired, clear AsyncStorage and show a toast
            await AsyncStorage.clear(); // Clear all data
            Toast.show({
              title: "Session expired. Please login again.",
              duration: 3000,
            });
          }
        } else {
          // No token found, navigate to Login
          routeName = "Login";
        }

        // Navigate after a short delay
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
