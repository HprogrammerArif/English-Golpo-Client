// services/offlineStorage.ts
import { Story } from '@/redux/api/storyApi';

let FileSystem: typeof import('expo-file-system') | null = null;
try {
  FileSystem = require('expo-file-system');
} catch {
  console.warn('[offlineStorage] expo-file-system is not available in current environment.');
}

// Keep track of downloaded stories locally in SQLite or MMKV (mock state for now)
const DOWNLOADED_STORIES_KEY = 'offline_downloaded_stories';

export const getLocalStoryDirectory = (storyId: string): string => {
  if (!FileSystem) return '';
  return `${FileSystem.documentDirectory}stories/${storyId}/`;
};

export const isStoryDownloaded = async (storyId: string): Promise<boolean> => {
  if (!FileSystem) return false;
  try {
    const dir = getLocalStoryDirectory(storyId);
    const info = await FileSystem.getInfoAsync(dir);
    return info.exists;
  } catch (err) {
    console.error(`[OfflineStorage] Error checking download status for story ${storyId}:`, err);
    return false;
  }
};

export const downloadStoryAssets = async (story: Story, onProgress?: (progress: number) => void): Promise<boolean> => {
  if (!FileSystem) return false;

  try {
    const storyDir = getLocalStoryDirectory(story.id);
    await FileSystem.makeDirectoryAsync(storyDir, { intermediates: true });

    // Download audio file
    let localAudioUrl = story.audioUrl;
    if (story.audioUrl && story.audioUrl.startsWith('http')) {
      const audioPath = `${storyDir}audio.mp3`;
      const downloadRes = await FileSystem.downloadAsync(story.audioUrl, audioPath);
      localAudioUrl = downloadRes.uri;
    }

    // Download page images
    const pagesWithLocalImages = [];
    let progressCounter = 0;
    const totalDownloads = (story.audioUrl ? 1 : 0) + story.pages.length;

    for (let i = 0; i < story.pages.length; i++) {
      const page = story.pages[i];
      let localImageUrl = page.imageUrl;

      if (page.imageUrl && page.imageUrl.startsWith('http')) {
        const imagePath = `${storyDir}page_${page.pageIndex}.jpg`;
        const downloadRes = await FileSystem.downloadAsync(page.imageUrl, imagePath);
        localImageUrl = downloadRes.uri;
      }

      pagesWithLocalImages.push({
        ...page,
        imageUrl: localImageUrl
      });

      progressCounter++;
      if (onProgress) {
        onProgress(progressCounter / totalDownloads);
      }
    }

    // Save metadata json file locally
    const metadataPath = `${storyDir}metadata.json`;
    const localStoryData = {
      ...story,
      audioUrl: localAudioUrl,
      pages: pagesWithLocalImages
    };

    await FileSystem.writeAsStringAsync(metadataPath, JSON.stringify(localStoryData));

    if (onProgress) onProgress(1);
    return true;
  } catch (err) {
    console.error(`[OfflineStorage] Failed to download story ${story.id}:`, err);
    return false;
  }
};

export const getLocalStoryData = async (storyId: string): Promise<Story | null> => {
  if (!FileSystem) return null;
  try {
    const storyDir = getLocalStoryDirectory(storyId);
    const metadataPath = `${storyDir}metadata.json`;
    const exists = await FileSystem.getInfoAsync(metadataPath);
    if (!exists.exists) return null;

    const data = await FileSystem.readAsStringAsync(metadataPath);
    return JSON.parse(data) as Story;
  } catch (err) {
    console.error(`[OfflineStorage] Error reading offline data for story ${storyId}:`, err);
    return null;
  }
};

export const deleteStoryAssets = async (storyId: string): Promise<boolean> => {
  if (!FileSystem) return false;
  try {
    const dir = getLocalStoryDirectory(storyId);
    const exists = await FileSystem.getInfoAsync(dir);
    if (exists.exists) {
      await FileSystem.deleteAsync(dir, { idling: true } as any);
    }
    return true;
  } catch (err) {
    console.error(`[OfflineStorage] Error deleting local files for story ${storyId}:`, err);
    return false;
  }
};
