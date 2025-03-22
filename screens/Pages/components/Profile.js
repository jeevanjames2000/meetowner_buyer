import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { HStack, Toast } from "native-base";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../../../config";
export default function Profile() {
  const [data, setData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userFile, setUserFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const handleEditProfileImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission denied!", "Camera roll access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setUserFile({
        uri: result.assets[0].uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });
      setImageModalVisible(true);
    }
  };
  const performLogout = () => {
    setLoading(true);
    setTimeout(() => {
      AsyncStorage.removeItem("token");
      navigation.navigate("Login");
      setLoading(false);
    }, 1000);
  };
  const [userDetails, setUserDetails] = useState(null);
  const CACHE_DURATION = 10 * 60 * 1000;
  const fetchProfileDetails = async () => {
    try {
      const storedDetails = await AsyncStorage.getItem("userdetails");
      if (!storedDetails) {
        return;
      }
      const parsedUserDetails = JSON.parse(storedDetails);
      setUserDetails(parsedUserDetails);
      const cachedData = await AsyncStorage.getItem("profileData");
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const currentTime = new Date().getTime();
        if (currentTime - timestamp < CACHE_DURATION) {
          setData(data);
          setName(data.name || "N/A");
          setEmail(data.email || "N/A");
          setPhone(data.mobile || "N/A");
          return;
        }
      }
      const response = await axios.get(
        `https://meetowner.in/Api/api?table=users&mobile=${parsedUserDetails?.mobile}&key=meetowner_universal&transc=get_user_det_by_mobile`
      );
      const fetchedData = response.data;
      if (Array.isArray(fetchedData) && fetchedData.length > 0) {
        const data = fetchedData[0];
        setData(data);
        setName(data.name || "N/A");
        setEmail(data.email || "N/A");
        setPhone(data.mobile || "N/A");
        await AsyncStorage.setItem(
          "profileData",
          JSON.stringify({ data, timestamp: new Date().getTime() })
        );
      } else {
        Alert.alert("Error", "Failed to load user details.");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      Alert.alert("Error", "Unable to load profile data.");
    }
  };
  useEffect(() => {
    fetchProfileDetails();
  }, []);
  useEffect(() => {
    fetchProfileDetails();
  }, []);
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => performLogout() },
      ],
      { cancelable: false }
    );
  };
  const submitProfileDetails = async () => {
    if (!userDetails || !userDetails.user_id) {
      Alert.alert("Error", "User details are missing. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${config.mainapi_url}/Api/newapi`, {
        action: "user_editform_submit",
        mobile_app_submit: "Yes",
        name: name,
        email: email,
        mobile: phone,
        user_id: userDetails.user_id,
      });
      if (response.data.status === "success") {
        Toast.show({
          title: "User details updated successfully",
          duration: 1000,
        });
        AsyncStorage.removeItem("profileData");
        fetchProfileDetails();
        setModalVisible(false);
      } else {
        Alert.alert("Error", "Failed to update profile.");
        Toast.show({
          title: "Failed to update profile.",
          duration: 1000,
        });
      }
    } catch (error) {
      Toast.show({
        title: "Something went wrong.",
        duration: 1000,
      });
    } finally {
      setLoading(false);
    }
  };
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const toggleAccordion = (section) => {
    setExpandedAccordion(expandedAccordion === section ? null : section);
  };
  const submitProfileImage = async () => {
    if (!userFile) {
      Alert.alert("Error", "Please upload a profile photo.");
      return;
    }
    const formData = new FormData();
    formData.append("photo", {
      uri: userFile.uri,
      type: userFile.type,
      name: userFile.name,
    });
    formData.append("user_id", userDetails.user_id);
    setLoading(true);
    try {
      const response = await axios.post(
        `${config.awsApiUrl}/user/updateuserphotomain`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.status === "success") {
        AsyncStorage.removeItem("profileData");
        fetchProfileDetails(true);
        setImageModalVisible(false);
        setLoading(false);
        Toast.show({
          title: "Image updated successfully",
          duration: 1000,
        });
      } else {
        setLoading(false);
        Alert.alert("Error", "Image upload failed. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Upload Error:", error);
      Alert.alert("Upload Failed", "Image upload failed. Please try again.");
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <HStack justifyContent={"flex-start"} style={styles.backButton}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={30} color="gray" />
            </TouchableOpacity>
          </HStack>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: `https://meetowner.in/uploads/${data?.photo}`,
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.editIcon}
              onPress={handleEditProfileImage}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{data?.name || "N/A"}</Text>
          <Text style={styles.memberSince || "N/A"}>
            Member since {data?.created_date}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
        <View style={styles.accordionContainer}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleAccordion("homeSearch")}
          >
            <Text style={styles.accordionTitle}>🏡 Home Search</Text>
            <Ionicons
              name={
                expandedAccordion === "homeSearch"
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>
          {expandedAccordion === "homeSearch" && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                Search for properties with your preferences easily. Apply
                filters to refine your search.
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleAccordion("recommendations")}
          >
            <Text style={styles.accordionTitle}>
              ✨ Recommendation Properties
            </Text>
            <Ionicons
              name={
                expandedAccordion === "recommendations"
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>
          {expandedAccordion === "recommendations" && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                Get property recommendations based on your search history and
                preferences.
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleAccordion("reportFraud")}
          >
            <Text style={styles.accordionTitle}>⚠️ Report a Fraud</Text>
            <Ionicons
              name={
                expandedAccordion === "reportFraud"
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>
          {expandedAccordion === "reportFraud" && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                Report suspicious activity or fraudulent listings to keep the
                platform secure.
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleAccordion("helpCenter")}
          >
            <Text style={styles.accordionTitle}>💡 Help Center</Text>
            <Ionicons
              name={
                expandedAccordion === "helpCenter"
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>
          {expandedAccordion === "helpCenter" && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                Get assistance and answers to frequently asked questions.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={60} color="green" />
        </View>
      )}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.gobackbutton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Modal
        transparent={true}
        animationType="slide"
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Upload Profile Image</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setImageModalVisible(false)}
              >
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={submitProfileImage}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.saveText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              value={name}
              onChangeText={(text) => setName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              value={email}
              keyboardType="email-address"
              onChangeText={(text) => setEmail(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              value={phone}
              keyboardType="phone-pad"
              onChangeText={(text) => setPhone(text)}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitProfileDetails}
                disabled={loading}
                style={styles.saveBtn}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 0,
    zIndex: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  imageContainer: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#4F46E5",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  editIcon: {
    position: "absolute",
    bottom: 20,
    right: -2,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    padding: 5,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  memberSince: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
  },
  editProfileBtn: {
    backgroundColor: "#1D3A76",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "50%",
    alignSelf: "center",
    alignItems: "center",
  },
  editProfileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  bottomButtons: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  gobackbutton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
    borderColor: "#B7B6B6",
    borderWidth: 1,
  },
  logoutBtn: {
    backgroundColor: "#1D3A76",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  goBackText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  accordionContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    borderColor: "#EDF2FF",
    borderWidth: 3,
    elevation: 1,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  accordionContent: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  accordionText: {
    fontSize: 14,
    color: "black",
    fontWeight: "400",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 30,
    borderRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 5,
    width: "100%",
    paddingHorizontal: 10,
  },
  closeBtn: {
    width: "50%",
    borderWidth: 0.5,
    borderColor: "#B7B6B6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  closeText: {
    color: "black",
    fontWeight: "bold",
  },
  saveBtn: {
    borderRadius: 10,
    width: "50%",
    borderWidth: 0.5,
    borderColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1D3A76",
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
  },
});
