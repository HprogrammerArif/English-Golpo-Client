import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '@/redux/hooks';
import { addBookmark } from '@/redux/features/progress/progressSlice';
import { useAddBookmarkMutation } from '@/redux/api/progressApi';
import { Story, WordToken } from '@/redux/api/storyApi';
import Toast from 'react-native-toast-message';

// expo-av requires the ExponentAV native module, which is unavailable in Expo Go.
// We load it lazily and fall back to a no-op when the module is missing.
let AudioModule: typeof import('expo-av').Audio | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AudioModule = require('expo-av').Audio;
} catch {
  console.warn('[StoryReader] expo-av native module not available (Expo Go). Audio playback disabled.');
}

interface StoryReaderProps {
  story: Story;
  onFinish: () => void;
}

export  const StoryReader: React.FC<StoryReaderProps> = ({ story, onFinish }) => {
  const dispatch = useAppDispatch();
  const [addBookmarkApi] = useAddBookmarkMutation();

  const [sound, setSound] = useState<import('expo-av').Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSec, setPlaybackSec] = useState(0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(-1);
  const [selectedWord, setSelectedWord] = useState<WordToken | null>(null);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(!AudioModule);

  const currentPage = story.pages.find(p => p.pageIndex === currentPageIdx) || story.pages[0];

  // Load sound when story page changes or audio url updates
  useEffect(() => {
    // Skip audio loading if native module is unavailable (e.g. Expo Go)
    if (!AudioModule) return;

    let isMounted = true;
    const loadAudio = async () => {
      if (sound) {
        await sound.unloadAsync();
      }
      if (!story.audioUrl) return;

      setIsAudioLoading(true);
      try {
        const { sound: newSound } = await AudioModule!.Sound.createAsync(
          { uri: story.audioUrl },
          { shouldPlay: false },
          (status: any) => {
            if (status.isLoaded) {
              setPlaybackSec(status.positionMillis / 1000);
              setIsPlaying(status.isPlaying);
            }
          }
        );
        if (isMounted) {
          setSound(newSound);
        }
      } catch (err) {
        console.error('Error loading audio:', err);
      } finally {
        if (isMounted) setIsAudioLoading(false);
      }
    };

    loadAudio();

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [story.audioUrl, currentPageIdx]);

  // Determine active highlighted sentence based on playback progress
  useEffect(() => {
    if (!currentPage) return;
    const activeIdx = currentPage.sentences.findIndex(
      (s) => playbackSec >= s.startTime && playbackSec <= s.endTime
    );
    setActiveSentenceIdx(activeIdx);
  }, [playbackSec, currentPage]);

  const handlePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleSkipForward = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      await sound.setPositionAsync(Math.min(status.durationMillis || 0, status.positionMillis + 10000));
    }
  };

  const handleSkipBackward = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      await sound.setPositionAsync(Math.max(0, status.positionMillis - 10000));
    }
  };

  const handleWordTap = (word: WordToken) => {
    setSelectedWord(word);
  };

  const handleBookmarkSave = async () => {
    if (!selectedWord) return;

    // Format local state bookmark
    const localBookmark = {
      id: Math.random().toString(),
      word: selectedWord.english,
      meaning: selectedWord.bangla,
      contextSentence: selectedWord.sentenceContext,
      storyId: story.id,
      savedAt: new Date().toISOString(),
    };

    // Save locally
    dispatch(addBookmark(localBookmark));

    // Save to backend via API
    try {
      await addBookmarkApi({
        englishWord: selectedWord.english,
        banglaMeaning: selectedWord.bangla,
        context: selectedWord.sentenceContext,
        wordTokenId: selectedWord.id,
      }).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Word bookmarked successfully! 🔖',
      });
    } catch (err) {
      console.error('Error saving bookmark to server:', err);
    } finally {
      setSelectedWord(null);
    }
  };

  const handleNextPage = () => {
    if (currentPageIdx < story.pages.length - 1) {
      setCurrentPageIdx(currentPageIdx + 1);
      setActiveSentenceIdx(-1);
      setPlaybackSec(0);
    } else {
      // Finished all pages, trigger quiz
      if (sound) {
        sound.stopAsync();
      }
      onFinish();
    }
  };

  const handlePrevPage = () => {
    if (currentPageIdx > 0) {
      setCurrentPageIdx(currentPageIdx - 1);
      setActiveSentenceIdx(-1);
      setPlaybackSec(0);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Cover Image */}
        <Image
          source={{ uri: currentPage.imageUrl || story.illustrationUrl }}
          className="w-full h-56 rounded-b-3xl bg-emerald-100"
          contentFit="cover"
          transition={300}
        />

        {/* Page metadata indicator */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <Text className="text-sm font-semibold text-emerald-600 tracking-wider">
            PAGE {currentPageIdx + 1} OF {story.pages.length}
          </Text>
          <Text className="text-xs text-gray-400 font-semibold uppercase">
            {story.learningPath} • LEVEL {story.level}
          </Text>
        </View>

        {/* Story Sentences */}
        <View className="px-5 space-y-4">
          {currentPage.sentences.map((sentence, sIdx) => {
            const isHighlighted = activeSentenceIdx === sIdx;
            return (
              <View
                key={sentence.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isHighlighted
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                    : 'bg-white border-gray-100'
                }`}
              >
                {/* English Tappable word tokens */}
                <View className="flex-row flex-wrap items-center">
                  {sentence.tokens.map((token) => (
                    <TouchableOpacity
                      key={token.id}
                      onPress={() => handleWordTap(token)}
                      activeOpacity={0.7}
                      className="mr-1.5 my-0.5 px-1 py-0.5 rounded bg-gray-100/50 active:bg-emerald-100"
                    >
                      <Text className="text-[17px] font-medium text-gray-800 underline decoration-emerald-400/40">
                        {token.english}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Bangla Translation */}
                <Text className="text-[14px] text-gray-500 font-medium mt-2 leading-relaxed">
                  {sentence.banglaText}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Word Translation Popover */}
      {selectedWord && (
        <View className="absolute bottom-32 left-4 right-4 bg-white border border-gray-100 p-5 rounded-3xl shadow-xl z-20">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-xs text-emerald-600 font-bold uppercase tracking-wide">English Word</Text>
              <Text className="text-2xl font-bold text-gray-900">{selectedWord.english}</Text>
            </View>
            <TouchableOpacity
              onPress={handleBookmarkSave}
              className="bg-emerald-500 px-4 py-2 rounded-full flex-row items-center space-x-1.5"
            >
              <Ionicons name="bookmark-outline" size={16} color="white" />
              <Text className="text-white text-xs font-bold">Bookmark</Text>
            </TouchableOpacity>
          </View>

          <View className="border-t border-gray-100 pt-3">
            <Text className="text-xs text-gray-400 font-bold uppercase tracking-wide">Bangla Meaning</Text>
            <Text className="text-base text-gray-800 font-medium mt-0.5">{selectedWord.bangla}</Text>
          </View>

          {selectedWord.pronunciationG && (
            <View className="mt-2.5 flex-row items-center space-x-1">
              <Text className="text-xs text-gray-400 font-bold uppercase tracking-wide">IPA Guide:</Text>
              <Text className="text-sm font-semibold text-emerald-600">/{selectedWord.pronunciationG}/</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setSelectedWord(null)}
            className="absolute top-4 right-4 p-1"
          >
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Control Dock */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-5 flex-row items-center justify-between shadow-lg">
        {/* Navigation buttons */}
        <TouchableOpacity
          onPress={handlePrevPage}
          disabled={currentPageIdx === 0}
          className={`p-3 rounded-full ${currentPageIdx === 0 ? 'bg-gray-100' : 'bg-emerald-50'}`}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={currentPageIdx === 0 ? '#9CA3AF' : '#10B981'}
          />
        </TouchableOpacity>

        {/* Audio controls */}
        <View className="flex-row items-center space-x-5">
          <TouchableOpacity onPress={handleSkipBackward} disabled={audioUnavailable} className="p-2">
            <Ionicons name="play-back" size={24} color={audioUnavailable ? '#D1D5DB' : '#6B7280'} />
          </TouchableOpacity>

          {isAudioLoading ? (
            <View className="bg-emerald-500 w-14 h-14 rounded-full items-center justify-center">
              <ActivityIndicator color="white" />
            </View>
          ) : audioUnavailable ? (
            <View className="bg-gray-200 w-14 h-14 rounded-full items-center justify-center">
              <Ionicons name="volume-mute" size={26} color="#9CA3AF" />
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePlayPause}
              className="bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-md active:bg-emerald-600"
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={28}
                color="white"
                style={{ marginLeft: isPlaying ? 0 : 3 }}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleSkipForward} disabled={audioUnavailable} className="p-2">
            <Ionicons name="play-forward" size={24} color={audioUnavailable ? '#D1D5DB' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        {/* Page progress navigation */}
        <TouchableOpacity
          onPress={handleNextPage}
          className="bg-emerald-500 px-5 py-3 rounded-full flex-row items-center space-x-1 shadow"
        >
          <Text className="text-white font-bold text-sm">
            {currentPageIdx === story.pages.length - 1 ? 'Start Quiz' : 'Next Page'}
          </Text>
          <Ionicons
            name={currentPageIdx === story.pages.length - 1 ? 'checkbox' : 'arrow-forward'}
            size={16}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
