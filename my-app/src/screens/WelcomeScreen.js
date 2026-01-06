import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.contentContainer}>
                {/* Logo Area */}
                {/* <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <View style={styles.logoShape} />
                    </View>
                </View> */}

                <Text style={styles.title}>Let's Get You Started With RealEstateApp</Text>

                <View style={styles.buttonContainer}>
                    {/* Social Buttons (Mocked) */}
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>Google</Text>
                        <Text style={styles.socialButtonLabel}>Sign In Using Google Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>Facebook</Text>
                        <Text style={styles.socialButtonLabel}>Sign In Using Facebook Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={styles.socialButtonText}>Apple</Text>
                        <Text style={styles.socialButtonLabel}>Sign In Using Apple Account</Text>
                    </TouchableOpacity>

                    {/* Email/Password Button */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.primaryButtonText}>Sign In Using Password</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>New To RealEstateApp? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>Register Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    // logoContainer: {
    //     alignItems: 'center',
    //     marginTop: 40,
    // },
    // logoCircle: {
    //     width: 120,
    //     height: 120,
    //     borderRadius: 60,
    //     backgroundColor: '#4A90E2',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     overflow: 'hidden',
    // },
    // logoShape: {
    //     width: 60,
    //     height: 60,
    //     backgroundColor: '#FFFFFF',
    //     borderRadius: 30,
    //     transform: [{ translateX: 15 }, { translateY: -15 }],
    // },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    socialButton: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    socialButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginRight: 15,
        width: 80,
    },
    socialButtonLabel: {
        color: '#A0A0A0',
        fontSize: 14,
        flex: 1,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        elevation: 8,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#A0A0A0',
        fontSize: 14,
    },
    linkText: {
        color: '#4A90E2',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default WelcomeScreen;
