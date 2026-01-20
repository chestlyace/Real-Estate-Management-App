import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ViewProfileScreen from '../screens/ViewProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import KYCScreen from '../screens/profile/KYCScreen';
import ExploreScreen from '../screens/ExploreScreen';
import { authService } from '../services/auth.service';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Explore') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Favorite') {
                        iconName = focused ? 'heart' : 'heart-outline';
                    } else if (route.name === 'Chat') {
                        iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#4A90E2',
                tabBarInactiveTintColor: '#A0A0A0',
                tabBarStyle: {
                    backgroundColor: '#1E1E1E',
                    borderTopColor: '#333',
                    paddingBottom: 10,
                    height: 60,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={DashboardScreen} />
            <Tab.Screen name="Explore" component={ExploreScreen} />
            <Tab.Screen name="Favorite" component={DashboardScreen} />
            <Tab.Screen name="Chat" component={DashboardScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const authenticated = await authService.isAuthenticated();
            setIsAuthenticated(authenticated);
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={isAuthenticated ? "Main" : "Welcome"}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
                <Stack.Screen name="PropertyDetails" component={require('../screens/PropertyDetailsScreen').default} options={{ headerShown: false }} />
                <Stack.Screen name="ViewProfile" component={ViewProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen
                    name="KYC"
                    component={KYCScreen}
                    options={{
                        headerShown: true,
                        title: 'Identity Verification',
                        headerStyle: { backgroundColor: '#F5F5F5' },
                        headerTintColor: '#333'
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
