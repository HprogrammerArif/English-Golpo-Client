// src/components/quiz/MatchCard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

interface MatchItem {
  id: string;
  text: string;
  type: 'english' | 'bangla';
  pairId: string;
}

interface MatchCardProps {
  pairs: { english: string; bangla: string }[];
  onComplete: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ pairs, onComplete }) => {
  const [cards, setCards] = useState<MatchItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<MatchItem | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [failedPair, setFailedPair] = useState<[string, string] | null>(null);

  useEffect(() => {
    // Generate card items from pairs
    const englishCards: MatchItem[] = pairs.map((p, i) => ({
      id: `en-${i}`,
      text: p.english,
      type: 'english',
      pairId: `pair-${i}`,
    }));

    const banglaCards: MatchItem[] = pairs.map((p, i) => ({
      id: `bn-${i}`,
      text: p.bangla,
      type: 'bangla',
      pairId: `pair-${i}`,
    }));

    // Shuffle cards
    const allCards = [...englishCards, ...banglaCards].sort(() => Math.random() - 0.5);
    setCards(allCards);
    setMatchedIds([]);
    setSelectedCard(null);
    setFailedPair(null);
  }, [pairs]);

  const handleCardPress = (card: MatchItem) => {
    if (matchedIds.includes(card.id) || failedPair) return;

    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    // Already selected itself
    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    // Checking match
    if (selectedCard.type !== card.type && selectedCard.pairId === card.pairId) {
      // It's a match!
      const newMatched = [...matchedIds, selectedCard.id, card.id];
      setMatchedIds(newMatched);
      setSelectedCard(null);

      // Check if all matched
      if (newMatched.length === cards.length) {
        setTimeout(onComplete, 1000);
      }
    } else {
      // It's a fail
      setFailedPair([selectedCard.id, card.id]);
      setSelectedCard(null);
      setTimeout(() => {
        setFailedPair(null);
      }, 1000);
    }
  };

  return (
    <View className="w-full px-1">
      <View className="mb-4 items-center bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
        <Text className="text-xs uppercase font-bold text-emerald-600 tracking-wider">Vocabulary Match</Text>
        <Text className="text-sm text-gray-500 font-semibold mt-1">Tap pairs with matching meanings</Text>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-3">
        {cards.map((card) => {
          const isMatched = matchedIds.includes(card.id);
          const isSelected = selectedCard?.id === card.id;
          const isFailed = failedPair?.includes(card.id);

          let borderClass = 'border-gray-200 bg-white';
          let textClass = 'text-gray-700';

          if (isMatched) {
            borderClass = 'border-emerald-200 bg-emerald-50/40 opacity-40';
            textClass = 'text-emerald-800 font-bold';
          } else if (isSelected) {
            borderClass = 'border-emerald-500 bg-emerald-50';
            textClass = 'text-emerald-800 font-extrabold';
          } else if (isFailed) {
            borderClass = 'border-red-500 bg-red-50';
            textClass = 'text-red-800 font-bold';
          }

          return (
            <TouchableOpacity
              key={card.id}
              disabled={isMatched}
              onPress={() => handleCardPress(card)}
              activeOpacity={0.7}
              style={styles.card}
              className={`border-2 rounded-2xl items-center justify-center p-3 ${borderClass}`}
            >
              <Text 
                numberOfLines={2} 
                className={`text-center font-semibold text-sm ${card.type === 'bangla' ? 'font-bangla' : ''} ${textClass}`}
              >
                {card.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    height: 72,
  },
});
