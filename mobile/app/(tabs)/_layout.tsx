import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
        <AppIcon color="#ffffff" name={name} size={26} />
      ) : (
        <AppIcon color="rgba(255,255,255,0.65)" name={name} size={24} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /** Wrapper kaca gelap untuk setiap ikon tab. */
  iconGlass: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(140,180,255,0.25)',
    borderRadius: 16,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconGlassActive: {
    backgroundColor: 'rgba(120,170,255,0.25)',
    borderColor: 'rgba(140,180,255,0.6)',
    shadowColor: '#4d7fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
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

  useEffect(() => {
    getActiveRole().then(setRole);
  }, []);

  if (!role) return null;

  // Mode liquid-glass: tab bar kaca gelap (eksperimen, mudah di-revert).
  const glass = isGlassMode();

  const pendingCount = PIC_REQUESTS.filter((r) => r.status === 'menunggu').length;
  const escalatedCount = PIC_REQUESTS.filter(
    (r) => r.status === 'menunggu' && r.escalated,
  ).length;

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
        tabBarLabelStyle: {
          fontFamily: fontFamily('600'),
          fontSize: 9,
          letterSpacing: 1,
          marginTop: 7,
          textAlign: 'center',
          textTransform: 'uppercase',
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarButton: (props: any) => (
          <TouchableOpacity
            {...props}
            activeOpacity={1}
            style={[props.style, { backgroundColor: 'transparent' }]}
          />
        ),
        tabBarStyle: {
          backgroundColor: 'rgba(20,30,70,0.65)',
          borderColor: 'rgba(140,180,255,0.35)',
          borderRadius: 28,
          borderWidth: 1.5,
          height: 76,
          marginBottom: 16,
          marginHorizontal: 16,
          paddingBottom: 6,
          paddingTop: 10,
          position: 'absolute',
          shadowColor: '#4d7fff',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 8,
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
    </View>
  );
}
