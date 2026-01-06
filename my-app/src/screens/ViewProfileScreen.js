import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { authService } from '../services/auth.service';

const ViewProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const userData = await authService.getProfile();
            setUser(userData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                    <Ionicons name="create-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.imageSection}>
                    <View style={styles.imageContainer}>
                        <View style={styles.profileImagePlaceholder}>
                            <Ionicons name="person" size={60} color="#666" />
                        </View>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>{user?.name || '-'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>E-mail address</Text>
                        <Text style={styles.value}>{user?.email || '-'}</Text>
                    </View>



                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Phone number</Text>
                        <Text style={styles.value}>{user?.phone_number }</Text>
                    </View>

                    {/* Date of Birth if available */}
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <Text style={styles.value}>{user?.date_of_birth }</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </ScrollView>
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scrollContainer: {
        paddingBottom: 40,
    },
    imageSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    imageContainer: {
        position: 'relative',
    },
    profileImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    infoContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    infoRow: {
        marginBottom: 20,
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    label: {
        fontSize: 12,
        color: '#A0A0A0',
        marginBottom: 4,
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    editButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 16,
        marginHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 4,
    }
});

export default ViewProfileScreen;
