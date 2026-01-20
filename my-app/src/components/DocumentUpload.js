import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
// If using Expo, verify Ionicons availability, assuming standard Expo icons
import { Ionicons } from '@expo/vector-icons';

const DocumentUpload = ({ title, status, onUpload, loading }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'approved': return '#4CAF50';
            case 'pending': return '#FFC107';
            case 'rejected': return '#F44336';
            default: return '#757575';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'approved': return 'checkmark-circle';
            case 'pending': return 'time';
            case 'rejected': return 'alert-circle';
            default: return 'cloud-upload';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {status && (
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor() }]}>{status.toUpperCase()}</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.uploadButton, { borderColor: getStatusColor() }]}
                onPress={onUpload}
                disabled={status === 'pending' || status === 'approved' || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#007BFF" />
                ) : (
                    <>
                        <Ionicons name={getStatusIcon()} size={24} color={getStatusColor()} />
                        <Text style={[styles.uploadText, { color: getStatusColor() }]}>
                            {status === 'approved' ? 'Verified' :
                                status === 'pending' ? 'Verification Pending' :
                                    status === 'rejected' ? 'Re-upload Document' : 'Upload Document'}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    uploadButton: {
        height: 50,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#FAFAFA',
    },
    uploadText: {
        fontWeight: '500',
    },
});

export default DocumentUpload;
