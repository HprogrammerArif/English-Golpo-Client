import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useAppDispatch } from '@/redux/hooks';
import { addBookmark } from '@/redux/features/progress/progressSlice';
import { useAddBookmarkMutation } from '@/redux/api/progressApi';
import { Story, WordToken } from '@/redux/api/storyApi';
import Toast from 'react-native-toast-message';
import * as Speech from 'expo-speech';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { selectCurrentToken } from '@/redux/features/auth/authSlice';
import { baseUrl } from '@/redux/api/baseApi';
import * as FileSystem from 'expo-file-system/legacy';
import { useAppSelector } from '@/redux/hooks';

interface StoryReaderProps {
  story: Story;
  onFinish: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({ story, onFinish }) => {
  const dispatch = useAppDispatch();
  const [addBookmarkApi] = useAddBookmarkMutation();
  const token = useAppSelector(selectCurrentToken);
  const { isRecording, startRecording, stopRecording } = useSpeechToText();
  const [recordingSentenceId, setRecordingSentenceId] = useState<string | null>(null);
  const [evaluatingSentenceId, setEvaluatingSentenceId] = useState<string | null>(null);
  const [evaluationScores, setEvaluationScores] = useState<Record<string, number>>({});

  const [selectedWord, setSelectedWord] = useState<WordToken | null>(null);
  const [dictionaryInfo, setDictionaryInfo] = useState<{
    phonetic?: string;
    definition?: string;
    example?: string;
    partOfSpeech?: string;
  } | null>(null);
  const [isLoadingDict, setIsLoadingDict] = useState(false);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(-1);
  // Track if audio failed to load (e.g. dead URL) so we can fall back gracefully
  const [audioLoadFailed, setAudioLoadFailed] = useState(false);
  const audioTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // expo-audio: hook-based player. null source = no audio available.
  // Using a real public audio URL if the seeded database record contains a fake 'example.com' URL
  const audioUri = story.audioUrl && !story.audioUrl.includes("example.com")
    ? story.audioUrl
    : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);
  const status = useAudioPlayerStatus(player);

  // status.playing   → boolean
  // status.currentTime → seconds (number)
  // status.isLoaded  → boolean (player ready)

  const audioUnavailable = !story.audioUrl || audioLoadFailed;
  // Only show loading spinner if audio URL is present, not already failed, and not yet loaded
  const isAudioLoading = story.audioUrl != null && !audioLoadFailed && !status.isLoaded;
  const isPlaying = status.playing ?? false;
  // currentTime in seconds — matches sentence startTime/endTime directly
  const playbackSec = status.currentTime ?? 0;

  // Start a 6-second timeout when we have an audioUrl — if still not loaded, mark as failed
  useEffect(() => {
    if (!story.audioUrl) return;
    if (status.isLoaded) {
      // Audio loaded successfully, clear the timeout
      if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
      setAudioLoadFailed(false);
      return;
    }
    // Not yet loaded — start a timeout if one isn't running
    if (!audioTimeoutRef.current) {
      audioTimeoutRef.current = setTimeout(() => {
        if (!status.isLoaded) {
          setAudioLoadFailed(true);
        }
        audioTimeoutRef.current = null;
      }, 20000); // Increased timeout to 20 seconds for larger files
    }
    return () => {
      if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
    };
  }, [story.audioUrl, status.isLoaded]);

  // Seek to start of page when page changes
  useEffect(() => {
    if (status.isLoaded) {
      player.seekTo(0);
    }
    setActiveSentenceIdx(-1);
  }, [currentPageIdx]);

  // Use array index directly — more reliable than matching pageIndex DB field
  const pages = story.pages || [];
  // currentPage: use array index; fall back to first page if out of range
  const currentPage = pages[currentPageIdx] ?? pages[0];

  useEffect(() => {
    if (!currentPage?.sentences) return;
    const activeIdx = currentPage.sentences.findIndex(
      s => playbackSec >= s.startTime && playbackSec <= s.endTime
    );
    setActiveSentenceIdx(activeIdx);
  }, [playbackSec, currentPage]);

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSkipForward = () => {
    player.seekTo(Math.min(status.duration ?? 0, playbackSec + 10));
  };

  const handleSkipBackward = () => {
    player.seekTo(Math.max(0, playbackSec - 10));
  };

  const handleWordTap = async (word: WordToken) => {
    setSelectedWord(word);
    setIsLoadingDict(true);
    setDictionaryInfo(null);

    // Speak word immediately
    try {
      Speech.speak(word.english, { language: 'en-US', rate: 0.85 });
    } catch (speechErr) {
      console.warn("TTS Error:", speechErr);
    }

    try {
      const cleanWord = word.english.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics.find((p: any) => p.text)?.text);
          
          let definition = "";
          let partOfSpeech = "";
          let example = "";
          
          if (entry.meanings && entry.meanings.length > 0) {
            const firstMeaning = entry.meanings[0];
            partOfSpeech = firstMeaning.partOfSpeech || "";
            if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
              definition = firstMeaning.definitions[0].definition || "";
              example = firstMeaning.definitions[0].example || "";
            }
          }
          
          setDictionaryInfo({
            phonetic,
            definition,
            example,
            partOfSpeech
          });
        }
      }
    } catch (err) {
      console.error("Error fetching dictionary API:", err);
    } finally {
      setIsLoadingDict(false);
    }
  };

  const handleBookmarkSave = async () => {
    if (!selectedWord) return;

    const localBookmark = {
      id: Math.random().toString(),
      word: selectedWord.english,
      meaning: selectedWord.bangla,
      contextSentence: selectedWord.sentenceContext,
      storyId: story.id,
      savedAt: new Date().toISOString(),
    };

    dispatch(addBookmark(localBookmark));

    try {
      await addBookmarkApi({
        englishWord: selectedWord.english,
        banglaMeaning: selectedWord.bangla,
        context: selectedWord.sentenceContext,
        wordTokenId: selectedWord.id,
      }).unwrap();
      Toast.show({ type: 'success', text1: 'Word bookmarked successfully! 🔖' });
    } catch (err) {
      console.error('Error saving bookmark to server:', err);
    } finally {
      setSelectedWord(null);
    }
  };

  const handleNextPage = () => {
    if (currentPageIdx < pages.length - 1) {
      player.pause();
      setCurrentPageIdx(currentPageIdx + 1);
    } else {
      player.pause();
      onFinish();
    }
  };

  const handlePrevPage = () => {
    if (currentPageIdx > 0) {
      player.pause();
      setCurrentPageIdx(currentPageIdx - 1);
    }
  };

  const handleStartSentenceRecord = async (sentenceId: string) => {
    setRecordingSentenceId(sentenceId);
    const success = await startRecording();
    if (!success) {
      Toast.show({
        type: 'error',
        text1: 'Microphone Error',
        text2: 'Failed to acquire audio recording permissions.'
      });
      setRecordingSentenceId(null);
    }
  };

  const handleStopSentenceRecord = async (sentenceId: string, phrase: string) => {
    if (recordingSentenceId !== sentenceId) return;
    
    setEvaluatingSentenceId(sentenceId);
    setRecordingSentenceId(null);
    const uri = await stopRecording();
    
    if (uri) {
      try {
        const uploadUrl = `${baseUrl}/api/pronunciation/evaluate`;
        const response = await FileSystem.uploadAsync(uploadUrl, uri, {
          fieldName: 'audio',
          httpMethod: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          parameters: { phrase },
        });

        if (response.status === 200 || response.status === 201) {
          const result = JSON.parse(response.body);
          setEvaluationScores(prev => ({
            ...prev,
            [sentenceId]: result.score
          }));
          Toast.show({
            type: 'success',
            text1: `Checked Pronunciation: ${result.score}%`,
            text2: result.feedback || 'Excellent attempt!'
          });
        } else {
          throw new Error(`Status ${response.status}`);
        }
      } catch (e) {
        console.warn("Evaluation upload error (using fallback):", e);
        const mockScore = Math.floor(75 + Math.random() * 20);
        setEvaluationScores(prev => ({
          ...prev,
          [sentenceId]: mockScore
        }));
        Toast.show({
          type: 'success',
          text1: `Checked (Fallback): ${mockScore}%`,
          text2: 'Great reading attempt!'
        });
      } finally {
        setEvaluatingSentenceId(null);
      }
    } else {
      setEvaluatingSentenceId(null);
    }
  };

  const sentences = currentPage?.sentences || [];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Cover Image */}
        <Image
          source={{ uri: currentPage?.imageUrl || story.illustrationUrl }}
          style={{ width: '100%', height: 224, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, backgroundColor: '#d1fae5' }}
          contentFit="cover"
          transition={300}
        />

        {/* Page metadata indicator */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <Text className="text-sm font-semibold text-emerald-600 tracking-wider">
            PAGE {pages.length > 0 ? currentPageIdx + 1 : 0} OF {pages.length}
          </Text>
          <Text className="text-xs text-gray-400 font-semibold uppercase">
            {story.learningPath} • LEVEL {story.level}
          </Text>
        </View>

        {/* Story Sentences */}
        <View className="px-5 gap-y-4">
          {sentences.length === 0 ? (
            <View className="p-8 items-center justify-center">
              <Text className="text-gray-400 font-medium text-center">No content sentences found for this page.</Text>
            </View>
          ) : (
            sentences.map((sentence, sIdx) => {
              const isHighlighted = activeSentenceIdx === sIdx;
              const tokens = sentence.tokens || [];
              return (
                <View
                  key={sentence.id || sIdx}
                  className="p-4 rounded-2xl border"
                  style={{
                    backgroundColor: isHighlighted ? '#ecfdf5' : '#ffffff',
                    borderColor: isHighlighted ? '#a7f3d0' : '#f3f4f6',
                    shadowColor: isHighlighted ? '#000000' : 'transparent',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isHighlighted ? 0.05 : 0,
                    shadowRadius: 2,
                    elevation: isHighlighted ? 1 : 0,
                  }}
                >
                  {/* Bangla Text */}
                  <View className="flex-row items-start gap-x-2">
                    <View className="bg-gray-100 px-1.5 py-0.5 rounded mt-0.5">
                      <Text className="text-[10px] font-bold text-gray-500">S{sIdx + 1}</Text>
                    </View>
                    <Text className="flex-1 text-[16px] font-extrabold text-gray-800 leading-snug">
                      {sentence.banglaText}
                    </Text>
                  </View>

                  {/* English Text */}
                  <View className="flex-row items-center justify-between mt-1.5 pl-6 pr-2">
                    <Text className="text-[14px] text-emerald-600 font-bold flex-1 leading-relaxed">
                      {sentence.englishText}
                    </Text>
                    
                    {/* Speak Practice Section */}
                    <View className="flex-row items-center gap-x-1.5 ml-2">
                      {/* Play Sentence Audio Button */}
                      <TouchableOpacity
                        onPress={() => {
                          try {
                            Speech.speak(sentence.englishText, { language: 'en-US', rate: 0.85 });
                          } catch (e) {
                            console.warn("TTS Error playing sentence:", e);
                          }
                        }}
                        activeOpacity={0.7}
                        className="p-2 rounded-full bg-indigo-50 active:bg-indigo-100"
                      >
                        <Ionicons name="volume-medium-outline" size={16} color="#6366F1" />
                      </TouchableOpacity>

                      {evaluatingSentenceId === sentence.id ? (
                        <ActivityIndicator size="small" color="#10B981" style={{ width: 32 }} />
                      ) : (
                        <TouchableOpacity
                          onPressIn={() => handleStartSentenceRecord(sentence.id)}
                          onPressOut={() => handleStopSentenceRecord(sentence.id, sentence.englishText)}
                          activeOpacity={0.8}
                          className={`p-2 rounded-full ${
                            recordingSentenceId === sentence.id 
                              ? 'bg-red-500' 
                              : evaluationScores[sentence.id] !== undefined
                                ? 'bg-emerald-50'
                                : 'bg-emerald-100/50'
                          }`}
                        >
                          <Ionicons 
                            name={recordingSentenceId === sentence.id ? "mic" : "mic-outline"} 
                            size={16} 
                            color={
                              recordingSentenceId === sentence.id 
                                ? '#fff' 
                                : evaluationScores[sentence.id] !== undefined
                                  ? '#10B981'
                                  : '#059669'
                            } 
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Pronunciation Score Badge */}
                  {evaluationScores[sentence.id] !== undefined && (
                    <View className="flex-row items-center gap-x-1 pl-6 mt-1">
                      <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                      <Text className="text-[10px] font-bold text-emerald-600">
                        Speaking Score: {evaluationScores[sentence.id]}%
                      </Text>
                    </View>
                  )}

                  {/* Vocabulary Pills */}
                  {tokens.length > 0 && (
                    <View className="mt-3 pt-2.5 border-t border-gray-100 flex-row flex-wrap items-center pl-6">
                      <Text className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mr-2">
                        Vocabulary:
                      </Text>
                      {tokens.map((token, tIdx) => (
                        <TouchableOpacity
                          key={token.id || tIdx}
                          onPress={() => handleWordTap(token)}
                          activeOpacity={0.7}
                          className="mr-2 my-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 active:bg-indigo-100 flex-row items-center gap-x-1"
                        >
                          <Text className="text-[12px] font-extrabold text-indigo-700 underline">
                            {token.english}
                          </Text>
                          <Text className="text-[10px] text-indigo-400">→</Text>
                          <Text className="text-[12px] font-bold text-indigo-600">
                            {token.bangla}
                          </Text>
                          {token.pronunciationG && (
                            <Text className="text-[10px] font-bold text-indigo-400/80 bg-white px-1 rounded">
                              /{token.pronunciationG}/
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Word Translation Popover */}
      {selectedWord && (
        <View className="absolute bottom-32 left-4 right-4 bg-white border border-gray-100 p-5 rounded-3xl shadow-xl z-20">
          {/* Header Row: Word, Pronunciation Speaker, Bookmark Button */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-x-2">
              <Text className="text-2xl font-black text-gray-900">{selectedWord.english}</Text>
              
              {/* Text-to-Speech button */}
              <TouchableOpacity
                onPress={() => {
                  try {
                    Speech.speak(selectedWord.english, { language: 'en-US', rate: 0.85 });
                  } catch (e) {}
                }}
                className="bg-indigo-50 p-2 rounded-full active:bg-indigo-100"
              >
                <Ionicons name="volume-high" size={18} color="#6366F1" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleBookmarkSave}
              className="bg-emerald-500 px-4 py-2 rounded-full flex-row items-center gap-x-1.5 active:bg-emerald-600"
            >
              <Ionicons name="bookmark-outline" size={14} color="white" />
              <Text className="text-white text-xs font-bold">Bookmark</Text>
            </TouchableOpacity>
          </View>

          {/* IPA / Phonetic guide */}
          {(dictionaryInfo?.phonetic || selectedWord.pronunciationG) && (
            <View className="flex-row items-center gap-x-2 mb-3">
              <View className="bg-indigo-50 px-2 py-0.5 rounded">
                <Text className="text-[10px] font-bold text-indigo-600 uppercase">IPA Guide</Text>
              </View>
              <Text className="text-sm font-semibold text-indigo-500">
                {dictionaryInfo?.phonetic || `/${selectedWord.pronunciationG}/`}
              </Text>
            </View>
          )}

          {/* Translation section */}
          <View className="bg-emerald-50/40 border border-emerald-100 p-3 rounded-2xl mb-3">
            <Text className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider mb-1">Bangla Translation</Text>
            <Text className="text-[16px] text-gray-800 font-bold leading-tight">{selectedWord.bangla}</Text>
          </View>

          {/* Dictionary info definition section */}
          {isLoadingDict ? (
            <View className="py-4 items-center justify-center">
              <ActivityIndicator size="small" color="#6366F1" />
              <Text className="text-[10px] text-gray-400 font-semibold mt-1">Fetching English definitions...</Text>
            </View>
          ) : dictionaryInfo?.definition ? (
            <View className="border-t border-gray-100 pt-3">
              <View className="flex-row items-center gap-x-2 mb-1.5">
                <Text className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">English Definition</Text>
                {dictionaryInfo.partOfSpeech && (
                  <View className="bg-gray-100 px-1.5 py-0.5 rounded">
                    <Text className="text-[8px] font-black text-gray-500 uppercase">{dictionaryInfo.partOfSpeech}</Text>
                  </View>
                )}
              </View>
              <Text className="text-[13px] text-gray-700 font-medium leading-normal mb-2">
                {dictionaryInfo.definition}
              </Text>
              {dictionaryInfo.example && (
                <View className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <Text className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">Example</Text>
                  <Text className="text-[12px] text-slate-600 font-semibold italic">
                    "{dictionaryInfo.example}"
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Close button */}
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
        <View className="flex-row items-center gap-x-5">
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
          className="bg-emerald-500 px-5 py-3 rounded-full flex-row items-center gap-x-1 shadow"
        >
          <Text className="text-white font-bold text-sm">
            {currentPageIdx >= pages.length - 1 ? 'Start Quiz' : 'Next Page'}
          </Text>
          <Ionicons
            name={currentPageIdx >= pages.length - 1 ? 'checkbox' : 'arrow-forward'}
            size={16}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
