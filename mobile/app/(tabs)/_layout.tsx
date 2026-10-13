import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { AppIcon } from '../../src/components/AppIcon';
import { MedallionIcon } from '../../src/components/MedallionIcon';
import type { IconName } from '../../src/data/icons';
import { PIC_REQUESTS } from '../../src/data/demo';
import { getActiveRole, type DemoRole } from '../../src/lib/session';
import { colors, fontFamily } from '../../src/theme';

/**
 * Tab bar berbasis peran (mengikuti high-fidelity prototype), reskin
 * gaya ukiran: latar kertas, garis atas tinta 3px, ikon medali untuk tab
 * aktif, ikon tinta untuk tab nonaktif.
 * - Karyawan: Beranda, Riwayat, Tim, Pengajuan, Profil
 * - PIC: Beranda, Persetujuan (badge = jumlah menunggu), Tim, Profil
 * - HR: Beranda, Ambil Alih (badge = jumlah eskalasi), Tim, Profil
 */
function tabIcon(name: IconName) {
  return ({ focused }: { focused: boolean }) =>
    focused ? (
      <MedallionIcon glyph={name} size={40} variant="ink" />
    ) : (
      <AppIcon color={colors.ink3} name={name} size={24} />
    );
}

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
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.ink3,
        tabBarLabelStyle: {
          fontFamily: fontFamily('600'),
          fontSize: 9.5,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.ink,
          borderTopWidth: 3,
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
  );
}
