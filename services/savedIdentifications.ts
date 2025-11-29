import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export interface SavedDiseaseIdentification {
  id: string;
  type: 'disease';
  imageUri: string;
  timestamp: string;
  diseaseName: string;
  confidence: string;
  severity: string;
  affectedCrop: string;
  symptoms: string[];
  treatment: string[];
  organicSolutions: string[];
  prevention: string[];
}

export interface SavedPestIdentification {
  id: string;
  type: 'pest';
  imageUri: string;
  timestamp: string;
  pestName: string;
  scientificName: string;
  confidence: string;
  severity: string;
  affectedCrops: string[];
  lifeStage: string;
  biologicalControl: string[];
  chemicalControl: string[];
  preventionMethods: string[];
}

export type SavedIdentification = SavedDiseaseIdentification | SavedPestIdentification;

const STORAGE_KEY = '@agricast_saved_identifications';
const IMAGE_DIR = `${FileSystem.documentDirectory}saved_identifications/`;

// Ensure the image directory exists
const ensureImageDirectory = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
};

// Save image to persistent storage and return the new URI
const saveImageToPersistentStorage = async (sourceUri: string, id: string): Promise<string> => {
  try {
    await ensureImageDirectory();
    
    // Extract file extension from source URI
    const extension = sourceUri.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `${id}.${extension}`;
    const destUri = `${IMAGE_DIR}${fileName}`;
    
    // Check if source file exists
    const sourceInfo = await FileSystem.getInfoAsync(sourceUri);
    if (!sourceInfo.exists) {
      console.warn('Source image does not exist:', sourceUri);
      return sourceUri; // Return original URI as fallback
    }
    
    // Copy the image to persistent storage
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destUri,
    });
    
    console.log('Image saved to persistent storage:', destUri);
    return destUri;
  } catch (error) {
    console.error('Error saving image to persistent storage:', error);
    return sourceUri; // Return original URI as fallback
  }
};

// Delete image from persistent storage
const deleteImageFromStorage = async (imageUri: string): Promise<void> => {
  try {
    if (imageUri.startsWith(IMAGE_DIR)) {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(imageUri);
        console.log('Image deleted from persistent storage:', imageUri);
      }
    }
  } catch (error) {
    console.error('Error deleting image from storage:', error);
  }
};

// Save a disease identification
export const saveDiseaseIdentification = async (
  imageUri: string,
  result: {
    diseaseName: string;
    confidence: string;
    severity: string;
    affectedCrop: string;
    symptoms: string[];
    treatment: string[];
    organicSolutions: string[];
    prevention: string[];
  }
): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const savedIdentifications: SavedIdentification[] = existingData 
      ? JSON.parse(existingData) 
      : [];

    const id = `disease_${Date.now()}`;
    
    // Save image to persistent storage
    const persistentImageUri = await saveImageToPersistentStorage(imageUri, id);

    const newIdentification: SavedDiseaseIdentification = {
      id,
      type: 'disease',
      imageUri: persistentImageUri,
      timestamp: new Date().toISOString(),
      diseaseName: result.diseaseName,
      confidence: result.confidence,
      severity: result.severity,
      affectedCrop: result.affectedCrop,
      symptoms: result.symptoms,
      treatment: result.treatment,
      organicSolutions: result.organicSolutions,
      prevention: result.prevention,
    };

    savedIdentifications.unshift(newIdentification);
    
    // Keep only last 50 identifications
    const limitedIdentifications = savedIdentifications.slice(0, 50);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limitedIdentifications));
  } catch (error) {
    console.error('Error saving disease identification:', error);
    throw error;
  }
};

// Save a pest identification
export const savePestIdentification = async (
  imageUri: string,
  result: {
    pestName: string;
    scientificName: string;
    confidence: string;
    severity: string;
    affectedCrops: string[];
    lifeStage: string;
    biologicalControl: string[];
    chemicalControl: string[];
    preventionMethods: string[];
  }
): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const savedIdentifications: SavedIdentification[] = existingData 
      ? JSON.parse(existingData) 
      : [];

    const id = `pest_${Date.now()}`;
    
    // Save image to persistent storage
    const persistentImageUri = await saveImageToPersistentStorage(imageUri, id);

    const newIdentification: SavedPestIdentification = {
      id,
      type: 'pest',
      imageUri: persistentImageUri,
      timestamp: new Date().toISOString(),
      pestName: result.pestName,
      scientificName: result.scientificName,
      confidence: result.confidence,
      severity: result.severity,
      affectedCrops: result.affectedCrops,
      lifeStage: result.lifeStage,
      biologicalControl: result.biologicalControl,
      chemicalControl: result.chemicalControl,
      preventionMethods: result.preventionMethods,
    };

    savedIdentifications.unshift(newIdentification);
    
    // Keep only last 50 identifications
    const limitedIdentifications = savedIdentifications.slice(0, 50);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limitedIdentifications));
  } catch (error) {
    console.error('Error saving pest identification:', error);
    throw error;
  }
};

// Get all saved identifications
export const getSavedIdentifications = async (): Promise<SavedIdentification[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting saved identifications:', error);
    return [];
  }
};

// Delete a saved identification
export const deleteSavedIdentification = async (id: string): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existingData) return;

    const savedIdentifications: SavedIdentification[] = JSON.parse(existingData);
    
    // Find the identification to delete and remove its image
    const toDelete = savedIdentifications.find(item => item.id === id);
    if (toDelete) {
      await deleteImageFromStorage(toDelete.imageUri);
    }
    
    const filtered = savedIdentifications.filter(item => item.id !== id);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting saved identification:', error);
    throw error;
  }
};

// Clear all saved identifications
export const clearAllSavedIdentifications = async (): Promise<void> => {
  try {
    // Delete all images first
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const savedIdentifications: SavedIdentification[] = JSON.parse(existingData);
      for (const identification of savedIdentifications) {
        await deleteImageFromStorage(identification.imageUri);
      }
    }
    
    // Remove the entire image directory if it exists
    try {
      const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(IMAGE_DIR);
      }
    } catch (e) {
      console.warn('Failed to delete image directory:', e);
    }
    
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing saved identifications:', error);
    throw error;
  }
};
