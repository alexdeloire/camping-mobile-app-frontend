import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, Platform, Alert, TouchableWithoutFeedback,ScrollView } from 'react-native';
import { API_BASE_URL } from '@env';
import { selectAuth } from '../store/authSlice';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Loading from '../components/Loading';
import { set } from 'date-fns';

const BookingRequestView = () => {
  const { token, userId } = useSelector(selectAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [currentReservations, setCurrentReservations] = useState([]);
  const [passedReservations, setPassedReservations] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchLocations();
  }, []);
  
  useEffect(() => {
    if (locations.length > 0) {
      setIsLoading(true);
      fetchReservations();
      setIsLoading(false);
    }else{
  
    }
  }, [locations]);

  const fetchLocations = async () => {  
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/locations/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Ajouter le token dans les headers
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched locations:", data);
      setLocations(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }   
  };

  const fetchReservations = async () => {
    try {
      const locationIds = locations.map(location => location.locationId);
      setCurrentReservations([]);
      setPassedReservations([]);
      
      if (locationIds.length === 0) {
        console.log("No location IDs available to fetch reservations.");
        return;
      }
      
      const queryParams = locationIds.join(",");
      const response = await fetch(`${API_BASE_URL}/reservations/locations?locationIds=${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch reservations: ${response.status}`);
          }
          console.log("Fetching reservations...");
          if (response.status === 204 || response.status === 205 || response.headers.get('content-length') === '0') {
            console.log('No content to parse');
            return null;
          }
          const data = await response.json();
          console.log("Fetching reservations1...");
        if(data.length > 0){
          console.log("Fetched reservations:", data);
          data.forEach(reservation => {
            reservation.location = locations.find(location => location.locationId === reservation.locationId);
            console.log('Reservation with location:', reservation);
            
            
              if (["PENDING", "CONFIRMED"].includes(reservation.state)) {
                setCurrentReservations(prevReservations => [...prevReservations, reservation]);
              } else {
                setPassedReservations(prevReservations => [...prevReservations, reservation]);
              }
            });
          }
        setIsLoading(false);
    } catch (error) {
        console.error('There was a problem fetching the reservations:', error);
    }
  };
  
  const renderLocationItem = ({ item }) => {
    const handleUpdateReservationState = async (newState) => {
      try {
        const response = await fetch(`${API_BASE_URL}/reservations/${item.reservationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Assurez-vous que le token est correctement défini
          },
          body: JSON.stringify({ ...item, state: newState }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update reservation state');
        }
  
        const updatedReservation = await response.json();
        console.log('Updated Reservation:', updatedReservation);
        // Mettre à jour l'affichage local en cas de succès
        fetchReservations(); // Refetch les réservations pour rafraîchir l'UI
      } catch (error) {
        console.error('Error updating reservation state:', error);
      }
    };
  
    return (
      <View>
        <TouchableOpacity 
          style={styles.locationCard}
          onPress={() => navigation.navigate('BookingRequestDetailsView', { item, navigation })}>
        <Image
          source={
            item.location?.images[0].data? 
            { uri: `data:image/jpeg;base64,${item.location.images[0].data}` }
            : require('../../assets/location/photo1.jpg')
          }
          style={styles.locationImage}
        />
        <View style={styles.locationContent}>
          <Text style={styles.locationTitle}>{item.location.name}</Text>
          <Text style={styles.locationDescription}>User {item.userId}</Text>
          <Text style={styles.locationDescription}>{item.nbPersons} Persons</Text>
          <Text style={styles.locationDescription}>
            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
          </Text>
          <Text style={styles.locationDescription}>Message: {item.messageRequest}</Text>
          </View>
  
          {item.state === 'PENDING' ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleUpdateReservationState('CONFIRMED')}
              >
                <Ionicons name="checkmark" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleUpdateReservationState('REFUSED')}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stateContainer}>
              <Text style={styles.reservationState}>
                {item.state}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  return(
    isLoading ? (
        <Loading message="Loading requests..." color='#006400' />
      ) : (
    <ScrollView style={styles.container}>
       <Text style={styles.sectionTitle}>Current</Text>
      {currentReservations.length > 0 ?(
        <View>
          <FlatList
            data={currentReservations}
            renderItem={renderLocationItem}
            keyExtractor={(item) => item.reservationId.toString()}
            contentContainerStyle={styles.listContent}
          />
        </View>
        ):(
        <Text>No Reservation found</Text>
      )}
      <Text style={styles.sectionTitle}>History</Text>
      {passedReservations.length > 0 ?(
        <View>
          <FlatList
            data={passedReservations}
            renderItem={renderLocationItem}
            keyExtractor={(item) => item.reservationId.toString()}
            contentContainerStyle={styles.listContent}
          />
        </View>
        ):(
        <Text>No Reservation found</Text>
      )}
    
    </ScrollView>

    )
  )
}
const styles = StyleSheet.create({
 container: {
   flex: 1,
   padding: 0,
 },
 sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginVertical: 10,
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
actionButtons: {
  flexDirection: 'column',
  marginVertical: 5,
},
confirmButton: {
  backgroundColor: '#006400',
  padding: 10,
  borderRadius: 50,
  marginRight: 10,
  marginBottom: 5,
},
rejectButton: {
  backgroundColor: '#FF0000',
  padding: 10,
  borderRadius: 50,
  marginRight: 10,
},
stateContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
  marginRight: 10,
},
reservationState: {
  position: 'absolute',
  top: 5,
  right: 0,
  fontSize: 12,
  color: '#006400',
  fontWeight: 'bold',
},
}
)

export default BookingRequestView;
