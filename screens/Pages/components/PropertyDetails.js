import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { HStack } from "native-base";
export default function PropertyDetails() {
  const property = useSelector((state) => state.property.propertyDetails);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <HStack>
        <Text>{property.property_name}</Text>
      </HStack>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Description</Text>
        <Text style={styles.descriptionText}>{property.description}</Text>
      </View>
      <Image
        source={{ uri: `https://meetowner.in/uploads/${property.image}` }}
        style={styles.propertyImage}
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.card}>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Built-up Area</Text>
              <Text style={styles.overviewValue}>
                {property.builtup_area} {property.area_units}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Property Type</Text>
              <Text style={styles.overviewValue}>{property.property_in}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Bedrooms</Text>
              <Text style={styles.overviewValue}>{property.bedrooms}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Bathrooms</Text>
              <Text style={styles.overviewValue}>{property.bathrooms}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Car Parking</Text>
              <Text style={styles.overviewValue}>{property.car_parking}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Facing</Text>
              <Text style={styles.overviewValue}>{property.facing}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Furnished</Text>
              <Text style={styles.overviewValue}>
                {property.furnished_status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Facilities</Text>
        <View style={styles.card}>
          <View style={styles.facilitiesGrid}>
            {[
              "✔ Lift",
              "✔ CCTV",
              "✔ Gym",
              "✔ Garden",
              "✔ Club House",
              "✔ Sports",
              "✔ Swimming Pool",
              "✔ Intercom",
              "✔ Power Backup",
              "✔ Gated Community",
              "✔ Water Supply",
              "✔ Community Hall",
              "✔ Pet Friendly",
              "✔ Security",
            ].map((facility, index) => (
              <Text key={index} style={styles.facilityItem}>
                {facility}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 17.385044,
            longitude: 78.486671,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{ latitude: 17.385044, longitude: 78.486671 }}
            title={property.property_name}
            description={property.google_address}
          />
        </MapView>
      </View>

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
    color: "#666",
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  facilitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  facilityItem: {
    width: "48%",
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
