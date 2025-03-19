import React, { useCallback } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import {
  FlatList,
  HStack,
  Image,
  Pressable,
  Text,
  View,
  Icon,
  useDisclose,
  Actionsheet,
  VStack,
  StatusBar,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { removeFavourite } from "../../store/slices/favourites";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function Wishlist() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const favourites = useSelector((state) => state.favourites.favourites);
  console.log("favourites: ", favourites);
  const { isOpen, onOpen, onClose } = useDisclose();

  const removeItem = useCallback(
    (id) => {
      dispatch(removeFavourite(id));
    },
    [dispatch]
  );
  const formatToIndianCurrency = (value) => {
    if (value >= 10000000) return (value / 10000000).toFixed(2) + " Cr";
    if (value >= 100000) return (value / 100000).toFixed(2) + " L";
    if (value >= 1000) return (value / 1000).toFixed(2) + " K";
    return value.toString();
  };
  const renderPropertyCard = ({ item }) => (
    <Pressable
      bg="white"
      rounded="lg"
      shadow={3}
      overflow="hidden"
      mb={3}
      borderWidth={1}
      borderColor="gray.200"
    >
      <View position="relative">
        <Image
          source={{
            uri: `https://api.meetowner.in/uploads/${
              item.image || "placeholder.jpg"
            }`,
            cache: "force-cache",
          }}
          alt="Property Image"
          w="100%"
          h={180}
          resizeMode="cover"
        />
        <View
          position="absolute"
          top={2}
          left={2}
          bg="white:alpha.80"
          px={3}
          py={1}
          rounded="md"
          opacity={0.75}
        >
          <Text color="black" fontSize="xs" bold>
            {item.property_for}
          </Text>
        </View>
        <HStack position="absolute" top={2} right={2} space={2}>
          <Pressable
            p={2}
            bg="white"
            rounded="full"
            onPress={() => removeItem(item.id)}
          >
            <Ionicons name="heart" size={20} color="red" />
          </Pressable>
          <Pressable
            p={2}
            bg="white"
            rounded="full"
            onPress={() => console.log("Share pressed!")}
          >
            <Ionicons name="share-social-outline" size={20} color="black" />
          </Pressable>
        </HStack>
        <View
          position="absolute"
          bottom={2}
          left={2}
          right={2}
          flexDirection="row"
          justifyContent="left"
          gap={3}
        >
          {item.bedrooms && (
            <HStack
              bg="white:alpha.80"
              px={2}
              py={1}
              rounded="lg"
              alignItems="center"
            >
              <Text color="black" fontSize="xs">
                {item.bedrooms} BHK
              </Text>
            </HStack>
          )}
          {item.bathrooms && (
            <HStack
              bg="white:alpha.80"
              px={2}
              py={1}
              rounded="lg"
              alignItems="center"
            >
              <Text color="black" fontSize="xs">
                {item.bathrooms} Bath
              </Text>
            </HStack>
          )}
          {item.car_parking && (
            <HStack
              bg="white:alpha.80"
              px={2}
              py={1}
              rounded="lg"
              alignItems="center"
            >
              <Text color="black" fontSize="xs">
                {item.car_parking} Parking
              </Text>
            </HStack>
          )}
        </View>
      </View>
      <HStack justifyContent="space-between" px={3} py={1}>
        <View flex={1}>
          <Text fontSize="sm" bold color="gray.500" numberOfLines={1}>
            {item.property_name}
          </Text>
        </View>
        <View>
          <Text fontSize="sm" bold color="gray.800">
            ₹ {formatToIndianCurrency(item.property_cost)}
          </Text>
        </View>
      </HStack>
      <HStack justifyContent="space-between" px={3} py={1}>
        <View flex={1}>
          <Text fontSize="xs" bold color="gray.500" numberOfLines={1}>
            {item.google_address}
          </Text>
        </View>
      </HStack>
      <Pressable
        bg="#1D3A76"
        py={2}
        alignItems="center"
        borderRadius={10}
        width="95%"
        alignSelf="center"
        my={1}
        onPress={() => console.log("Navigate to details")}
      >
        <Text color="white" bold>
          Enquire Now
        </Text>
      </Pressable>
    </Pressable>
  );

  const handleRouteBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <HStack
            px={5}
            py={3}
            space={5}
            justifyContent={"flex-end"}
            alignItems={"center"}
          >
            <TouchableOpacity onPress={onOpen}>
              <View
                flexDirection={"row"}
                borderWidth={0.5}
                borderRadius={30}
                bg={"#1D3A76"}
                px={3}
                gap={2}
                py={1}
              >
                <Text fontSize={15} fontWeight={"bold"} color={"#fff"}>
                  Filter
                </Text>
                <Ionicons name="filter-outline" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </HStack>

          {favourites.length === 0 ? (
            <View style={styles.noFavouritesContainer}>
              <Image
                source={require("../../assets/add_15869358.png")}
                alt="WhatsApp"
                resizeMethod="contain"
                style={styles.logo}
              />
              <Text>No Favourites Found</Text>
            </View>
          ) : (
            <FlatList
              data={favourites}
              renderItem={renderPropertyCard}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.flatListContainer}
            />
          )}
          <Actionsheet isOpen={isOpen} onClose={onClose}>
            <Actionsheet.Content>
              <Text fontSize="lg" fontWeight="bold" mb={3}>
                Filter Properties
              </Text>
              <Pressable
                w="100%"
                py={3}
                px={4}
                onPress={() => {
                  console.log("Filter: Rent");
                  onClose();
                }}
              >
                <Text fontSize="md">Scheduled Visiting</Text>
              </Pressable>
              <Pressable
                w="100%"
                py={3}
                px={4}
                onPress={() => {
                  console.log("Filter: Sale");
                  onClose();
                }}
              >
                <Text fontSize="md">Intrested Properties</Text>
              </Pressable>
              <Pressable w="100%" py={3} px={4} onPress={onClose}>
                <Text fontSize="md">Contact Sellers</Text>
              </Pressable>
            </Actionsheet.Content>
          </Actionsheet>
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
  container: {
    flex: 1,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 18,
  },
  flatListContainer: {
    paddingHorizontal: 15,
  },
  noFavouritesContainer: {
    flex: 1,
    bottom: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
