/**
 * Icon Component
 * Wrapper around @expo/vector-icons/MaterialIcons with semantic name mapping
 */

import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';

// Semantic icon name mapping to MaterialIcons glyph names
const ICON_MAP = {
  // Navigation
  dashboard: 'dashboard',
  visitors: 'group',
  'pre-register': 'assignment',
  'qr-scan': 'qr_code_scanner',
  profile: 'person',
  back: 'arrow_back',
  close: 'close',
  chevronRight: 'chevron_right',
  add: 'add',

  // KPI / Dashboard
  groups: 'groups',
  locationOn: 'location_on',
  inventory: 'inventory_2',
  warning: 'warning',
  warningAmber: 'warning_amber',

  // Actions
  search: 'search',
  phone: 'phone',
  mail: 'mail',
  lock: 'lock',
  darkMode: 'dark_mode',
  logout: 'logout',
  checkCircle: 'check_circle',
  cancel: 'cancel',
  qrCode: 'qr_code_scanner',

  // Notification types
  person: 'person',
  localShipping: 'local_shipping',
  notifications: 'notifications',

  // Form / Detail
  apartment: 'apartment',
  calendar: 'event',
  badge: 'badge',
  emailRead: 'mark_email_read',
  visibility: 'visibility',
  visibilityOff: 'visibility_off',
} as const;

export type IconName = keyof typeof ICON_MAP;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#6B7280',
  style,
}) => {
  const glyphName = ICON_MAP[name];
  return (
    <MaterialIcons
      name={glyphName as any}
      size={size}
      color={color}
      style={style}
    />
  );
};
