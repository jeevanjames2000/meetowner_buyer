import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "native-base";
import { useNavigation } from "@react-navigation/native";
export default function OtpScreen() {
  const navigation = useNavigation();
  const otpLength = 6;
  const [otp, setOtp] = useState(new Array(otpLength).fill(""));
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const inputs = useRef([]);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otpLength - 1) {
      inputs.current[index + 1].focus();
    }
  };
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={26} color="#000" />
            </TouchableOpacity>

            <View style={styles.otpView}>
              <Text style={styles.title}>Enter the OTP sent to</Text>
              <Text style={styles.subtitle}>(+91) 6302816551</Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
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
              <TouchableOpacity>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <View
          style={[
            styles.bottomContainer,
            isKeyboardVisible && styles.bottomContainerKeyboardVisible,
          ]}
        >
          <Button style={styles.continueButton}>
            <Text style={styles.buttonText}>Continue</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "flex-start",
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
    marginBottom: 20,
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
  resendText: {
    color: "#1D3A76",
    fontWeight: "bold",
    marginTop: 10,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  bottomContainerKeyboardVisible: {
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
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
