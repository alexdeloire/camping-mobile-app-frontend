import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, Platform, Alert, TouchableWithoutFeedback, } from 'react-native';
import { API_BASE_URL } from '@env';
import NewRentalView from "./NewRentalView";
import { useNavigation } from '@react-navigation/native';
import { selectAuth } from '../store/authSlice';
import { useSelector } from 'react-redux';
import Loading from "../components/Loading";
import axios from 'axios';

const MyRentalsView = () => {
  const { token, userId } = useSelector(selectAuth);

  const [locations, setLocations] = useState([]);
  const [selectedView, setSelectedView] = useState('MyRentalsView');
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    if(selectedView != 'NewRentalView'){
      fetchLocations();
    }
  }, [selectedView]);
  
  const fetchLocations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/locations/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch locations:", errorData);
        throw new Error("Erreur lors de la récupération des locations");
      }

      const data = await response.json();
      console.log("User's location:", data);
      setIsLoading(false)
      setLocations(data);
    } catch (error) {
      console.error('There was a problem fetching the locations:', error);
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
            onPress={() => navigation.navigate('LocationDetailsView', { item, navigation, canBook: false, canDelete: item.isAvailable })}
          >Show Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

 return (
  isLoading ? (
    <Loading message="Loading locations..." color='#006400' style={styles.container} />
  ) : (
  <View style={styles.container}>
    {selectedView == 'MyRentalsView' ? 
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.detailsButton}>
        <Text 
          style={styles.detailsButtonText}
          onPress={() => setSelectedView('NewRentalView')}
        >New Rental</Text>
        </TouchableOpacity>

        {locations.length > 0 ? (
        <FlatList
          data={locations}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.locationId.toString()}
          contentContainerStyle={styles.listContent}
        />):(
          <Text>No locations found</Text>
        )}
      </View>
      :
      <NewRentalView 
        setSelectedView={setSelectedView}
      />
    }
  </View>
  ))
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  detailsButton: {
    backgroundColor: '#006400',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginVertical: 10,
    alignSelf: 'flex-end',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  listContent: {
    // paddingHorizontal: 16,
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
  // detailsButton: {
  //   backgroundColor: '#006400',
  //   paddingVertical: 6,
  //   paddingHorizontal: 12,
  //   borderRadius: 5,
  //   marginTop: 10,
  //   alignSelf: 'flex-end',
  // },
  // detailsButtonText: {
  //   color: '#fff',
  //   fontWeight: 'bold',
  //   fontSize: 12,
  // },
})

export default MyRentalsView;