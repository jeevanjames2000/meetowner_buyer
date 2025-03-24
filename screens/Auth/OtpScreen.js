import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  Platform,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "native-base";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function OtpScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mobile = "" } = route.params || {};

  const otpLength = 6;
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState(new Array(otpLength).fill(""));
  const inputs = useRef([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (mobile) {
      sendOTP(mobile);
      navigation.setParams({ mobile: "" });
    }
  }, [mobile]);

  const sendOTP = async (mobile) => {
    try {
      const response = await axios.get(
        `https://api.meetowner.in/auth/sendOtp?mobile=${mobile}`
      );
      const data = response.data;
      if (data.status === "success") {
        setOtp(data.otp);
        setMessage("OTP sent successfully to +91 " + mobile);
        setError("");
      } else {
        setError("Failed to send OTP. Please try again later!");
        setMessage("");
      }
    } catch (error) {
      setError("Something went wrong. Please try again later!");
      setMessage("");
    }
  };

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    let newOtp = [...enteredOtp];
    newOtp[index] = value;
    setEnteredOtp(newOtp);
    if (value && index < otpLength - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !enteredOtp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = () => {
    const userEnteredOtp = enteredOtp.join("").trim();
    const generatedOtp = String(otp).trim();

    if (userEnteredOtp.length !== otpLength) {
      setError("Please enter a valid 6-digit OTP.");
      setMessage("");
      return;
    }
    if (userEnteredOtp === generatedOtp) {
      setMessage("Verification successful!");
      setError("");
      navigation.replace("dashboard");
    } else {
      setError("Incorrect OTP. Please try again.");
      setMessage("");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <View style={styles.otpView}>
            <Text style={styles.title}>Enter the OTP sent to</Text>
            <Text style={styles.subtitle}>(+91) {mobile}</Text>
            <View style={styles.otpContainer}>
              {enteredOtp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => (inputs.current[index] = el)}
                  style={styles.input}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {message ? <Text style={styles.successText}>{message}</Text> : null}

            <TouchableOpacity onPress={() => sendOTP(mobile)}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomContainer}>
            <Button onPress={handleVerifyOtp} style={styles.continueButton}>
              <Text style={styles.buttonText}>Continue</Text>
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  otpView: {
    marginTop: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 10,
  },
  input: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 10,
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    fontWeight: "bold",
  },
  successText: {
    color: "green",
    marginTop: 10,
    fontWeight: "bold",
  },
  resendText: {
    color: "#1D3A76",
    fontWeight: "bold",
    marginTop: 10,
  },
  bottomContainer: {
    justifyContent: "flex-end",
    paddingBottom: 20,
    backgroundColor: "#fff",
    width: "100%",
  },
  continueButton: {
    backgroundColor: "#1D3A76",
    padding: 15,
    height: 60,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
