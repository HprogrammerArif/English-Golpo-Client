// src/components/gamification/DailyGoalIndicator.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DailyGoalIndicatorProps {
  xpEarnedToday: number;
  dailyGoal: number;
}

export const DailyGoalIndicator: React.FC<DailyGoalIndicatorProps> = ({
  xpEarnedToday,
  dailyGoal,
}) => {
  const percentage = Math.min(100, Math.round((xpEarnedToday / dailyGoal) * 100));
  const isGoalMet = percentage >= 100;

  return (
    <View className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center space-x-2">
          <View className={`w-8 h-8 rounded-lg items-center justify-center ${isGoalMet ? 'bg-emerald-50' : 'bg-gray-50'}`}>
            <Ionicons 
              name={isGoalMet ? "trophy" : "ribbon-outline"} 
              size={18} 
              color={isGoalMet ? "#10B981" : "#9CA3AF"} 
            />
          </View>
          <View>
            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Daily Goal Progress</Text>
            <Text className="text-sm font-bold text-gray-800">
              {isGoalMet ? "Daily target completed! 🎉" : "Keep learning to hit your goal"}
            </Text>
          </View>
        </View>
        <Text className="text-xs font-black text-emerald-600">{percentage}%</Text>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
        <View 
          style={{ width: `${percentage}%` }} 
          className={`h-full rounded-full ${isGoalMet ? 'bg-emerald-500' : 'bg-amber-500'}`} 
        />
      </View>

      <View className="flex-row justify-between items-center mt-2.5">
        <Text className="text-[10px] text-gray-400 font-bold">
          {xpEarnedToday} / {dailyGoal} XP today
        </Text>
        {isGoalMet && (
          <Text className="text-[10px] text-emerald-600 font-bold flex-row items-center">
            ★ Bonus gems rewarded
          </Text>
        )}
      </View>
    </View>
  );
};
