// src/components/quiz/MCQCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MCQCardProps {
  questionText: string;
  questionTextBn?: string | null;
  options: string[];
  selectedOptionIdx: number | null;
  correctOptionIdx?: number | null; // Used to show immediate feedback if desired
  onSelectOption: (idx: number) => void;
}

export const MCQCard: React.FC<MCQCardProps> = ({
  questionText,
  questionTextBn,
  options,
  selectedOptionIdx,
  correctOptionIdx,
  onSelectOption,
}) => {
  const showFeedback = correctOptionIdx !== undefined && correctOptionIdx !== null && selectedOptionIdx !== null;

  return (
    <View className="w-full">
      {/* Question Header Card */}
      <View className="mb-5 bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl">
        <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
          Select Translation
        </Text>
        <Text className="text-lg font-black text-gray-800 leading-snug">
          {questionText}
        </Text>
        {questionTextBn && (
          <Text className="text-sm font-semibold text-gray-400 font-bangla mt-1">
            {questionTextBn}
          </Text>
        )}
      </View>

      {/* Options Stack */}
      <View className="space-y-3.5">
        {options.map((option, idx) => {
          const isSelected = selectedOptionIdx === idx;
          const letter = String.fromCharCode(65 + idx); // A, B, C...

          let btnBgClass = 'bg-white border-gray-100';
          let borderStyle = {};
          let textClass = 'text-gray-700';
          let letterBgClass = 'bg-gray-50 border-gray-200';
          let letterTextClass = 'text-gray-500';

          if (showFeedback) {
            const isCorrect = idx === correctOptionIdx;
            if (isSelected) {
              btnBgClass = isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500';
              textClass = isCorrect ? 'text-emerald-950 font-bold' : 'text-red-950 font-bold';
              letterBgClass = isCorrect ? 'bg-emerald-500 border-emerald-600' : 'bg-red-500 border-red-600';
              letterTextClass = 'text-white';
            } else if (isCorrect) {
              btnBgClass = 'bg-emerald-50 border-emerald-500';
              textClass = 'text-emerald-950 font-bold';
              letterBgClass = 'bg-emerald-500 border-emerald-600';
              letterTextClass = 'text-white';
            }
          } else if (isSelected) {
            btnBgClass = 'bg-emerald-50 border-emerald-500 shadow-sm';
            textClass = 'text-emerald-950 font-bold';
            letterBgClass = 'bg-emerald-500 border-emerald-600';
            letterTextClass = 'text-white';
          }

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => !showFeedback && onSelectOption(idx)}
              activeOpacity={0.8}
              disabled={showFeedback}
              className={`flex-row items-center border p-4.5 rounded-2xl ${btnBgClass}`}
              style={[styles.btn, isSelected && !showFeedback && styles.shadowSelected]}
            >
              <View 
                className={`w-7.5 h-7.5 rounded-lg border items-center justify-center mr-3.5 ${letterBgClass}`}
              >
                <Text className={`font-black text-xs ${letterTextClass}`}>
                  {letter}
                </Text>
              </View>

              <Text className={`text-base font-semibold flex-1 ${textClass}`}>
                {option}
              </Text>

              {showFeedback && (isSelected || idx === correctOptionIdx) && (
                <Ionicons 
                  name={idx === correctOptionIdx ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={idx === correctOptionIdx ? "#10B981" : "#EF4444"} 
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    minHeight: 56,
  },
  shadowSelected: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
});
