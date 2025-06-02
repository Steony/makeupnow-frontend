import { Stack } from 'expo-router';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../config/toastConfig';


export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false, // Désactive le header global
        }}
      />
        <Toast config={toastConfig} />
    </>
  );
}
