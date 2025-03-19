import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const [profileImage, setProfileImage] = useState(
    "https://via.placeholder.com/150" // Default image URL
  );

  const userName = "Jeevan Sekhar Tamada";
  const memberSince = "March 16, 2025";

  // Handle image picker
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
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing feature coming soon!");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "You have been logged out successfully!");
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <TouchableOpacity
            style={styles.editIcon}
            onPress={handleEditProfileImage}
          >
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.memberSince}>Member since {memberSince}</Text>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity
        style={styles.editProfileBtn}
        onPress={handleEditProfile}
      >
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    paddingTop: 50,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
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
    bottom: 5,
    right: 5,
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
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "90%",
    marginTop: 20,
    alignItems: "center",
  },
  editProfileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "90%",
    marginTop: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
