import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ToastHost } from '../src/components/Toast';

/**
 * Layout akar: memuat Plus Jakarta Sans, lalu stack navigasi.
 * Alur: index (Opening) -> login -> (tabs) -> layar stack.
 * Detail (employee/[id], pic/detail, hr/detail) berada di luar tab bar.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) return null;

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
        <Stack.Screen name="pic/detail" />
        <Stack.Screen name="hr/detail" />
        <Stack.Screen name="employee/[id]" />
      </Stack>
      <ToastHost />
    </>
  );
}
