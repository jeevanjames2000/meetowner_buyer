import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
const { height } = Dimensions.get("window");
const dummyVideos = [
  {
    id: 1,
    title: "Property 1",
    thumbnail: "https://via.placeholder.com/400x700",
  },
  {
    id: 2,
    title: "Property 2",
    thumbnail: "https://via.placeholder.com/400x700",
  },
  {
    id: 3,
    title: "Property 3",
    thumbnail: "https://via.placeholder.com/400x700",
  },
];
export default function Shorts({ navigation }) {
  const [likedVideos, setLikedVideos] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [comments, setComments] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState({});
  const flatListRef = useRef(null);
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
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);
  const openProperty = (title) => {
    alert(`Opening ${title}`);
  };
  const handleMenuToggle = (id) => {
    setMenuVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const handleMenuAction = (action, item) => {
    alert(`${action} on ${item.title}`);
    setMenuVisible((prev) => ({
      ...prev,
      [item.id]: false,
    }));
  };
  const renderVideoItem = ({ item }) => (
    <View key={item.id} style={styles.videoContainer}>
      <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
      {}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => handleMenuToggle(item.id)}
      >
        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
      </TouchableOpacity>
      {menuVisible[item.id] && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={menuVisible[item.id]}
          onRequestClose={() => handleMenuToggle(item.id)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => handleMenuToggle(item.id)}
          />
          <View style={styles.menuOptions}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuAction("Show Property", item)}
            >
              <Text style={styles.menuText}>Show Property</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuAction("Share", item)}
            >
              <Text style={styles.menuText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuAction("Interest", item)}
            >
              <Text style={styles.menuText}>Interest</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <TouchableOpacity
          style={styles.openButton}
          onPress={() => openProperty(item.title)}
        >
          <Text style={styles.openButtonText}>Show Property</Text>
        </TouchableOpacity>
      </View>
      {}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons
            name={likedVideos[item.id] ? "heart" : "heart-outline"}
            size={28}
            color={likedVideos[item.id] ? "red" : "#fff"}
          />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCommentToggle(item.id)}
        >
          <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>
            {comments[item.id]?.length || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
      {}
      {comments[item.id]?.length > 0 && (
        <View style={styles.commentsSection}>
          {comments[item.id].map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Text style={styles.commentText}>{comment}</Text>
            </View>
          ))}
        </View>
      )}
      {}
      {showCommentBox[item.id] && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.commentBox}
        >
          <TextInput
            placeholder="Write a comment..."
            placeholderTextColor="#999"
            value={commentInputs[item.id] || ""}
            onChangeText={(text) => handleCommentChange(item.id, text)}
            style={styles.commentInput}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => handleCommentSubmit(item.id)}
          >
            <Text style={styles.submitText}>Post</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}
    </View>
  );
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          ref={flatListRef}
          data={dummyVideos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id.toString()}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          getItemLayout={(data, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoContainer: {
    height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  menuButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuOptions: {
    position: "absolute",
    top: 80,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 8,
  },
  menuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  menuText: {
    color: "#333",
    fontSize: 14,
  },
  propertyInfo: {
    position: "absolute",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    bottom: height * 0.18,
    left: 20,
  },
  propertyTitle: {
    color: "#fff",
    fontSize: 18,
    marginRight: 10,
    fontWeight: "bold",
  },
  openButton: {
    marginTop: 8,
    backgroundColor: "#007BFF",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  openButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  bottomActions: {
    position: "absolute",
    bottom: height * 0.1,
    left: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
    marginRight: 20,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  commentsSection: {
    position: "absolute",
    bottom: height * 0.15,
    left: 10,
    width: "85%",
    maxHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
  },
  commentItem: {
    padding: 6,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  commentText: {
    color: "#333",
    fontSize: 14,
  },
  commentBox: {
    position: "absolute",
    bottom: height * 0.05,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
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
