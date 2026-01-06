import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState('House');

    const categories = [
        { id: 1, title: 'House', icon: 'home-outline' },
        { id: 2, title: 'Villa', icon: 'business-outline' }, // closest for Villa
        { id: 3, title: 'Apartment', icon: 'business' },
        { id: 4, title: 'Bungalow', icon: 'home' },
    ];

    const recommended = [
        {
            id: 1,
            title: 'Wisdom City Apartments',
            type: 'Apartment',
            price: '550,000 FCFA',
            location: 'Yaounde',
            rating: 4.5,
            image: null, // Placeholder
        },
        {
            id: 2,
            title: 'Oakleaf Cottage',
            type: 'Home',
            price: '2,000,000 FCFA',
            location: 'Douala ',
            rating: 4.8,
            image: null, // Placeholder
        },
    ];

    const nearby = [
        {
            id: 1,
            title: 'BlissView Villa',
            type: 'Villa',
            location: 'New York, USA',
            rating: 4.9,
            image: null,
        },
        {
            id: 2,
            title: 'Skyline Lofts',
            type: 'Apartment',
            location: 'Manhattan, NY',
            rating: 4.7,
            image: null,
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Main Scroll Content */}
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.locationLabel}>Location</Text>
                        <View style={styles.locationRow}>
                            <Text style={styles.locationText}>Yaounde, Cameroon</Text>
                            <Ionicons name="chevron-down" size={12} color="#FFFFFF" />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={16} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor="#666"
                        />
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="options-outline" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryCard,
                                selectedCategory === category.title && styles.categorySelected
                            ]}
                            onPress={() => setSelectedCategory(category.title)}
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

                {/* Recommended Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recommended Property</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.recommendedContainer}
                >
                    {recommended.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.recommendedCard}>
                            <View style={styles.imagePlaceholder}>
                                <TouchableOpacity style={styles.favoriteButton}>
                                    <Ionicons name="heart-outline" size={16} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cardContent}>
                                <View style={styles.typeRow}>
                                    <View style={styles.typeTag}>
                                        <Text style={styles.typeText}>{item.type}</Text>
                                    </View>
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={10} color="#FFD700" style={{ marginRight: 4 }} />
                                        <Text style={styles.ratingText}>{item.rating}</Text>
                                    </View>
                                </View>
                                <Text style={styles.propertyTitle}>{item.title}</Text>
                                <View style={styles.locationRowCard}>
                                    <Ionicons name="location-outline" size={12} color="#A0A0A0" style={{ marginRight: 4 }} />
                                    <Text style={styles.cardLocation}>{item.location}</Text>
                                </View>
                                <Text style={styles.priceText}>
                                    {item.price}<Text style={styles.perMonth}>/month</Text>
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Nearby Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Nearby Property</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.nearbyContainer}>
                    {nearby.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.nearbyCard}>
                            <View style={styles.nearbyImagePlaceholder} />
                            <View style={styles.nearbyContent}>
                                <View style={styles.nearbyTag}>
                                    <Text style={styles.typeText}>{item.type}</Text>
                                </View>
                                <Text style={styles.nearbyTitle}>{item.title}</Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={10} color="#FFD700" style={{ marginRight: 4 }} />
                                    <Text style={styles.ratingText}>{item.rating}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Spacer for Bottom Nav */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Navigation (Custom) */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color="#4A90E2" style={{ marginBottom: 4 }} />
                    <Text style={[styles.navLabel, styles.navSelected]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="search-outline" size={24} color="#A0A0A0" style={{ marginBottom: 4 }} />
                    <Text style={styles.navLabel}>Explore</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="heart-outline" size={24} color="#A0A0A0" style={{ marginBottom: 4 }} />
                    <Text style={styles.navLabel}>Favorite</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="chatbubble-outline" size={24} color="#A0A0A0" style={{ marginBottom: 4 }} />
                    <Text style={styles.navLabel}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-outline" size={24} color="#A0A0A0" style={{ marginBottom: 4 }} />
                    <Text style={styles.navLabel}>Profile</Text>
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
    scrollContainer: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    locationLabel: {
        color: '#A0A0A0',
        fontSize: 12,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 6,
    },
    dropdownIcon: {
        color: '#FFFFFF',
        fontSize: 12,
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
    notificationIcon: {
        fontSize: 20,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
        borderWidth: 1,
        borderColor: '#1E1E1E',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    searchIcon: {
        marginRight: 10,
        fontSize: 16,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
    },
    filterButton: {
        width: 50,
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterIcon: {
        fontSize: 20,
        color: '#FFF',
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
    categoryIcon: {
        fontSize: 24,
    },
    categoryTitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    categorySelected: {

    },
    textSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    textUnselected: {
        color: '#A0A0A0',
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
    recommendedContainer: {
        marginBottom: 24,
        overflow: 'visible',
    },
    recommendedCard: {
        width: width * 0.6,
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        marginRight: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    imagePlaceholder: {
        width: '100%',
        height: 150,
        backgroundColor: '#2C2C2C',
        borderRadius: 16,
        marginBottom: 12,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        padding: 10,
    },
    favoriteButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heartIcon: {
        color: '#FFF',
        fontSize: 16,
    },
    cardContent: {
        paddingHorizontal: 4,
    },
    typeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    typeTag: {
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        color: '#4A90E2',
        fontSize: 10,
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        fontSize: 10,
        marginRight: 4,
    },
    ratingText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    propertyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    locationRowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    pinIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    cardLocation: {
        fontSize: 12,
        color: '#A0A0A0',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    perMonth: {
        fontSize: 12,
        color: '#A0A0A0',
        fontWeight: 'normal',
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
    nearbyImagePlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: '#2C2C2C',
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
        marginBottom: 8,
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
        paddingBottom: 24, // For iPhone X safe area
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    navItem: {
        alignItems: 'center',
    },
    navIcon: {
        fontSize: 24,
        color: '#A0A0A0',
        marginBottom: 4,
    },
    navLabel: {
        fontSize: 10,
        color: '#A0A0A0',
    },
    navSelected: {
        color: '#4A90E2',
    },
});

export default DashboardScreen;
