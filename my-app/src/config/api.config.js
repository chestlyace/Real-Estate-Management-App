import { Platform } from 'react-native';

// API Configuration
// IMPORTANT:
// - Android emulator: use 10.0.2.2 to reach the host machine's localhost (port 3000)
// - iOS simulator: can use localhost
// - Physical devices: replace WIFI_LAN_IP below with your machine's LAN IP (e.g. 192.168.x.x)
//
// If you want to test on a real phone, update WIFI_LAN_IP and, optionally, override android/default.

const WIFI_LAN_IP = '192.168.88.176'; // Updated to match current machine LAN IP (192.168.88.176)

const API_URL = Platform.select({
    // For both Android and iOS, using the machine's LAN IP is more reliable for physical devices.
    // 10.0.2.2 only works for the Android Emulator.
    web: `http://localhost:3000/v1/api`, // Use localhost for web for better reliability on the host machine
    android: `http://${WIFI_LAN_IP}:3000/v1/api`,
    ios: `http://${WIFI_LAN_IP}:3000/v1/api`,
    default: `http://${WIFI_LAN_IP}:3000/v1/api`,
});

export const API_CONFIG = {
    BASE_URL: API_URL,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};
