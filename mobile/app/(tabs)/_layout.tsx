import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AppIcon } from '../../src/components/AppIcon';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import type { IconName } from '../../src/data/icons';
import { PIC_REQUESTS } from '../../src/data/demo';
import { getActiveRole, type DemoRole } from '../../src/lib/session';
import { colors, fontFamily, isGlassMode } from '../../src/theme';

/**
 * Tab bar berbasis peran (mengikuti high-fidelity prototype), reskin
 * gaya ukiran: latar kertas, garis atas tinta 3px, ikon medali untuk tab
 * aktif, ikon tinta untuk tab nonaktif.
 * - Karyawan: Beranda, Riwayat, Tim, Pengajuan, Profil
 * - PIC: Beranda, Persetujuan (badge = jumlah menunggu), Tim, Profil
 * - HR: Beranda, Ambil Alih (badge = jumlah eskalasi), Tim, Profil
 */
function tabIcon(name: IconName) {
  return ({ focused }: { focused: boolean }) => (
    <View style={[styles.iconGlass, focused && styles.iconGlassActive]}>
      {focused ? (
        <MedallionIcon glyph={name} size={36} variant="ink" />
      ) : (
        <AppIcon color="#000000" name={name} size={24} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /** Wrapper kaca untuk setiap ikon tab. */
  iconGlass: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  iconGlassActive: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderColor: 'rgba(255,255,255,0.7)',
  },
});

const badgeStyle = {
  backgroundColor: colors.red,
  borderColor: colors.ink,
  borderRadius: 2,
  borderWidth: 1.5,
  color: '#fff',
  fontFamily: fontFamily('700'),
  fontSize: 9,
} as const;

export default function TabsLayout() {
  const [role, setRole] = useState<DemoRole | null>(null);
  const pathname = usePathname();
  // Animasi pergantian tab: slide-in dari bawah + fade (~200ms).
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getActiveRole().then(setRole);
  }, []);

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(40);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pathname, fade, slide]);

  if (!role) return null;

  // Mode liquid-glass: tab bar kaca gelap (eksperimen, mudah di-revert).
  const glass = isGlassMode();

  const pendingCount = PIC_REQUESTS.filter((r) => r.status === 'menunggu').length;
  const escalatedCount = PIC_REQUESTS.filter(
    (r) => r.status === 'menunggu' && r.escalated,
  ).length;

  return (
    <Animated.View
      style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}
    >
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.65)',
        tabBarLabelStyle: {
          fontFamily: fontFamily('600'),
          fontSize: 9.5,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        tabBarStyle: {
          backgroundColor: glass ? 'rgba(20,16,40,0.55)' : '#0057ba',
          borderTopColor: glass ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)',
          borderTopWidth: glass ? 1 : 1.5,
          height: 74,
          paddingBottom: 10,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Beranda',
          tabBarIcon: tabIcon("home"),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: tabIcon("clock"),
          href: role === 'karyawan' ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: 'Tim',
          tabBarIcon: tabIcon("users"),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Pengajuan',
          tabBarIcon: tabIcon("file_text"),
          href: role === 'karyawan' ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Persetujuan',
          tabBarBadge: pendingCount > 0 ? String(pendingCount) : undefined,
          tabBarBadgeStyle: badgeStyle,
          tabBarIcon: tabIcon("check_circle"),
          href: role === 'pic' ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="takeover"
        options={{
          title: 'Ambil Alih',
          tabBarBadge: escalatedCount > 0 ? String(escalatedCount) : undefined,
          tabBarBadgeStyle: badgeStyle,
          tabBarIcon: tabIcon("repeat"),
          href: role === 'hr' ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: tabIcon("user"),
        }}
      />
    </Tabs>
    </Animated.View>
  );
}
