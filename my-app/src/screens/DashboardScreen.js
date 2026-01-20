import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Image,
    Dimensions,
    RefreshControl,
    ActivityIndicator,

    Platform,
    Modal,
    Slider
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { propertyService } from '../services/property.service';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [properties, setProperties] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
    const [activeCity, setActiveCity] = useState(null);

    // Data Loading
    // Data Loading
    const loadHomeData = useCallback(async (query = '', category = 'All', city = null, min = 0, max = 10000000) => {
        try {
            setLoading(true);
            const filters = {};
            if (query) filters.search = query;
            if (min > 0) filters.minPrice = min;
            if (max < 10000000) filters.maxPrice = max;
            if (city) filters.city = city;

            if (category !== 'All') {
                const typeMap = {
                    'House': 'house',
                    'Apartment': 'apartment',
                    'Villa': 'house',
                    'Land': 'land'
                };
                filters.propertyType = typeMap[category] || category.toLowerCase();
            }

            const data = await propertyService.getAllProperties(filters);
            setProperties(data);
            // Update active city state if provided
            if (city) setActiveCity(city);

            if (!query && category === 'All' && !city && featured.length === 0) {
                setFeatured(data.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to load home data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [featured.length]);



    // Debounce Search Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Main Data Loading Effect
    useEffect(() => {
        loadHomeData(debouncedSearchQuery, selectedCategory, activeCity);
    }, [loadHomeData, debouncedSearchQuery, selectedCategory, activeCity]);

    // Actually, for better UX let's debounce or just search on submit. 
    // Let's rely on onSubmitEditing for search and useEffect for Category.

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadHomeData(debouncedSearchQuery, selectedCategory, activeCity);
    }, [loadHomeData, debouncedSearchQuery, selectedCategory, activeCity]);

    const handleSearch = () => {
        loadHomeData(searchQuery, selectedCategory, activeCity);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        // Effect will trigger loadHomeData
    };

    const applyFilters = () => {
        setModalVisible(false);
        loadHomeData(searchQuery, selectedCategory, activeCity, priceRange.min, priceRange.max);
    };

    const categories = [
        { id: 'all', title: 'All', icon: 'grid-outline' },
        { id: 'house', title: 'House', icon: 'home-outline' },
        { id: 'apartment', title: 'Apartment', icon: 'business-outline' },
        { id: 'villa', title: 'Villa', icon: 'star-outline' }, // Mapped to house or special type
        { id: 'land', title: 'Land', icon: 'leaf-outline' },
    ];

    const CAMEROON_CITIES = [
        { id: 1, name: 'Yaoundé', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500' },
        { id: 2, name: 'Douala', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500' },
        { id: 3, name: 'Bamenda', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500' },
        { id: 4, name: 'Limbe', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500' },
        { id: 5, name: 'Buea', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500' },
    ];

    // Removed client-side filtering execution
    // const filterProperties = () => { ... } 
    // const displayProperties = filterProperties();
    const displayProperties = properties;



    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            {/* Main Scroll Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A90E2" />
                }
            >

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.locationLabel}>Current Location</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={18} color="#4A90E2" />
                            <Text style={styles.locationText}>Yaoundé, Cameroon</Text>
                            <Ionicons name="chevron-down" size={14} color="#A0A0A0" />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>

                {/* Enhanced Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBarWrapper}>
                        <View style={styles.searchRow}>
                            <TouchableOpacity onPress={() => handleSearch()}>
                                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search location, property..."
                                placeholderTextColor="#666"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={handleSearch}
                                returnKeyType="search"
                            />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={18} color="#666" style={styles.searchIcon} />
                            <Text style={styles.datePlaceholder}>Any Date</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
                        <Ionicons name="options-outline" size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Filter Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Filters</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.filterLabel}>Price Range (FCFA)</Text>
                            <View style={styles.priceInputs}>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="Min"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                    onChangeText={(val) => setPriceRange(prev => ({ ...prev, min: parseInt(val) || 0 }))}
                                />
                                <Text style={{ color: '#666' }}>-</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="Max"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                    onChangeText={(val) => setPriceRange(prev => ({ ...prev, max: parseInt(val) || 10000000 }))}
                                />
                            </View>

                            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Recent Searches / Activity */}
                <View style={styles.recentContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity style={styles.recentChip}>
                            <Ionicons name="time-outline" size={14} color="#A0A0A0" />
                            <Text style={styles.recentText}>2 Bedroom Douala</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.recentChip}>
                            <Ionicons name="time-outline" size={14} color="#A0A0A0" />
                            <Text style={styles.recentText}>Villa Yaoundé</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Promotional Banner */}
                <View style={styles.promoBanner}>
                    <View style={styles.promoContent}>
                        <Text style={styles.promoTitle}>Summer Deal</Text>
                        <Text style={styles.promoText}>Get 10% off on your first rental!</Text>
                    </View>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500' }}
                        style={styles.promoImage}
                    />
                </View>


                {/* Featured Properties */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Properties</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#4A90E2" style={{ marginVertical: 20 }} />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredContainer}>
                        {featured.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.featuredCard} onPress={() => navigation.navigate('PropertyDetails', { property: item })}>
                                <Image source={{ uri: item.image_url }} style={styles.featuredImage} />
                                <View style={styles.featuredOverlay}>
                                    <View style={styles.featuredPriceTag}>
                                        <Text style={styles.featuredPriceText}>{parseInt(item.price).toLocaleString()} FCFA</Text>
                                    </View>
                                    <Text style={styles.featuredTitle}>{item.name}</Text>
                                    <Text style={styles.featuredLocation}>{item.city}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}


                {/* Browse by City */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Explore Categories</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryCard,
                                selectedCategory === category.title && styles.categorySelected
                            ]}
                            onPress={() => handleCategorySelect(category.title)}
                        >
                            <View style={[
                                styles.categoryIconContainer,
                                selectedCategory === category.title ? styles.iconContainerSelected : styles.iconContainerUnselected
                            ]}>
                                <Ionicons name={category.icon} size={24} color={selectedCategory === category.title ? "#FFFFFF" : "#FFFFFF"} />
                            </View>
                            <Text style={[
                                styles.categoryTitle,
                                selectedCategory === category.title ? styles.textSelected : styles.textUnselected
                            ]}>
                                {category.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Explore by City Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Explore by City</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.citiesContainer}>
                    {CAMEROON_CITIES.map((city) => (
                        <TouchableOpacity key={city.id} style={styles.cityCard} onPress={() => loadHomeData(searchQuery, selectedCategory, city.name)}>
                            <Image source={{ uri: city.image }} style={styles.cityImage} />
                            <View style={styles.cityOverlay}>
                                <Text style={styles.cityName}>{city.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>


                {/* Recommended / Filtered Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recommended for you</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.nearbyContainer}>
                    {displayProperties.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.nearbyCard} onPress={() => navigation.navigate('PropertyDetails', { property: item })}>
                            <Image source={{ uri: item.image_url }} style={styles.nearbyImage} />
                            <View style={styles.nearbyContent}>
                                <View style={styles.nearbyTag}>
                                    <Text style={styles.typeText}>{item.property_type}</Text>
                                </View>
                                <Text style={styles.nearbyTitle}>{item.name}</Text>
                                <View style={styles.locationRowCard}>
                                    <Ionicons name="location-outline" size={12} color="#A0A0A0" style={{ marginRight: 4 }} />
                                    <Text style={styles.cardLocation}>{item.location}</Text>
                                </View>
                                <Text style={styles.priceText}>
                                    {parseInt(item.price).toLocaleString()} <Text style={styles.perMonth}>FCFA{item.listing_type === 'rent' ? '/mo' : ''}</Text>
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    {displayProperties.length === 0 && (
                        <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>No properties found in this category.</Text>
                    )}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    locationLabel: {
        color: '#A0A0A0',
        fontSize: 12,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    locationText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B30',
        borderWidth: 1,
        borderColor: '#1E1E1E',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12
    },
    searchBarWrapper: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        padding: 12,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        padding: 0,
    },
    datePlaceholder: {
        color: '#A0A0A0',
        fontSize: 14,
    },
    filterButton: {
        width: 50,
        height: 50,
        backgroundColor: '#4A90E2',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start'
    },
    recentContainer: {
        marginBottom: 20,
    },
    recentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#333',
        gap: 6
    },
    recentText: {
        color: '#A0A0A0',
        fontSize: 12,
    },
    promoBanner: {
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
    },
    promoContent: {
        flex: 1,
        paddingRight: 10,
    },
    promoTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    promoText: {
        color: '#A0A0A0',
        fontSize: 12,
    },
    promoImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    seeAllText: {
        color: '#4A90E2',
        fontSize: 14,
    },
    featuredContainer: {
        marginBottom: 24,
    },
    featuredCard: {
        width: 250,
        height: 180,
        marginRight: 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1E1E1E',
    },
    featuredImage: {
        width: '100%',
        height: '100%',
    },
    featuredOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    featuredTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    featuredLocation: {
        color: '#DDD',
        fontSize: 12,
    },
    featuredPriceTag: {
        position: 'absolute',
        top: -120,
        right: 12,
        backgroundColor: '#4A90E2',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    featuredPriceText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    categoriesContainer: {
        marginBottom: 24,
    },
    categoryCard: {
        alignItems: 'center',
        marginRight: 20,
    },
    categoryIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainerSelected: {
        backgroundColor: '#4A90E2',
    },
    iconContainerUnselected: {
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: '#333',
    },
    categoryTitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    textSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    textUnselected: {
        color: '#A0A0A0',
    },
    citiesContainer: {
        marginBottom: 24,
    },
    cityCard: {
        width: 120,
        height: 150,
        borderRadius: 16,
        marginRight: 12,
        overflow: 'hidden',
        backgroundColor: '#1E1E1E',
    },
    cityImage: {
        width: '100%',
        height: '100%',
    },
    cityOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
    },
    cityName: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    nearbyContainer: {
        marginBottom: 20,
    },
    nearbyCard: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    nearbyImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 16,
    },
    nearbyContent: {
        flex: 1,
        justifyContent: 'center',
    },
    nearbyTag: {
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    nearbyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    locationRowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardLocation: {
        fontSize: 12,
        color: '#A0A0A0',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    perMonth: {
        fontSize: 12,
        color: '#A0A0A0',
        fontWeight: 'normal',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E1E',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    navItem: {
        alignItems: 'center',
    },
    navLabel: {
        fontSize: 10,
        color: '#A0A0A0',
    },
    navSelected: {
        color: '#4A90E2',
    },
    typeText: {
        color: '#4A90E2',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'capitalize'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: 300,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    filterLabel: {
        color: '#A0A0A0',
        marginBottom: 10,
    },
    priceInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    priceInput: {
        backgroundColor: '#121212',
        width: '45%',
        padding: 12,
        borderRadius: 10,
        color: '#FFF',
        borderWidth: 1,
        borderColor: '#333'
    },
    applyButton: {
        backgroundColor: '#4A90E2',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default DashboardScreen;
