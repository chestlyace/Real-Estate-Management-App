import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PropertyDetailsScreen = ({ route, navigation }) => {
    const { property } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: property.image_url }} style={styles.image} />

                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{property.name}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={16} color="#A0A0A0" />
                                <Text style={styles.location}>{property.location}</Text>
                            </View>
                        </View>
                        <View style={styles.priceTag}>
                            <Text style={styles.priceText}>{parseInt(property.price).toLocaleString()} FCFA</Text>
                            <Text style={styles.periodText}>{property.listing_type === 'rent' ? '/mo' : ''}</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="bed-outline" size={24} color="#4A90E2" />
                            <Text style={styles.statLabel}>{property.bedrooms || 0} Beds</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="water-outline" size={24} color="#4A90E2" />
                            <Text style={styles.statLabel}>{property.bathrooms || 0} Baths</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="expand-outline" size={24} color="#4A90E2" />
                            <Text style={styles.statLabel}>{property.size_sqft ? `${property.size_sqft} sqft` : 'N/A'}</Text>
                        </View>
                    </View>

                    {property.amenities && (
                        <>
                            <Text style={styles.sectionTitle}>Amenities</Text>
                            <View style={styles.amenitiesContainer}>
                                {property.amenities.split(',').map((item, index) => (
                                    <View key={index} style={styles.amenityChip}>
                                        <Ionicons name="checkmark-circle-outline" size={16} color="#4A90E2" />
                                        <Text style={styles.amenityText}>{item.trim()}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>
                        {property.description}
                    </Text>

                    <Text style={styles.sectionTitle}>Location</Text>
                    <View style={styles.mapPlaceholder}>
                        <Text style={styles.mapText}>Map View Placeholder</Text>
                    </View>

                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.ownerInfo}>
                    <View style={styles.ownerAvatar}>
                        <Ionicons name="person" size={20} color="#FFF" />
                    </View>
                    <View>
                        <Text style={styles.ownerName}>Owner/Agent</Text>
                        <Text style={styles.ownerRole}>Real Estate Agent</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: 300,
        resizeMode: 'cover',
    },
    contentContainer: {
        padding: 20,
        backgroundColor: '#121212',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        minHeight: 500,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    location: {
        color: '#A0A0A0',
        fontSize: 14,
    },
    priceTag: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    periodText: {
        color: '#A0A0A0',
        fontSize: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 16,
    },
    statItem: {
        alignItems: 'center',
        gap: 8
    },
    statLabel: {
        color: '#A0A0A0',
        fontSize: 12,
        textTransform: 'capitalize'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
        marginTop: 12,
    },
    description: {
        color: '#A0A0A0',
        fontSize: 14,
        lineHeight: 22,
    },
    mapPlaceholder: {
        height: 150,
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 80,
    },
    mapText: {
        color: '#666',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E1E',
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    ownerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    ownerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ownerName: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    ownerRole: {
        color: '#A0A0A0',
        fontSize: 12,
    },
    bookButton: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    amenityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        gap: 6,
    },
    amenityText: {
        color: '#A0A0A0',
        fontSize: 12,
    }
});

export default PropertyDetailsScreen;
