// src/components/gamification/StreakFlame.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakFlameProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
}

export const StreakFlame: React.FC<StreakFlameProps> = ({ streak, size = 'medium' }) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconSize = isSmall ? 16 : isLarge ? 32 : 24;
  const textSize = isSmall ? 'text-xs' : isLarge ? 'text-2xl' : 'text-base';
  const padding = isSmall ? 'px-2 py-0.5' : isLarge ? 'px-4 py-2' : 'px-3 py-1';

  return (
    <View 
      className={`flex-row items-center justify-center rounded-full bg-orange-50 border border-orange-100 ${padding}`}
      style={styles.shadow}
    >
      <Ionicons name="flame" size={iconSize} color="#EF4444" className="mr-1.5" />
      <Text className={`${textSize} font-black text-orange-600`}>
        {streak}
      </Text>
      {!isSmall && (
        <Text className="text-xs text-orange-500 font-bold ml-1 uppercase">
          Day{streak !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
});
