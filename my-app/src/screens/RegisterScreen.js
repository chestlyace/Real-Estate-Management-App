import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/auth.service';

const RegisterScreen = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Step 1: Basic Info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 2: Phone & Verification
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    // Step 3: Account Type & Terms
    const [accountType, setAccountType] = useState(''); // 'guest' | 'owner'
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDateOfBirth(selectedDate);
        }
    };

    const handleNextStep = async () => {
        if (step === 1) {
            if (!name || !email || !dateOfBirth || !password || !confirmPassword) {
                Alert.alert('Error', 'Please fill in all fields');
                return;
            }
            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!isPhoneVerified) {
                Alert.alert('Error', 'Please verify your phone number first');
                return;
            }
            setStep(3);
        }
    };

    const handleSendCode = () => {
        if (!phoneNumber) {
            Alert.alert('Error', 'Please enter a phone number');
            return;
        }
        // Mock sending code
        setIsCodeSent(true);
        Alert.alert('Code Sent', 'Your verification code is 1234');
    };

    const handleVerifyCode = () => {
        if (verificationCode === '1234') {
            setIsPhoneVerified(true);
            Alert.alert('Success', 'Phone number verified!');
        } else {
            Alert.alert('Error', 'Invalid verification code');
        }
    };

    const handleRegister = async () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'RegisterScreen.js:handleRegister:entry', message: 'handleRegister called', data: { hasAccountType: !!accountType, termsAccepted: termsAccepted, hasName: !!name, hasEmail: !!email, hasPassword: !!password, hasPhoneNumber: !!phoneNumber, hasDateOfBirth: !!dateOfBirth }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
        if (!accountType) {
            Alert.alert('Error', 'Please select an account type');
            return;
        }
        if (!termsAccepted) {
            Alert.alert('Error', 'You must accept the terms and conditions');
            return;
        }

        setIsLoading(true);
        try {
            const registrationData = {
                name,
                email,
                dateOfBirth: dateOfBirth instanceof Date ? dateOfBirth.toISOString() : dateOfBirth,
                password,
                phoneNumber,
                accountType,
            };
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'RegisterScreen.js:handleRegister:before-call', message: 'Before calling authService.register', data: { registrationData: registrationData, dateOfBirthType: typeof dateOfBirth, dateOfBirthValue: dateOfBirth instanceof Date ? dateOfBirth.toISOString() : dateOfBirth }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
            // #endregion

            const response = await authService.register(registrationData);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'RegisterScreen.js:handleRegister:success', message: 'Registration successful', data: { hasResponse: !!response, responseStatus: response?.status, hasData: !!response?.data }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
            // #endregion
            console.log('Registration successful:', response);

            // Navigate directly to Dashboard as requested
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3dbf4cb5-9697-44ff-9f6f-78a8643f9769', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'RegisterScreen.js:handleRegister:error', message: 'Registration error in handleRegister', data: { name: error.name, message: error.message, stack: error.stack?.substring(0, 200) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion
            Alert.alert('Registration Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />
            </View>

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

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Date of Birth</Text>
                {Platform.OS === 'android' && (
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {dateOfBirth instanceof Date ? dateOfBirth.toLocaleDateString() : new Date(dateOfBirth).toLocaleDateString()}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#A0A0A0" />
                    </TouchableOpacity>
                )}
                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={dateOfBirth instanceof Date ? dateOfBirth : new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        themeVariant="dark"
                    />
                )}
                {Platform.OS === 'ios' && (
                    <View style={styles.iosDatePickerContainer}>
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={dateOfBirth instanceof Date ? dateOfBirth : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                            themeVariant="dark"
                        />
                    </View>
                )}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 10 }]}
                        placeholder="+237 234 567 8900"
                        placeholderTextColor="#666"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        editable={!isPhoneVerified}
                    />
                    {!isPhoneVerified && (
                        <TouchableOpacity
                            style={[styles.smallButton, !phoneNumber && styles.disabledButton]}
                            onPress={handleSendCode}
                            disabled={!phoneNumber}
                        >
                            <Text style={styles.smallButtonText}>{isCodeSent ? 'Resend' : 'Send'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isCodeSent && !isPhoneVerified && (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Verification Code</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 10 }]}
                            placeholder="1234"
                            placeholderTextColor="#666"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="number-pad"
                        />
                        <TouchableOpacity
                            style={styles.smallButton}
                            onPress={handleVerifyCode}
                        >
                            <Text style={styles.smallButtonText}>Verify</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {isPhoneVerified && (
                <View style={styles.verifiedContainer}>
                    <Text style={styles.verifiedText}>✓ Phone Number Verified</Text>
                </View>
            )}

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => setStep(1)}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, !isPhoneVerified && styles.disabledButton]}
                    onPress={handleNextStep}
                    disabled={!isPhoneVerified}
                >
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.formContainer}>
            <Text style={styles.label}>Select Account Type</Text>
            <View style={styles.accountTypeContainer}>
                <TouchableOpacity
                    style={[styles.accountTypeCard, accountType === 'guest' && styles.accountTypeSelected]}
                    onPress={() => setAccountType('guest')}
                >
                    <Text style={[styles.accountTypeTitle, accountType === 'guest' && styles.textSelected]}>Guest</Text>
                    <Text style={[styles.accountTypeDesc, accountType === 'guest' && styles.textSelected]}>I want to book places</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.accountTypeCard, accountType === 'owner' && styles.accountTypeSelected]}
                    onPress={() => setAccountType('owner')}
                >
                    <Text style={[styles.accountTypeTitle, accountType === 'owner' && styles.textSelected]}>Owner</Text>
                    <Text style={[styles.accountTypeDesc, accountType === 'owner' && styles.textSelected]}>I want to list properties</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setTermsAccepted(!termsAccepted)}
            >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                    {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>I agree to the Terms and Conditions</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => setStep(2)}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.disabledButton]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Step {step} of 3</Text>
                    </View>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                            <Text style={styles.loginLink}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    headerContainer: {
        marginBottom: 30,
        marginTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#A0A0A0',
    },
    formContainer: {
        width: '100%',
        marginBottom: 20,
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        flex: 1,
        marginHorizontal: 5,
    },
    secondaryButton: {
        backgroundColor: '#333',
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
    smallButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    smallButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    verifiedContainer: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4CAF50',
        marginBottom: 20,
        alignItems: 'center',
    },
    verifiedText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 16,
    },
    accountTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    accountTypeCard: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 5,
        borderWidth: 2,
        borderColor: '#333',
        alignItems: 'center',
    },
    accountTypeSelected: {
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
    },
    accountTypeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    accountTypeDesc: {
        fontSize: 12,
        color: '#A0A0A0',
        textAlign: 'center',
    },
    textSelected: {
        color: '#4A90E2',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#4A90E2',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#4A90E2',
    },
    checkmark: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    checkboxLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        flex: 1,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        color: '#A0A0A0',
        fontSize: 14,
    },
    loginLink: {
        color: '#4A90E2',
        fontSize: 14,
        fontWeight: 'bold',
    },
    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    dateText: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    iosDatePickerContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'flex-start'
    }
});

export default RegisterScreen;
