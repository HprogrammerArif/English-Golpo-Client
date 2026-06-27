// src/components/gamification/XPCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface XPCardProps {
  xp: number;
  label?: string;
}

export const XPCard: React.FC<XPCardProps> = ({ xp, label = 'Total XP' }) => {
  return (
    <View className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm items-center justify-center flex-row space-x-4">
      <View className="w-12 h-12 rounded-2xl bg-amber-50 items-center justify-center">
        <Ionicons name="flash" size={24} color="#F59E0B" />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          {label}
        </Text>
        <Text className="text-2xl font-black text-gray-800 mt-0.5">
          {xp} <Text className="text-xs text-amber-500 font-bold">XP</Text>
        </Text>
      </View>
    </View>
  );
};
