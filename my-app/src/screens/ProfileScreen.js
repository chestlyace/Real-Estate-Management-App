import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { authService } from '../services/auth.service';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const userData = await authService.getProfile();
            setUser(userData);
        } catch (error) {
            console.error(error);
            // Optionally redirect to login if unauthorized
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const menuItems = [
        { id: 1, title: 'Account Settings', icon: 'settings-outline' },
        { id: 2, title: 'Notification', icon: 'notifications-outline' },
        { id: 3, title: 'Language', icon: 'globe-outline' },
        { id: 4, title: 'Privacy', icon: 'lock-closed-outline' },
        { id: 5, title: 'Become a Host', icon: 'home-outline' },
    ];

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to log out');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Ionicons name="settings-sharp" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Profile Card */}
                <View style={styles.profileSection}>
                    <View style={styles.imageContainer}>
                        <View style={styles.profileImagePlaceholder}>
                            <Ionicons name="person" size={50} color="#666" />
                        </View>
                        <TouchableOpacity
                            style={styles.cameraButton}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Ionicons name="camera" size={16} color="#000" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.infoContainer}>
                        {isLoading ? (
                            <ActivityIndicator color="#4A90E2" />
                        ) : (
                            <>
                                <Text style={styles.name}>{user?.name || 'User'}</Text>
                                <Text style={styles.username}>{user?.email || ''}</Text>
                            </>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('ViewProfile')}
                    >
                        <Text style={styles.editButtonText}>View Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.menuItem}>
                            <View style={styles.menuLeft}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name={item.icon} size={22} color="#FFFFFF" />
                                </View>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={styles.menuLeft}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="log-out-outline" size={22} color="#4A90E2" />
                            </View>
                            <Text style={[styles.menuTitle, styles.logoutText]}>Log out</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#E53935" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView >
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 5,
    },
    settingsButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scrollContainer: {
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    username: {
        fontSize: 14,
        color: '#A0A0A0',
    },
    editButton: {
        backgroundColor: '#E53935', // Red color from design
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    menuContainer: {
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
        marginRight: 10,
    },
    menuTitle: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    logoutText: {
        color: '#E53935',
    },
});

export default ProfileScreen;
