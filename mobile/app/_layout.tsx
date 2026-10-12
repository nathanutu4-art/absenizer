import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Layout akar: stack navigasi.
 * Alur: index (Opening) -> login -> (tabs) -> layar stack (clock-in, leave, pic, hr).
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="clock-in/selfie" />
        <Stack.Screen name="clock-in/liveness" />
        <Stack.Screen name="clock-in/confirm" />
        <Stack.Screen name="clock-in/success" />
        <Stack.Screen name="leave/new" />
        <Stack.Screen name="leave/quota" />
        <Stack.Screen name="pic/approvals" />
        <Stack.Screen name="pic/detail" />
        <Stack.Screen name="hr/takeover" />
      </Stack>
    </>
  );
}
