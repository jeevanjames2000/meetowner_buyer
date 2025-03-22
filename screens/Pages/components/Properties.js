import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import {
  Alert,
  Share,
  RefreshControl,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  FlatList,
  HStack,
  Image,
  Pressable,
  Text,
  View,
  Spinner,
  IconButton,
  Actionsheet,
  useDisclose,
  Button,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import { addFavourite } from "../../../store/slices/favourites";
import { setPropertyDetails } from "../../../store/slices/propertyDetails";
import config from "../../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
const PropertyCard = memo(({ item, onPress, onFav, onShare, onNavigate }) => {
  return (
    <Pressable
      bg="white"
      rounded="lg"
      shadow={3}
      overflow="hidden"
      mb={3}
      borderWidth={1}
      borderColor="gray.200"
      onPress={() => onNavigate(item)}
    >
      <View position="relative">
        <Image
          source={{
            uri: `https://api.meetowner.in/uploads/${
              item.image || "https://via.placeholder.com/160x130?text=No+Image"
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
            onPress={() => onFav(item, item.isLiked)}
          >
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={20}
              color={item.isLiked ? "red" : "black"}
            />
          </Pressable>
          <Pressable
            p={2}
            bg="white"
            rounded="full"
            onPress={() => onShare(item)}
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
        mb={3}
        onPress={() => onNavigate(item)}
      >
        <Text color="white" bold>
          Enquire Now
        </Text>
      </Pressable>
    </Pressable>
  );
});
const formatToIndianCurrency = (value) => {
  if (value >= 10000000) return (value / 10000000).toFixed(2) + " Cr";
  if (value >= 100000) return (value / 100000).toFixed(2) + " L";
  if (value >= 1000) return (value / 1000).toFixed(2) + " K";
  return value.toString();
};
export default function Properties({ activeTab }) {
  const dispatch = useDispatch();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const { isOpen, onOpen, onClose } = useDisclose();
  const [userInfo, setUserInfo] = useState("");
  console.log("userInfo: ", userInfo);
  const fetchProperties = useCallback(
    async (reset = false) => {
      setLoading(true);
      if (reset) {
        const cachedData = await AsyncStorage.getItem("cached_properties");
        if (cachedData) {
          setProperties(JSON.parse(cachedData));
          setLoading(false);
          setHasMore(true);
          return;
        }
      }
      const city = await AsyncStorage.getItem("city_id");
      const cityId = JSON.parse(city);
      try {
        const response = await fetch(
          `https://api.meetowner.in/listings/getlatestproperties?limit=${
            reset ? 30 : 10
          }&type_of_property=${activeTab}&city_id=6&page=${reset ? 1 : page}`
        );
        const data = await response.json();
        if (data.propertiesData && data.propertiesData.length > 0) {
          const newProperties = reset
            ? data.propertiesData
            : [...properties, ...data.propertiesData];
          setProperties(newProperties);
          setPage(reset ? 2 : page + 1);
          setHasMore(data.propertiesData.length === (reset ? 30 : 10));
          if (reset) {
            await AsyncStorage.setItem(
              "cached_properties",
              JSON.stringify(data.propertiesData.slice(0, 10))
            );
          }
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.log("Error fetching properties:", error.message);
      } finally {
        setLoading(false);
        if (reset) setRefreshing(false);
      }
    },
    [activeTab, page, properties]
  );

  const handleInterestAPI = async (unique_property_id, action) => {
    try {
      const response = await fetch(
        `${config.mainapi_url}/favourites_exe?user_id=${userInfo?.user_id}&unique_property_id=${unique_property_id}&intrst=1&action=0`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength) === 0) {
        return;
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };
  useEffect(() => {
    const getData = async () => {
      const data = await AsyncStorage.getItem("userdetails");
      const parsedUserDetails = JSON.parse(data);
      setUserInfo(parsedUserDetails);
    };
    getData();
    fetchProperties(true);
  }, [activeTab]);
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing after 2 minutes...");
      fetchProperties(true);
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  const shareProperty = async (property) => {
    try {
      await Share.share({
        message: `https://api.meetowner.in/property?unique_property_id=${property.unique_property_id}`,
      });
    } catch (error) {
      console.log("error", error.message);
    }
  };
  const handleFavourites = useCallback(async (item, isLiked) => {
    try {
      const action = isLiked ? 0 : 1;
      console.log("item, isLiked: ", item.unique_property_id, action);
      handleInterestAPI(item.unique_property_id, action);
    } catch (error) {
      console.error("Error updating favourites:", error.message);
    }
  }, []);
  const handleShare = useCallback((item) => {
    shareProperty(item);
  }, []);
  const handleNavigate = useCallback(
    (item) => {
      dispatch(setPropertyDetails(item));
      navigation.navigate("PropertyDetails");
    },
    [navigation]
  );
  const renderPropertyCard = useCallback(
    ({ item }) => (
      <PropertyCard
        item={item}
        onPress={() => handleNavigate(item)}
        onFav={() => handleFavourites(item)}
        onShare={() => handleShare(item)}
        onNavigate={() => handleNavigate(item)}
      />
    ),
    [handleFavourites, handleShare, handleNavigate]
  );
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 100 && !showScrollToTop) {
      setShowScrollToTop(true);
    } else if (offsetY <= 0 && showScrollToTop) {
      setShowScrollToTop(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties(true);
  };
  const windowHeight = Dimensions.get("window").height;
  const itemHeight = 180 + 60 + 40;
  const windowSize = Math.ceil(windowHeight / itemHeight) * 2;
  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ flex: 1 }}>
        <HStack py={5} mx={2} justifyContent={"space-between"}>
          <Text fontSize={20} fontWeight={"bold"}>
            Latest Properties
          </Text>
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
                onClose();
              }}
            >
              <Text fontSize="md">Best Deals</Text>
            </Pressable>
            <Pressable
              w="100%"
              py={3}
              px={4}
              onPress={() => {
                onClose();
              }}
            >
              <Text fontSize="md">Latest Properties</Text>
            </Pressable>
            <Pressable w="100%" py={3} px={4} onPress={onClose}>
              <Text fontSize="md">High Demand Projects</Text>
            </Pressable>
            <Pressable
              w="100%"
              py={3}
              px={4}
              onPress={() => {
                onClose();
              }}
            >
              <Text fontSize="md">Meetowner Exclusive</Text>
            </Pressable>
          </Actionsheet.Content>
        </Actionsheet>
        <View style={{ flex: 1, paddingBottom: 50 }}>
          <FlatList
            ref={flatListRef}
            data={properties}
            keyExtractor={(item, index) =>
              `${item.unique_property_id}-${index}`
            }
            renderItem={renderPropertyCard}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            initialNumToRender={10}
            windowSize={10}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListFooterComponent={() =>
              hasMore && (
                <View
                  style={{
                    marginBottom: 40,
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Button
                    borderRadius={30}
                    width={"30%"}
                    py={1}
                    bgColor={"#FBAF01"}
                    onPress={() => fetchProperties(false)}
                    isLoading={loading}
                    disabled={loading || !hasMore}
                  >
                    <Text color={"#000"}>
                      {loading ? "Loading..." : "Load More"}
                    </Text>
                  </Button>
                </View>
              )
            }
            ListEmptyComponent={() =>
              !loading && <Text>No properties found for {activeTab}.</Text>
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}
