import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/auth.service';

const ForgotPasswordScreen = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [method, setMethod] = useState(''); // 'email' | 'phone'
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval;
        if (step === 3 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleSendOtp = async () => {
        if (method === 'email' && !email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        if (method === 'phone' && !phoneNumber) {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }

        setIsLoading(true);
        try {
            await authService.forgotPassword({
                email: method === 'email' ? email : undefined,
                phoneNumber: method === 'phone' ? phoneNumber : undefined
            });
            setStep(3);
            setTimer(60);
            setCanResend(false);
            Alert.alert('Success', 'Verification code sent!');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyOtp({
                email: method === 'email' ? email : undefined,
                phoneNumber: method === 'phone' ? phoneNumber : undefined,
                otp
            });
            setStep(4);
        } catch (error) {
            Alert.alert('Error', 'Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword({
                email: method === 'email' ? email : undefined,
                phoneNumber: method === 'phone' ? phoneNumber : undefined,
                newPassword
            });
            Alert.alert(
                'Success',
                'Password reset successfully. Please login.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.headerTitle}>Forgot Password</Text>
            <Text style={styles.subtitle}>Select which contact details should we use to reset your password</Text>

            <TouchableOpacity
                style={[styles.optionCard, method === 'email' && styles.optionSelected]}
                onPress={() => setMethod('email')}
            >
                <Text style={styles.optionTitle}>via Email</Text>
                <Text style={styles.optionSubtitle}>Reset via Email verification</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.optionCard, method === 'phone' && styles.optionSelected]}
                onPress={() => setMethod('phone')}
            >
                <Text style={styles.optionTitle}>via Phone Number</Text>
                <Text style={styles.optionSubtitle}>Reset via Phone verification</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, !method && styles.disabledButton]}
                onPress={() => setStep(2)}
                disabled={!method}
            >
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.headerTitle}>Forgot Your Password?</Text>
            <Text style={styles.subtitle}>
                Enter your registered {method === 'email' ? 'Email' : 'Phone Number'} & we will send an OTP verification code.
            </Text>

            {method === 'email' ? (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
            ) : (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#666"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>
            )}

            <TouchableOpacity
                style={[styles.button, isLoading && styles.disabledButton]}
                onPress={handleSendOtp}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Send Code</Text>}
            </TouchableOpacity>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.headerTitle}>Verification Code</Text>
            <Text style={styles.subtitle}>We have sent the code verification to your {method === 'email' ? 'email' : 'phone number'}</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 5 }]}
                    placeholder="0000"
                    placeholderTextColor="#666"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={4}
                />
            </View>

            <TouchableOpacity onPress={handleSendOtp} disabled={!canResend}>
                <Text style={[styles.resendText, !canResend && { color: '#666' }]}>
                    Resend code {canResend ? '' : `in ${timer}s`}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, isLoading && styles.disabledButton]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.headerTitle}>Reset Password</Text>
            <Text style={styles.subtitle}>Create your new password</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#666"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                style={[styles.button, isLoading && styles.disabledButton]}
                onPress={handleResetPassword}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    keyboardView: {
        flex: 1,
        padding: 24,
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        color: '#FFF',
        fontSize: 24,
    },
    formContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#A0A0A0',
        marginBottom: 30,
        lineHeight: 20,
    },
    optionCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#333',
    },
    optionSelected: {
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
    },
    optionTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionSubtitle: {
        color: '#A0A0A0',
        fontSize: 12,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#A0A0A0',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#333',
    },
    button: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: '#333',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendText: {
        color: '#4A90E2',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '600',
    },
});

export default ForgotPasswordScreen;
