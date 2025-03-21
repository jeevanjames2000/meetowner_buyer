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
import PropertyLists from "../Pages/components/PropertyLists";
import Wishlist from "../Pages/Wishlist";
import { Platform } from "react-native";
import Support from "../Pages/Support";
const Stack = createNativeStackNavigator();
const CustomHeader = ({ navigation, title, route }) => {
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
      <Pressable onPress={() => navigation.navigate(route)}>
        <Icon as={Ionicons} name="heart-outline" size={6} color="#000" />
      </Pressable>
    </HStack>
  );
};
export default function MainNav() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <Stack.Navigator initialRouteName="Splash">
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
            name="dashboard"
            component={PageNavs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Support"
            component={Support}
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
            name="Wishlist"
            component={Wishlist}
            options={({ navigation }) => ({
              header: () => (
                <CustomHeader navigation={navigation} title="Wishlist" />
              ),
            })}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PropertyList"
            component={PropertyLists}
            options={({ navigation }) => ({
              header: () => (
                <CustomHeader
                  navigation={navigation}
                  title="Property Lists"
                  route="Wishlist"
                />
              ),
            })}
          />
        </Stack.Navigator>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
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
