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
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import { addFavourite } from "../../../store/slices/favourites";
import { setPropertyDetails } from "../../../store/slices/propertyDetails";
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
            onPress={() => onFav(item)}
          >
            <Ionicons name="heart-outline" size={20} color="black" />
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
export default function Properties() {
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
  const fetchProperties = useCallback(
    async (reset = false) => {
      if (!reset && !hasMore) return;
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.meetowner.in/listings/getlatestproperties?limit=10&city_id=4&page=${
            reset ? 1 : page
          }`
        );
        const data = await response.json();
        if (data.propertiesData && data.propertiesData.length > 0) {
          setProperties((prev) =>
            reset ? data.propertiesData : [...prev, ...data.propertiesData]
          );
          setPage(reset ? 2 : page + 1);
          setHasMore(true);
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
    [page, hasMore]
  );
  useEffect(() => {
    fetchProperties();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing after 2 minutes...");
      onRefresh();
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
  const handleFavourites = useCallback((item) => {
    dispatch(addFavourite(item));
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
  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      setShowScrollToTop(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchProperties(true);
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
                console.log("Filter: Rent");
                onClose();
              }}
            >
              <Text fontSize="md">Best Dealss</Text>
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
                console.log("Filter: Sale");
                onClose();
              }}
            >
              <Text fontSize="md">Meetowner Exclusive</Text>
            </Pressable>
          </Actionsheet.Content>
        </Actionsheet>
        <FlatList
          ref={flatListRef}
          data={properties}
          keyExtractor={(item, index) => `${item.unique_property_id}-${index}`}
          renderItem={renderPropertyCard}
          onEndReached={() => {
            if (!loading) fetchProperties();
          }}
          onEndReachedThreshold={0.5}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          initialNumToRender={10}
          windowSize={windowSize}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          ListFooterComponent={
            loading && hasMore ? <Spinner size="lg" mt={5} /> : null
          }
        />
        {showScrollToTop && (
          <IconButton
            position="absolute"
            bottom={100}
            right={5}
            bg="white"
            borderRadius="full"
            shadow={3}
            icon={<Ionicons name="arrow-up" size={24} color="#1D3A76" />}
            onPress={scrollToTop}
          />
        )}
      </View>
    </ScrollView>
  );
}
