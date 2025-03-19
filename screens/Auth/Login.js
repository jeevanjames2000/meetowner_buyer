import { Image, Input, Button } from "native-base";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function LoginScreen({ navigation }) {
  const [mobile, setMobile] = useState("+91");

  const handleChange = (text) => setMobile(text);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Image
            style={styles.image}
            source={require("../../assets/WhatsApp Image 2025-03-17 at 1.59.43 AM.jpeg")}
            alt="Meet Owner"
            resizeMode="cover"
          />

          <View style={styles.bottomSheet}>
            <Image
              source={require("../../assets/Untitled-22.png")}
              alt="Meet Owner Logo"
              style={styles.logo}
              resizeMethod="contain"
            />
            <Input
              variant="unstyled"
              placeholder="Please enter your mobile number"
              keyboardType="phone-pad"
              style={styles.input}
              value={mobile}
              onChangeText={handleChange}
            />
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

            {/* Proper Divider for "OR" */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.signupButton}>
              <View style={styles.whatsappContainer}>
                <Image
                  source={require("../../assets/whatsapp.png")}
                  alt="WhatsApp"
                  style={styles.whatsappLogo}
                />
                <Text style={styles.signupText}>Login with WhatsApp</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              By Continuing you agree to{" "}
              <Text style={styles.linkText}>Terms of Service</Text> and{" "}
              <Text style={styles.linkText}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "90%",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "45%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: {
    width: 177,
    height: 60,
    marginBottom: 10,
  },
  whatsappLogo: {
    height: 30,
    width: 30,
  },
  whatsappContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "70%",
    marginTop: 20,
    height: 45,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    fontSize: 16,
    paddingLeft: 5,
  },
  loginButton: {
    width: "100%",
    padding: 20,
    borderRadius: 30,
    marginTop: 15,
    alignItems: "center",
    backgroundColor: "#1D3A76",
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    marginVertical: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  signupButton: {
    width: "100%",
    padding: 15,
    borderRadius: 30,
    backgroundColor: "#25D366",
    alignItems: "center",
  },
  signupText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    marginTop: 15,
    textAlign: "center",
  },
  linkText: {
    color: "#000",
    fontWeight: "bold",
  },
});
