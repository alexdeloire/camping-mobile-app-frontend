import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, StyleSheet, Dimensions,   } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import CalendarPicker from 'react-native-calendar-picker';
import axios from 'axios';
import { selectAuth } from '../store/authSlice';
import { useSelector } from 'react-redux';
import Loading from '../components/Loading';

const ExploreView = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [numTravellers, setNumTravellers] = useState(1);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(0);
  const [showFilterDetails, setShowFilterDetails] = useState(false);

  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const { token, userId } = useSelector(selectAuth);

  const [isLoading, setIsLoading] = useState(true);

  const fetchLocations = async () => {
    setIsLoading(true);
    setShowFilterDetails(false);
    try {
      const response = await axios.get(`${API_BASE_URL}/locations/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setLocations(data);
      setFilteredLocations(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des locations :", error);
    }
  };

  // useEffect(() => {
  //   fetchLocations();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLocations(); 
    }, [])
  );

  const onHeaderLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setHeaderBottom(height);
  };

  const applyFilters = async () => {
    try {
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];
  
      const response = await axios.get(
        `${API_BASE_URL}/locations/filtered`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            nbPersons: numTravellers,
            name: searchText,
            startDate: start,
            endDate: end,
          },
        }
      );
  
      const data = response.data;
      setShowFilterDetails(true);
      setLocations(data);
      setFilteredLocations(data);
      setIsFilterVisible(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des locations :", error);
    }
  };
  
  const renderLocationItem = ({ item }) => (
    <View style={styles.locationCard}>
      <Image
        source={
          item.images[0].data? 
          { uri: `data:image/jpeg;base64,${item.images[0].data}` }
          : require('../../assets/location/photo1.jpg')
        }
        style={styles.locationImage}
      />
      <View style={styles.locationContent}>
        <Text style={styles.locationTitle}>{item.name}</Text>
        <Text style={styles.locationDescription}>
          {item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description}
        </Text>
        <TouchableOpacity style={styles.detailsButton}>
          <Text 
            style={styles.detailsButtonText}
            onPress={() => navigation.navigate('LocationDetailsView', { item, navigation, startDate, endDate, numTravellers, canBook: true })}
          >Show Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const onDateChange = (date, type) => {
    if (type === 'START_DATE') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  return (
    isLoading ? (
      <Loading message="Loading locations..." color='#006400' />
    ) : (
    <View style={styles.container}>
      <View style={styles.header} onLayout={onHeaderLayout}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={20} color="gray" />
          <TextInput
            style={styles.searchInput}
            placeholder="Find a place"
            value={searchText}
            onChangeText={(text) =>  {setSearchText(text); (text != ''|| null) && setIsFilterVisible(true)} }
          />
          <TouchableOpacity onPress={() => {setIsFilterVisible(!isFilterVisible); setShowCalendarPicker(false)}}>
            <Ionicons name="settings" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
      {showFilterDetails && (
        <View style={{marginHorizontal:16, marginBottom:20}}>
          <Text style={styles.filterTitle}>Results for : </Text>
          <View style={{flexDirection:'row', flexWrap:'wrap', alignItems:'center'}}>
            <Text>{searchText !== '' && `"${searchText}", `} 
                  "{startDate.toISOString().split('T')[0]} - {endDate.toISOString().split('T')[0]}",
                  "{numTravellers} pers"
            </Text>
            <TouchableOpacity onPress={() => fetchLocations(false)}>
              <Ionicons name="close-circle" size={20} color="gray" style={{ marginLeft: 8 }}/>
            </TouchableOpacity>
          </View>
        </View>
      )}


      {isFilterVisible && (
        <View style={[styles.filterContainer,{top: headerBottom+10}]}>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <Text style={styles.filterTitle}>Settings</Text>
            <Ionicons name="calendar-outline" size={22} color="gray" onPress={() => setShowCalendarPicker(!showCalendarPicker)}/>
          </View>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Start date:</Text>
            <TouchableOpacity onPress={() => setShowCalendarPicker(!showCalendarPicker)} style={styles.selectedDate}>
              <Text style={styles.dateText}>{startDate ? startDate.toISOString().split('T')[0] : 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>End date:</Text>
            <TouchableOpacity onPress={() => setShowCalendarPicker(!showCalendarPicker)} style={styles.selectedDate}>
              <Text style={styles.dateText}>{endDate ? endDate.toISOString().split('T')[0] : 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Number of travellers:</Text>
            <View style={styles.travellerSelector}>
              <TouchableOpacity onPress={() => setNumTravellers(Math.max(1, numTravellers - 1))}>
                <Text style={styles.selectorButton}>-</Text>
              </TouchableOpacity>
              <Text style={styles.input}>{numTravellers}</Text>
              <TouchableOpacity onPress={() => setNumTravellers(numTravellers + 1)}>
                <Text style={styles.selectorButton}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          {showCalendarPicker && (
            <View style={styles.datePicker}>
              <CalendarPicker
                startFromMonday={true}
                allowRangeSelection={true}
                minDate={new Date()}
                onDateChange={onDateChange}
                selectedDayColor="#66CDAA"
                selectedDayTextColor="#FFFFFF"
                todayBackgroundColor="#e6ffe6"
                todayTextStyle={{ color: '#006400' }}
                textStyle={styles.dayText}
                width={screenWidth * 0.8 > 500 ? 500 : screenWidth * 0.8}
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.searchButton,
              (!startDate || !endDate || numTravellers < 1) && styles.disabledButton
            ]}
            onPress={applyFilters}
            disabled={!startDate || !endDate || numTravellers < 1}
          >
            <Text style={styles.searchButtonText}>RESEARCH</Text>
          </TouchableOpacity>
        </View>
      )}

    {filteredLocations.length > 0 ? (
      <FlatList
        data={filteredLocations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.locationId.toString()}
        contentContainerStyle={styles.listContent}
      />):(
        <Text style={styles.header}>No locations found</Text>
      )}
    </View>)
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    position: 'relative',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },

  filterContainer: {
    backgroundColor: '#cdc7c7',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    position:'absolute', 
    zIndex: 1,
    left: 0,
    right: 0,
  },

  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 10,
  },
  filterField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#444',
  },
  selectedDate: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  datePicker: {
    backgroundColor: '#ffffff',
    zIndex: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  dayText: {
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#444',
  },
  travellerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  selectorButton: {
    fontSize: 20,
    color: '#006400'
  },
  input: {
    fontSize: 14,
    marginHorizontal: 5,
    textAlign: 'center',
    minWidth: 20,
    paddingHorizontal: 15,
    paddingVertical: 2,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: '#006400',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9', 
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#e6f4ec',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
  },
  locationImage: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    marginLeft: 10,
  },
  locationContent: {
    flex: 1,
    padding: 10,
  },
  locationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  locationDescription: {
    fontSize: 12,
    color: '#555',
  },
  detailsButton: {
    backgroundColor: '#006400',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default ExploreView;
