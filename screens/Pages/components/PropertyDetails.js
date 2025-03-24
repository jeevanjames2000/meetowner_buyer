import React, { useState } from "react";
import { StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Button, HStack, VStack, View, Text } from "native-base";
import { useEffect } from "react";
import axios from "axios";
export default function PropertyDetails() {
  const property = useSelector((state) => state.property.propertyDetails);
  console.log("property: ", property);
  const formatToIndianCurrency = (value) => {
    if (value >= 10000000) return (value / 10000000).toFixed(2) + " Cr";
    if (value >= 100000) return (value / 100000).toFixed(2) + " L";
    if (value >= 1000) return (value / 1000).toFixed(2) + " K";
    return value;
  };
  const [showFullText, setShowFullText] = useState(false);
  const isLongText = property?.description?.length > 200;
  const displayText = showFullText
    ? property.description
    : property.description?.substring(0, 200) + (isLongText ? "..." : "");
  const [location, setLocation] = useState(null);
  console.log("location: ", location);
  useEffect(() => {
    getCoordinatesFromAddress(property.google_address);
  }, [property?.google_address]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  console.log("region: ", region);
  const getCoordinatesFromAddress = async (address) => {
    try {
      console.log(`📡 Searching for address: ${address}`);
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: address,
            key: "AIzaSyBmei9lRUUfJI-kLIPNBoc2SxEkwhKHyvU",
          },
        }
      );
      console.log("🔍 API Response:", response.data);
      if (response?.data?.status === "OK" && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        console.log(`✅ Found coordinates: Lat: ${lat}, Lng: ${lng}`);
        const initialRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setLocation(initialRegion);
        setRegion(initialRegion);
      } else {
        console.warn("⚠️ No valid results found. Using fallback location.");
        handleFallbackLocation();
      }
    } catch (error) {
      console.error("❌ Error fetching coordinates:", error);
      handleFallbackLocation();
    }
  };
  const handleViewInMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location?.latitude},${location?.longitude}`;
      Linking.openURL(url).catch((err) =>
        console.error("An error occurred while opening the map:", err)
      );
    }
  };
  const handleZoomIn = () => {
    if (region) {
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitudeDelta: prevRegion.latitudeDelta / 2,
        longitudeDelta: prevRegion.longitudeDelta / 2,
      }));
    }
  };
  const handleZoomOut = () => {
    if (region) {
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitudeDelta: prevRegion.latitudeDelta * 2,
        longitudeDelta: prevRegion.longitudeDelta * 2,
      }));
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Description</Text>
        <Text style={styles.descriptionText}>{displayText}</Text>
        {isLongText && (
          <TouchableOpacity
            onPress={() => setShowFullText(!showFullText)}
            style={{
              justifyContent: "flex-end",
              alignItems: "flex-end",
              marginRight: 5,
            }}
          >
            <Text fontSize={14} color={"orange.500"} textAlign={"end"}>
              {showFullText ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <HStack
        flex={1}
        flexDirection="column"
        gap={5}
        h={100}
        space={2}
        mb={12}
        p={2}
      >
        <View flexDirection="row" justifyContent="space-between" mb={1}>
          <Text fontSize={18} bold color={"blue.700"}>
            {property.property_name}
          </Text>
          <Text fontSize={18} bold color={"blue.700"}>
            ₹ {formatToIndianCurrency(property.property_cost)}
          </Text>
        </View>
        <View flexDirection="row" justifyContent="space-between" mb={1}>
          <Text fontSize={12} color="gray.400">
            CONSTRUCTION PVT LTD...
          </Text>
          <Text fontSize={12} color="gray.400">
            All Inclusive Price
          </Text>
        </View>
        <View flexDirection="row" justifyContent="space-between" mb={4}>
          <Text fontSize="md" color="gray.400">
            {property?.google_address}
          </Text>
        </View>
        <View flexDirection="row" justifyContent="space-between" h={10} gap={2}>
          <Button bgColor="gray.800" borderRadius={30} w={"30%"}>
            Schedule Visit
          </Button>
          <Button bgColor="gray.500" borderRadius={30} w={"30%"}>
            Contact Seller
          </Button>
          <Button bgColor="red.400" borderRadius={30} w={"30%"}>
            Intrest
          </Button>
        </View>
      </HStack>
      <Image
        source={
          property.image
            ? { uri: `https://meetowner.in/uploads/${property.image}` }
            : { uri: `https://via.placeholder.com/160x130?text=No+Image` }
        }
        style={styles.propertyImage}
        resizeMode="cover"
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.card}>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Built-up Area</Text>
              <Text style={styles.overviewValue}>
                {property.length_area} {"x"} {property.width_area}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Property Type</Text>
              <Text style={styles.overviewValue}>{property.property_in}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Bedrooms</Text>
              <Text style={styles.overviewValue}>{property.bedrooms || 0}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Bathrooms</Text>
              <Text style={styles.overviewValue}>
                {property.bathrooms || 0}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Car Parking</Text>
              <Text style={styles.overviewValue}>
                {property.car_parking || 0}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Facing</Text>
              <Text style={styles.overviewValue}>{property.facing || 0}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Furnished</Text>
              <Text style={styles.overviewValue}>
                {property.furnished_status || "No"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Facilities</Text>
        <View style={styles.card}>
          <View style={styles.facilitiesGrid}>
            {property?.facilities ? (
              property.facilities.split(", ").map((facility, index) => (
                <Text key={index} style={styles.facilityItem}>
                  ✔ {facility.trim()}
                </Text>
              ))
            ) : (
              <View flex={1} justifyItems={"center"} alignItems={"center"}>
                <Text>No details available</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View>
        {region ? (
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
            showsScale={true}
            loadingEnabled={true}
          >
            <Marker
              coordinate={{
                latitude: location?.latitude,
                longitude: location?.longitude,
              }}
              title="New York"
              description="This is a description"
            />
          </MapView>
        ) : (
          <Text style={styles.loadingText}>Loading map...</Text>
        )}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handleZoomIn} style={styles.button}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomOut} style={styles.button}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        className="flex justify-center items-center bg-[#00609E] py-3 rounded-md mt-1 mx-2"
        onPress={handleViewInMaps}
      >
        <Text className="text-white text-[16px]">View in Maps</Text>
      </TouchableOpacity>
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Schedule Visit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="red" />
          <Text style={styles.actionButtonText}>Intrested</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={24} color="blue" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  propertyImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  overviewItem: {
    width: "48%",
    marginBottom: 12,
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  overviewValue: {
    fontSize: 16,
    color: "#333",
  },
  facilitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  facilityItem: {
    width: "50%",
    fontSize: 14,
    marginBottom: 8,
    color: "#333",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginTop: 10,
  },
  ctaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  ctaButton: {
    backgroundColor: "#1D3A76",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
});
