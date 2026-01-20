import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, RefreshControl, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DocumentUpload from '../../components/DocumentUpload';
import kycService from '../../services/kyc.service';

const KYCScreen = ({ navigation }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadStatus = useCallback(async () => {
        try {
            const data = await kycService.getStatus();
            if (data.status === 'success') {
                setDocuments(data.data.documents || []);
            }
        } catch (error) {
            console.error('Failed to load KYC status', error);
            if (error.response && error.response.status === 401) {
                // Optionally redirect here too, or just let users fail when they try to upload
                Alert.alert('Session Expired', 'Please login again.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            }
        }
    }, []);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadStatus();
        setRefreshing(false);
    }, [loadStatus]);

    const uploadDocument = async (type) => {
        try {
            // Request permissions
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'You need to allow camera access to upload documents.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setLoading(true);
                const asset = result.assets[0];

                const formData = new FormData();
                formData.append('document', {
                    uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
                    type: 'image/jpeg',
                    name: `document_${Date.now()}.jpg`,
                });
                formData.append('type', type);

                await kycService.uploadDocument(formData);
                Alert.alert('Success', 'Document uploaded successfully');
                await loadStatus();
            }
        } catch (error) {
            console.error('Upload error:', error);
            if (error.response && error.response.status === 401) {
                Alert.alert('Session Expired', 'Please login again to continue.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            } else {
                Alert.alert('Error', 'Failed to upload document. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getDocumentStatus = (type) => {
        const doc = documents.find(d => d.document_type === type);
        return doc ? doc.status : null;
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.content}>
                <Text style={styles.headerText}>Identity Verification</Text>
                <Text style={styles.subHeaderText}>
                    Please upload the following documents to verify your identity.
                </Text>

                <DocumentUpload
                    title="ID Card"
                    status={getDocumentStatus('id_card')}
                    onUpload={() => uploadDocument('id_card')}
                    loading={loading}
                />

                <DocumentUpload
                    title="Passport"
                    status={getDocumentStatus('passport')}
                    onUpload={() => uploadDocument('passport')}
                    loading={loading}
                />

                <DocumentUpload
                    title="Utility Bill"
                    status={getDocumentStatus('utility_bill')}
                    onUpload={() => uploadDocument('utility_bill')}
                    loading={loading}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        padding: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subHeaderText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
});

export default KYCScreen;
