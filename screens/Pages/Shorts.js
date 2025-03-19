import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
const dummyVideos = [
  {
    id: 1,
    title: "Short 1",
    thumbnail: "https://via.placeholder.com/400x700",
  },
  {
    id: 2,
    title: "Short 2",
    thumbnail: "https://via.placeholder.com/400x700",
  },
  {
    id: 3,
    title: "Short 3",
    thumbnail: "https://via.placeholder.com/400x700",
  },
];
export default function Shorts() {
  const [likedVideos, setLikedVideos] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [comments, setComments] = useState({});
  const handleLike = (id) => {
    setLikedVideos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const handleCommentToggle = (id) => {
    setShowCommentBox((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const handleCommentChange = (id, text) => {
    setCommentInputs((prev) => ({
      ...prev,
      [id]: text,
    }));
  };
  const handleCommentSubmit = (id) => {
    if (!commentInputs[id]) return;
    setComments((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), commentInputs[id]],
    }));
    setCommentInputs((prev) => ({
      ...prev,
      [id]: "",
    }));
    setShowCommentBox((prev) => ({
      ...prev,
      [id]: false,
    }));
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {dummyVideos.map((video) => (
            <View key={video.id} style={styles.videoContainer}>
              <Image
                source={{ uri: video.thumbnail }}
                style={styles.videoThumbnail}
              />
              <View style={styles.videoActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(video.id)}
                >
                  <Ionicons
                    name={likedVideos[video.id] ? "heart" : "heart-outline"}
                    size={24}
                    color={likedVideos[video.id] ? "red" : "#fff"}
                  />
                  <Text style={styles.actionText}>Like</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCommentToggle(video.id)}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#fff" />
                  <Text style={styles.actionText}>
                    {comments[video.id]?.length || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="share-social-outline"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>

              {comments[video.id]?.length > 0 && (
                <View style={styles.commentsSection}>
                  {comments[video.id].map((comment, index) => (
                    <View key={index} style={styles.commentItem}>
                      <Text style={styles.commentText}>{comment}</Text>
                    </View>
                  ))}
                </View>
              )}

              {showCommentBox[video.id] && (
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                  style={styles.commentBox}
                >
                  <TextInput
                    placeholder="Write a comment..."
                    placeholderTextColor="#999"
                    value={commentInputs[video.id] || ""}
                    onChangeText={(text) => handleCommentChange(video.id, text)}
                    style={styles.commentInput}
                  />
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => handleCommentSubmit(video.id)}
                  >
                    <Text style={styles.submitText}>Post</Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    paddingVertical: 12,
  },
  videoContainer: {
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    width: "95%",
    alignSelf: "center",
    overflow: "hidden",
  },
  videoThumbnail: {
    width: "100%",
    height: 600,
  },
  videoActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "#333",
  },
  actionButton: {
    alignItems: "center",
    padding: 5,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  commentsSection: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f5f5f5",
  },
  commentItem: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  commentText: {
    color: "#333",
    fontSize: 14,
  },
  commentBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    width: "95%",
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignSelf: "center",
    marginBottom: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    color: "#333",
  },
  submitButton: {
    marginLeft: 10,
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  submitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
