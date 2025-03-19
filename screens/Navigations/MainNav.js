import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Pressable, Text, StyleSheet } from "react-native";
import { HStack, Icon } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "../Auth/Login";
import SplashScreen from "../Auth/SplashScreen";
import PageNavs from "./PageNavs";
import OtpScreen from "../Auth/OtpScreen";
import PropertyDetails from "../Pages/components/PropertyDetails";
import Profile from "../Pages/components/Profile";
const Stack = createNativeStackNavigator();
const CustomHeader = ({ navigation, title }) => {
  return (
    <HStack
      style={styles.header}
      justifyContent="space-between"
      alignItems="center"
    >
      <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
        <Icon as={Ionicons} name="arrow-back" size={6} color="#000" />
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <Pressable onPress={() => console.log("Notifications Clicked")}>
        <Icon as={Ionicons} name="heart-outline" size={6} color="#000" />
      </Pressable>
    </HStack>
  );
};
export default function MainNav() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <Stack.Navigator initialRouteName="PageNavs">
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="OtpScreen"
            component={OtpScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="PageNavs"
            component={PageNavs}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="PropertyDetails"
            component={PropertyDetails}
            options={({ navigation }) => ({
              header: () => (
                <CustomHeader
                  navigation={navigation}
                  title="Property Details"
                />
              ),
            })}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});
