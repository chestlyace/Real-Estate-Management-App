import { Platform } from 'react-native';

// API Configuration
// Android Emulator: Use WiFi IP (10.47.216.117) - update if your IP changes
// iOS Simulator: Use localhost
// Physical devices: Use WiFi IP (ensure device is on same network as your computer)
// Note: If your IP changes, update the android URL below
const API_URL = Platform.select({
    android: 'http://10.47.216.117:3000/v1/api',
    ios: 'http://localhost:3000/v1/api',
    default: 'http://10.47.216.117:3000/v1/api',
});

export const API_CONFIG = {
    BASE_URL: API_URL,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};
