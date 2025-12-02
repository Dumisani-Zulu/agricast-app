import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { Crop } from '../types/crop';

// Storage keys
const OFFLINE_CROPS_KEY = '@agricast_offline_saved_crops';
const SYNC_PENDING_KEY = '@agricast_sync_pending';
const LAST_SYNC_KEY = '@agricast_last_sync';

interface PendingSync {
  type: 'add' | 'delete' | 'clear';
  cropId?: string;
  crop?: Crop;
  timestamp: number;
}

/**
 * Check if the device is online
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected === true && networkState.isInternetReachable === true;
  } catch {
    return false;
  }
};

/**
 * Get saved crops from offline storage
 */
export const getOfflineSavedCrops = async (): Promise<Crop[]> => {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_CROPS_KEY);
    if (data) {
      const crops = JSON.parse(data) as Crop[];
      console.log(`📱 [OfflineStorage] Retrieved ${crops.length} crops from offline storage`);
      return crops;
    }
    return [];
  } catch (error) {
    console.error('❌ [OfflineStorage] Error getting offline crops:', error);
    return [];
  }
};

/**
 * Save crops to offline storage
 */
export const setOfflineSavedCrops = async (crops: Crop[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_CROPS_KEY, JSON.stringify(crops));
    console.log(`💾 [OfflineStorage] Saved ${crops.length} crops to offline storage`);
  } catch (error) {
    console.error('❌ [OfflineStorage] Error saving offline crops:', error);
  }
};

/**
 * Add a crop to offline storage
 */
export const addCropToOfflineStorage = async (crop: Crop): Promise<{ success: boolean; message: string }> => {
  try {
    const existingCrops = await getOfflineSavedCrops();
    
    // Check for duplicates
    const isDuplicate = existingCrops.some(
      existing => existing.id === crop.id || 
        existing.name.toLowerCase() === crop.name.toLowerCase()
    );
    
    if (isDuplicate) {
      console.log(`⚠️ [OfflineStorage] Crop already saved: ${crop.name}`);
      return { success: false, message: 'This crop is already saved.' };
    }
    
    const updatedCrops = [...existingCrops, crop];
    await setOfflineSavedCrops(updatedCrops);
    
    // Add to pending sync queue
    await addPendingSync({ type: 'add', crop, timestamp: Date.now() });
    
    console.log(`✅ [OfflineStorage] Crop added: ${crop.name}`);
    return { success: true, message: 'Crop saved successfully!' };
  } catch (error) {
    console.error('❌ [OfflineStorage] Error adding crop:', error);
    return { success: false, message: 'Failed to save crop.' };
  }
};

/**
 * Delete a crop from offline storage
 */
export const deleteCropFromOfflineStorage = async (cropId: string): Promise<void> => {
  try {
    const existingCrops = await getOfflineSavedCrops();
    const filteredCrops = existingCrops.filter(
      crop => crop.id !== cropId && crop.name !== cropId
    );
    await setOfflineSavedCrops(filteredCrops);
    
    // Add to pending sync queue
    await addPendingSync({ type: 'delete', cropId, timestamp: Date.now() });
    
    console.log(`🗑️ [OfflineStorage] Crop deleted: ${cropId}`);
  } catch (error) {
    console.error('❌ [OfflineStorage] Error deleting crop:', error);
  }
};

/**
 * Clear all crops from offline storage
 */
export const clearOfflineSavedCrops = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_CROPS_KEY, JSON.stringify([]));
    
    // Add to pending sync queue
    await addPendingSync({ type: 'clear', timestamp: Date.now() });
    
    console.log(`🗑️ [OfflineStorage] All offline crops cleared`);
  } catch (error) {
    console.error('❌ [OfflineStorage] Error clearing offline crops:', error);
  }
};

/**
 * Get pending sync operations
 */
export const getPendingSyncs = async (): Promise<PendingSync[]> => {
  try {
    const data = await AsyncStorage.getItem(SYNC_PENDING_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ [OfflineStorage] Error getting pending syncs:', error);
    return [];
  }
};

/**
 * Add a pending sync operation
 */
const addPendingSync = async (sync: PendingSync): Promise<void> => {
  try {
    const pending = await getPendingSyncs();
    pending.push(sync);
    await AsyncStorage.setItem(SYNC_PENDING_KEY, JSON.stringify(pending));
    console.log(`📤 [OfflineStorage] Added pending sync: ${sync.type}`);
  } catch (error) {
    console.error('❌ [OfflineStorage] Error adding pending sync:', error);
  }
};

/**
 * Clear pending sync operations
 */
export const clearPendingSyncs = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(SYNC_PENDING_KEY, JSON.stringify([]));
    console.log(`✅ [OfflineStorage] Pending syncs cleared`);
  } catch (error) {
    console.error('❌ [OfflineStorage] Error clearing pending syncs:', error);
  }
};

/**
 * Update last sync timestamp
 */
export const setLastSyncTime = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error) {
    console.error('❌ [OfflineStorage] Error setting last sync time:', error);
  }
};

/**
 * Get last sync timestamp
 */
export const getLastSyncTime = async (): Promise<number | null> => {
  try {
    const time = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return time ? parseInt(time, 10) : null;
  } catch {
    return null;
  }
};

/**
 * Check if sync is needed (more than 5 minutes since last sync)
 */
export const isSyncNeeded = async (): Promise<boolean> => {
  const lastSync = await getLastSyncTime();
  if (!lastSync) return true;
  
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - lastSync > fiveMinutes;
};
