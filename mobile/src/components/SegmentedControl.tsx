import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, radius } from '../theme';

interface Props<T extends string> {
  options: { value: T; label: string; badge?: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Kontrol segmen (mis. Karyawan/PIC/HR, Buat Baru/Sisa Kuota/Pengajuanku). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt.label}
            </Text>
            {opt.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{opt.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.line,
    borderRadius: radius.chip,
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    alignItems: 'center',
    borderRadius: radius.chip,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  label: { color: colors.ink2, fontFamily: fontFamily('600'), fontSize: 13 },
  labelActive: { color: colors.ink },
  badge: {
    backgroundColor: colors.red,
    borderRadius: radius.chip,
    marginLeft: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontFamily: fontFamily('700'), fontSize: 11 },
});
