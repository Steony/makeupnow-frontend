import { Stack } from 'expo-router';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../config/toastConfig';


import { AuthProvider } from '../utils/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <Toast config={toastConfig} position="top" topOffset={170} />
      </>
    </AuthProvider>
  );
}

