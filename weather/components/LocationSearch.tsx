import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Keyboard, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchLocations, getCityCoordinates, LocationResult } from '../api';

interface Props {
  onSelect: (coords: { latitude: number; longitude: number }, locationName: string) => void;
}

export const LocationSearch: React.FC<Props> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Try online geocoding first
      const results = await searchLocations(searchQuery);
      
      if (results.length > 0) {
        setSearchResults(results);
      } else {
        // Fallback to offline city lookup
        const coords = getCityCoordinates(searchQuery);
        if (coords) {
          setSearchResults([{
            name: searchQuery,
            country: '',
            latitude: coords.latitude,
            longitude: coords.longitude,
          }]);
        } else {
          setSearchResults([]);
        }
      }
    } catch (err) {
      // Fallback to offline city lookup
      console.error('Search error:', err);
      const coords = getCityCoordinates(searchQuery);
      if (coords) {
        setSearchResults([{
          name: searchQuery,
          country: '',
          latitude: coords.latitude,
          longitude: coords.longitude,
        }]);
      } else {
        setSearchResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (location: LocationResult) => {
    onSelect(
      { latitude: location.latitude, longitude: location.longitude },
      location.name
    );
    setQuery('');
    setIsExpanded(false);
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const closeSearch = () => {
    setIsExpanded(false);
    setQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity
        className="bg-gray-800/60 rounded-2xl px-2 py-4 mb-4 border border-gray-700/50 flex-row items-center justify-between"
        onPress={() => setIsExpanded(true)}
      >
        <View className="flex-row items-center">
          <View className="bg-green-500/20 rounded-lg p-2 mr-3">
            <Ionicons name="search" size={20} color="#10B981" />
          </View>
          <View>
            <Text className="text-white font-semibold">Search Location</Text>
            <Text className="text-gray-400 text-sm">Find weather for any city</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-gray-800/60 rounded-2xl px-2 py-4 mb-4 border border-gray-700/50">
      <View className="flex-row items-center mb-3">
        <View className="bg-green-500/20 rounded-lg p-2 mr-3">
          <Ionicons name="search" size={20} color="#10B981" />
        </View>
        <Text className="text-white font-semibold">Search Location</Text>
        <TouchableOpacity className="ml-auto" onPress={closeSearch}>
          <Ionicons name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-row mb-3">
        <TextInput
          className="flex-1 bg-gray-700/70 text-white px-2 py-3 rounded-xl mr-2 border border-gray-600/50"
          placeholder="Enter city name (e.g. London, New York)"
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            handleSearch(text);
          }}
          returnKeyType="search"
          autoFocus
        />
        {isLoading && (
          <View className="bg-gray-700 px-5 rounded-xl justify-center items-center">
            <Ionicons name="reload" size={20} color="#9CA3AF" />
          </View>
        )}
      </View>

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-gray-700/50 rounded-xl p-3 mb-2 flex-row items-center justify-between"
              onPress={() => handleSelectLocation(item)}
            >
              <View className="flex-1">
                <Text className="text-white font-medium">{item.name}</Text>
                {item.country && (
                  <Text className="text-gray-400 text-sm">{item.country}</Text>
                )}
              </View>
              <Ionicons name="location" size={16} color="#10B981" />
            </TouchableOpacity>
          )}
          style={{ maxHeight: 200 }}
          nestedScrollEnabled
        />
      )}

      {query.length > 0 && searchResults.length === 0 && !isLoading && (
        <View className="bg-gray-700/30 rounded-xl p-4">
          <Text className="text-gray-400 text-center text-sm">
            No locations found. Try searching for major cities like Lusaka, London, or New York.
          </Text>
        </View>
      )}
      
      <Text className="text-gray-400 text-xs mt-2 text-center">
        Search for any city worldwide to get weather information
      </Text>
    </View>
  );
};
