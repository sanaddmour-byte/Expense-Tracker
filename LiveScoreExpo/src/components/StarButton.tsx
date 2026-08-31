import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';

export function StarButton({ starred, onPress, size = 22 }: { starred: boolean; onPress: () => void; size?: number }) {
  const { theme } = useAppTheme();
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.button}>
      <Ionicons
        name={starred ? 'star' : 'star-outline'}
        size={size}
        color={starred ? theme.accentYellow : theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
