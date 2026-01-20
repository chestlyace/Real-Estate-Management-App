import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { propertyService } from '../services/property.service';

// Note: This mirrors the TypeScript interface you shared, but in JS.
const initialFilters = {
  location: '',
  checkIn: null,
  checkOut: null,
  guests: 1,
  priceRange: [0, 10000000],
  propertyTypes: [],
  bedrooms: 0,
  bathrooms: 0,
  amenities: [],
  instantBooking: false,
};

const POPULAR_LOCATIONS = [
  'Yaoundé',
  'Douala',
  'Bamenda',
  'Limbe',
  'Buea',
  'Kribi',
];

const PROPERTY_TYPES = ['House', 'Apartment', 'Villa', 'Land', 'Commercial'];

const AMENITIES = ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Washer'];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price_low_high', label: 'Price: Low to High' },
  { id: 'price_high_low', label: 'Price: High to Low' },
];

const ExploreScreen = ({ navigation }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');

  const [showSkeleton, setShowSkeleton] = useState(false);

  const locationSuggestions = useMemo(() => {
    if (!locationQuery) return [];
    const q = locationQuery.toLowerCase();
    return POPULAR_LOCATIONS.filter((loc) => loc.toLowerCase().includes(q));
  }, [locationQuery]);

  const mappedApiFilters = useMemo(() => {
    const apiFilters = {};
    if (filters.location) apiFilters.city = filters.location;
    if (searchQuery) apiFilters.search = searchQuery;

    const [minPrice, maxPrice] = filters.priceRange;
    if (minPrice > 0) apiFilters.minPrice = minPrice;
    if (maxPrice && maxPrice < 10000000) apiFilters.maxPrice = maxPrice;

    if (filters.propertyTypes.length > 0) {
      const primaryType = filters.propertyTypes[0];
      const map = {
        House: 'house',
        Apartment: 'apartment',
        Villa: 'house',
        Land: 'land',
        Commercial: 'commercial',
      };
      apiFilters.propertyType = map[primaryType] || primaryType.toLowerCase();
    }

    if (filters.bedrooms > 0) apiFilters.bedrooms = filters.bedrooms;
    if (filters.bathrooms > 0) apiFilters.bathrooms = filters.bathrooms;
    if (filters.guests > 1) apiFilters.max_guests = filters.guests;
    if (filters.amenities.length > 0) apiFilters.amenities = filters.amenities.join(',');
    if (filters.instantBooking) apiFilters.instant_booking = true;

    return apiFilters;
  }, [filters, searchQuery]);

  const sortedResults = useMemo(() => {
    if (!results || results.length === 0) return [];
    const copy = [...results];
    if (sortBy === 'price_low_high') {
      copy.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_high_low') {
      copy.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return copy;
  }, [results, sortBy]);

  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setShowSkeleton(true);

      const data = await propertyService.getAllProperties(mappedApiFilters);
      const array = Array.isArray(data) ? data : data?.properties || [];
      setResults(array);
    } catch (e) {
      console.error('Explore search error', e);
      setError(e.message || 'Failed to load properties');
      setResults([]);
    } finally {
      setLoading(false);
      setTimeout(() => setShowSkeleton(false), 400);
    }
  }, [mappedApiFilters]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const onChangeCheckIn = (event, selectedDate) => {
    const currentDate = selectedDate || filters.checkIn || new Date();
    if (Platform.OS !== 'ios') setShowCheckInPicker(false);
    setFilters((prev) => ({
      ...prev,
      checkIn: currentDate,
      checkOut: prev.checkOut && prev.checkOut < currentDate ? null : prev.checkOut,
    }));
  };

  const onChangeCheckOut = (event, selectedDate) => {
    const currentDate = selectedDate || filters.checkOut || new Date();
    if (Platform.OS !== 'ios') setShowCheckOutPicker(false);
    setFilters((prev) => ({
      ...prev,
      checkOut: currentDate,
    }));
  };

  const formatDate = (date) => {
    if (!date) return 'Add date';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Add date';
    }
  };

  const handleApplyFiltersFromSheet = (newFilters) => {
    setFilters(newFilters);
    setShowFiltersSheet(false);
    performSearch();
  };

  const handleSelectLocation = (loc) => {
    setLocationQuery(loc);
    setFilters((prev) => ({ ...prev, location: loc }));
    setShowLocationSuggestions(false);
  };

  const handleGuestChange = (delta) => {
    setFilters((prev) => {
      const next = Math.max(1, prev.guests + delta);
      return { ...prev, guests: next };
    });
  };

  const renderResultItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('PropertyDetails', { property: item })}
    >
      <View style={styles.resultImagePlaceholder}>
        <Ionicons name="home-outline" size={32} color="#4A90E2" />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.name || 'Property'}</Text>
        <View style={styles.resultLocationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color="#A0A0A0"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.resultLocationText}>
            {item.city || item.location || 'Location not specified'}
          </Text>
        </View>
        <Text style={styles.resultPriceText}>
          {parseInt(item.price || 0, 10).toLocaleString()} FCFA
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSkeletonItem = (_, index) => (
    <View key={index} style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonTextLine} />
      <View style={[styles.skeletonTextLine, { width: '40%' }]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchCard}>
          <Text style={styles.sectionLabel}>Search</Text>
          <View style={styles.locationRow}>
            <Ionicons name="search" size={18} color="#666" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="e.g. Villa with pool"
              placeholderTextColor="#666"
              style={styles.input}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text style={styles.sectionLabel}>Where</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color="#666" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Search destination"
                placeholderTextColor="#666"
                style={styles.input}
                value={locationQuery}
                onChangeText={(text) => {
                  setLocationQuery(text);
                  setShowLocationSuggestions(true);
                }}
              />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {locationSuggestions.map((loc) => (
                    <TouchableOpacity
                      key={loc}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectLocation(loc)}
                    >
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color="#666"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.suggestionText}>{loc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.sectionLabel}>Check-in</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCheckInPicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#666"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.dateText}>{formatDate(filters.checkIn)}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.column}>
              <Text style={styles.sectionLabel}>Check-out</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCheckOutPicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#666"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.dateText}>{formatDate(filters.checkOut)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.sectionLabel}>Guests</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleGuestChange(-1)}
                >
                  <Ionicons name="remove" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{filters.guests}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleGuestChange(1)}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.column}>
              <Text style={styles.sectionLabel}>Search</Text>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={performSearch}
              >
                <Ionicons
                  name="search-outline"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.advancedFiltersButton}
            onPress={() => setShowFiltersSheet(true)}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color="#4A90E2"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.advancedFiltersText}>More filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.resultsCount}>
              {sortedResults.length} places found
            </Text>
            {loading && (
              <ActivityIndicator
                size="small"
                color="#4A90E2"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          <View style={styles.sortContainer}>
            <Ionicons name="swap-vertical-outline" size={18} color="#A0A0A0" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.sortChip,
                    sortBy === opt.id && styles.sortChipActive,
                  ]}
                  onPress={() => setSortBy(opt.id)}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      sortBy === opt.id && styles.sortChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {showSkeleton ? (
          <View>
            {[0, 1, 2].map(renderSkeletonItem)}
          </View>
        ) : (
          <FlatList
            data={sortedResults}
            keyExtractor={(item) => item.id || item._id || String(item.created_at || Math.random())}
            renderItem={renderResultItem}
            scrollEnabled={false}
            ListEmptyComponent={
              !loading && (
                <Text style={styles.emptyText}>
                  No properties match your search. Try adjusting your filters.
                </Text>
              )
            }
          />
        )}
      </ScrollView>

      {showCheckInPicker && (
        <DateTimePicker
          value={filters.checkIn || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onChangeCheckIn}
          minimumDate={new Date()}
        />
      )}

      {showCheckOutPicker && (
        <DateTimePicker
          value={filters.checkOut || (filters.checkIn || new Date())}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onChangeCheckOut}
          minimumDate={filters.checkIn || new Date()}
        />
      )}

      <SearchFiltersSheet
        visible={showFiltersSheet}
        filters={filters}
        onApply={handleApplyFiltersFromSheet}
        onClose={() => setShowFiltersSheet(false)}
      />
    </SafeAreaView>
  );
};

const SearchFiltersSheet = ({ visible, filters, onApply, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters || initialFilters);

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters || initialFilters);
    }
  }, [visible, filters]);

  const toggleArrayItem = (key, value) => {
    setLocalFilters((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(value);
      const next = exists ? current.filter((x) => x !== value) : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sheetSectionLabel}>Price range (FCFA)</Text>
            <View style={styles.priceRangeRow}>
              <Text style={styles.priceRangeText}>
                {localFilters.priceRange[0].toLocaleString()}
              </Text>
              <Text style={styles.priceRangeText}>
                {localFilters.priceRange[1].toLocaleString()}
              </Text>
            </View>
            <Slider
              minimumValue={0}
              maximumValue={10000000}
              step={50000}
              value={localFilters.priceRange[0]}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="#333"
              thumbTintColor="#4A90E2"
              onValueChange={(val) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  priceRange: [Math.min(val, prev.priceRange[1]), prev.priceRange[1]],
                }))
              }
            />
            <Slider
              minimumValue={0}
              maximumValue={10000000}
              step={50000}
              value={localFilters.priceRange[1]}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="#333"
              thumbTintColor="#4A90E2"
              onValueChange={(val) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], Math.max(val, prev.priceRange[0])],
                }))
              }
            />

            <Text style={styles.sheetSectionLabel}>Property type</Text>
            <View style={styles.chipGroup}>
              {PROPERTY_TYPES.map((type) => {
                const selected = localFilters.propertyTypes.includes(type);
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleArrayItem('propertyTypes', type)}
                  >
                    <Ionicons
                      name={selected ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={selected ? '#FFFFFF' : '#A0A0A0'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sheetSectionLabel}>Bedrooms & Bathrooms</Text>
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.counterLabel}>Bedrooms</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={styles.counterButtonSmall}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        bedrooms: Math.max(0, prev.bedrooms - 1),
                      }))
                    }
                  >
                    <Ionicons name="remove" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{localFilters.bedrooms}</Text>
                  <TouchableOpacity
                    style={styles.counterButtonSmall}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        bedrooms: prev.bedrooms + 1,
                      }))
                    }
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.column}>
                <Text style={styles.counterLabel}>Bathrooms</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={styles.counterButtonSmall}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        bathrooms: Math.max(0, prev.bathrooms - 1),
                      }))
                    }
                  >
                    <Ionicons name="remove" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{localFilters.bathrooms}</Text>
                  <TouchableOpacity
                    style={styles.counterButtonSmall}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        bathrooms: prev.bathrooms + 1,
                      }))
                    }
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.sheetSectionLabel}>Amenities</Text>
            <View style={styles.chipGroup}>
              {AMENITIES.map((amenity) => {
                const selected = localFilters.amenities.includes(amenity);
                return (
                  <TouchableOpacity
                    key={amenity}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleArrayItem('amenities', amenity)}
                  >
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={selected ? '#FFFFFF' : '#A0A0A0'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
                      ]}
                    >
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.instantRow}>
              <View>
                <Text style={styles.sheetSectionLabel}>Instant booking</Text>
                <Text style={styles.instantSubtitle}>
                  Only show places you can book without waiting for approval
                </Text>
              </View>
              <Switch
                value={localFilters.instantBooking}
                onValueChange={(val) =>
                  setLocalFilters((prev) => ({ ...prev, instantBooking: val }))
                }
                thumbColor={localFilters.instantBooking ? '#4A90E2' : '#f4f3f4'}
                trackColor={{ false: '#767577', true: '#2C5F9E' }}
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.applyFiltersButton} onPress={handleApply}>
            <Text style={styles.applyFiltersText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  searchCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 0,
  },
  suggestionsBox: {
    marginTop: 8,
    backgroundColor: '#181818',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  column: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  advancedFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  advancedFiltersText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginLeft: 8,
  },
  sortChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  sortChipText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 8,
  },
  emptyText: {
    color: '#A0A0A0',
    marginTop: 12,
    textAlign: 'center',
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultLocationText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  resultPriceText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skeletonCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  skeletonImage: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    marginBottom: 8,
  },
  skeletonTextLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
    marginBottom: 6,
    width: '60%',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sheetSectionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 6,
  },
  priceRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceRangeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  chipSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  chipText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  counterLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 4,
  },
  instantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  instantSubtitle: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 2,
    maxWidth: 220,
  },
  applyFiltersButton: {
    marginTop: 16,
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyFiltersText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExploreScreen;


