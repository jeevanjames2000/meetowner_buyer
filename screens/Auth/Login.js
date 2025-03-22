import { useNavigation } from "@react-navigation/native";
import { Image, Input, Button } from "native-base";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setLoggedIn } from "../../store/slices/authSlice";
import {
  setCities,
  setDeviceLocation,
} from "../../store/slices/propertyDetails";
import * as Location from "expo-location";
export default function LoginScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [mobile, setMobile] = useState("6302816551");
  const handleChange = (text) => setMobile(text);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const handleLoginform = async () => {
    if (mobile === "" || mobile.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("https://api.meetowner.in/auth/login", {
        mobile: mobile,
      });
      const data = response.data;
      console.log("data: ", data);
      if (data.status === "success") {
        await AsyncStorage.multiSet([
          ["token", data.accessToken],
          ["usermobile", mobile],
          ["userdetails", JSON.stringify(data.user_details)],
        ]);
        navigation.navigate("OtpScreen", { mobile: mobile });
        dispatch(setLoggedIn(true));
        setData(data);
      } else {
        Alert.alert(
          "Login Failed",
          data.message || "Unable to login. Please try again."
        );
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtpViaWhatsApp = async (phoneNumber, otp) => {
    const apiKey = "67a9e93d43fb8e2e808a783a";
    const accountId = "677f66df176346e7ae5fa5b8";
    const channelId = "67a9e14542596631a8cfc87b";
    const templateName = "login_otp";
    const payload = {
      bulk: [
        {
          accountId: accountId,
          channelId: channelId,
          channelType: "whatsapp",
          context: {
            medium: "inbox",
          },
          recipient: {
            phone: 91630816551,
          },
          whatsapp: {
            type: "template",
            template: {
              templateName: templateName,
              bodyValues: {
                otp: otp,
              },
              buttonValues: [],
            },
          },
        },
      ],
    };
    try {
      const response = await axios.post(
        "https://server.gallabox.com/api/accounts/677f66df176346e7ae5fa5b8/wa-messages/bulk",
        payload,
        {
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Gallabox API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Gallabox API Error:",
        error.response?.data || error.message
      );
      throw error;
    }
  };
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
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLoginform}
              disabled={isLoading}
            >
              <Text style={styles.loginText}>
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>
            {}
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
