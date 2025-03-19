import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Keyboard,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  StatusBar,
  Platform,
} from "react-native";
import { Box, VStack, HStack, Text, Pressable, Icon } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
const faqsData = [
  {
    id: 1,
    question: "Is there a free trial available?",
    answer: "Yes, you can try us for free for 30 days.",
  },
  {
    id: 2,
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade anytime.",
  },
  {
    id: 3,
    question: "What is your cancellation policy?",
    answer: "Cancel anytime with no fees.",
  },
  {
    id: 4,
    question: "How does billing work?",
    answer: "Monthly or annually, based on your plan.",
  },
  {
    id: 5,
    question: "How do I change my account email?",
    answer: "Update it in account settings.",
  },
];
export default function Support() {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const scrollViewRef = useRef();
  const handleRouteBack = () => navigation.goBack();
  const toggleFAQ = (id) => {
    setExpanded(expanded === id ? null : id);
  };
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };
  const validateForm = () => {
    let valid = true;
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Valid mobile number is required";
      valid = false;
    }
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Valid email is required";
      valid = false;
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };
  const handleSubmit = () => {
    Keyboard.dismiss();
    setSubmitted(true);
    if (validateForm()) {
      console.log("Form Submitted:", formData);
      setSubmitted(false);
      setFormData({
        name: "",
        mobile: "",
        email: "",
        message: "",
      });
      setErrors({});
      setTimeout(() => setSubmitted(false), 3000);
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    );
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentInsetAdjustmentBehavior="automatic"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <VStack p={4} mt={1} space={4}>
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                  Frequently asked questions
                </Text>
                {faqsData.map((faq) => (
                  <Box
                    key={faq.id}
                    bg="white"
                    p={3}
                    rounded="md"
                    borderWidth={1}
                    borderColor="gray.200"
                  >
                    <Pressable onPress={() => toggleFAQ(faq.id)}>
                      <HStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text fontWeight="bold">{faq.question}</Text>
                        <Icon
                          as={Ionicons}
                          name={
                            expanded === faq.id ? "chevron-up" : "chevron-down"
                          }
                          size={5}
                          color="gray.500"
                        />
                      </HStack>
                    </Pressable>
                    {expanded === faq.id && (
                      <Text mt={2} color="gray.600">
                        {faq.answer}
                      </Text>
                    )}
                  </Box>
                ))}
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  textAlign="left"
                  mt={5}
                  ml={2}
                >
                  Contact Us
                </Text>
                <VStack space={4} mt={2}>
                  <TextInput
                    style={[
                      styles.input,
                      errors.name && { borderColor: "red" },
                    ]}
                    placeholder="Name"
                    value={formData.name}
                    onChangeText={(value) => handleChange("name", value)}
                  />
                  {errors.name && (
                    <Text style={styles.error}>{errors.name}</Text>
                  )}
                  <TextInput
                    style={[
                      styles.input,
                      errors.mobile && { borderColor: "red" },
                    ]}
                    placeholder="Mobile Number"
                    keyboardType="phone-pad"
                    value={formData.mobile}
                    onChangeText={(value) => handleChange("mobile", value)}
                  />
                  {errors.mobile && (
                    <Text style={styles.error}>{errors.mobile}</Text>
                  )}
                  <TextInput
                    style={[
                      styles.input,
                      errors.email && { borderColor: "red" },
                    ]}
                    placeholder="Email"
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(value) => handleChange("email", value)}
                  />
                  {errors.email && (
                    <Text style={styles.error}>{errors.email}</Text>
                  )}
                  <TextInput
                    style={[
                      styles.textArea,
                      errors.message && { borderColor: "red" },
                    ]}
                    placeholder="Your Message"
                    value={formData.message}
                    onChangeText={(value) => handleChange("message", value)}
                    multiline
                    numberOfLines={4}
                  />
                  {errors.message && (
                    <Text style={styles.error}>{errors.message}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitBtnText}>Submit</Text>
                  </TouchableOpacity>
                  {submitted && (
                    <Text style={styles.successMsg}>
                      Your message has been sent successfully!
                    </Text>
                  )}
                </VStack>
              </VStack>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  successMsg: {
    color: "green",
    textAlign: "center",
    marginTop: 10,
  },
});
