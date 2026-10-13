import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import type { ColorValue } from 'react-native';
import { AppIcon } from '../../src/components/AppIcon';
import type { IconName } from '../../src/data/icons';
import { PIC_REQUESTS } from '../../src/data/demo';
import { getActiveRole, type DemoRole } from '../../src/lib/session';
import { colors, fontFamily } from '../../src/theme';

/**
 * Tab bar berbasis peran (mengikuti high-fidelity prototype):
 * - Karyawan: Beranda, Riwayat, Tim, Pengajuan, Profil
 * - PIC: Beranda, Persetujuan (badge = jumlah menunggu), Tim, Profil
 * - HR: Beranda, Ambil Alih (badge = jumlah eskalasi), Tim, Profil
 */
function tabIcon(name: IconName) {
  return ({ color }: { color: ColorValue }) => (
    <AppIcon
      color={typeof color === 'string' ? color : colors.indigo}
      name={name}
      size={25}
    />
  );
}

const badgeStyle = {
  backgroundColor: colors.red,
  color: '#fff',
  fontFamily: fontFamily('700'),
  fontSize: 9,
} as const;

export default function TabsLayout() {
  const [role, setRole] = useState<DemoRole | null>(null);

  useEffect(() => {
    getActiveRole().then(setRole);
  }, []);

  if (!role) return null;

  const pendingCount = PIC_REQUESTS.filter((r) => r.status === 'menunggu').length;
  const escalatedCount = PIC_REQUESTS.filter(
    (r) => r.status === 'menunggu' && r.escalated,
  ).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.indigo,
        tabBarInactiveTintColor: colors.ink3,
        tabBarLabelStyle: { fontFamily: fontFamily('600'), fontSize: 10.5 },
        tabBarStyle: {
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
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
  );
}
