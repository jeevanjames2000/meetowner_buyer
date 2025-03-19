import { Image, Spinner } from "native-base";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login");
    }, 2000);
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
