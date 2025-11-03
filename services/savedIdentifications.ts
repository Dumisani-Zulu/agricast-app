import AsyncStorage from '@react-native-async-storage/async-storage';

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

    const newIdentification: SavedDiseaseIdentification = {
      id: `disease_${Date.now()}`,
      type: 'disease',
      imageUri,
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

    const newIdentification: SavedPestIdentification = {
      id: `pest_${Date.now()}`,
      type: 'pest',
      imageUri,
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
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing saved identifications:', error);
    throw error;
  }
};
