  import React from 'react';
  import { View, Text, TextInput, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
  import { useSelector } from 'react-redux';
  import { selectAuth } from '../store/authSlice';
  import { useEffect, useState } from 'react';
  import { useNavigation, useFocusEffect } from '@react-navigation/native';
  import { API_BASE_URL } from '@env';
  import axios from 'axios';
  import Loading from '../components/Loading';
import { set } from 'date-fns';

  const MyTripsView = () => {

    const { userId } = useSelector(selectAuth);
    const { token } = useSelector(selectAuth);

    const [reservations, setReservations] = useState([]);
    const [locations, setLocations] = useState([]);
    const historyStates = ['COMPLETED', 'CANCELED', 'REFUSED'];
    const [currentTrips, setCurrentTrips] = useState([]);
    const [historyTrips, setHistoryTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigation = useNavigation();

    const fetchReservations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/reservations/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(await response.data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    const fetchLocations = async () => {
      try {

        const locationsIds = reservations.map(reservation => reservation.locationId);
        if (locationsIds.length === 0) return;
        const response = await axios.get(`${API_BASE_URL}/locations/details?locationIds=${locationsIds.join(',')}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocations(await response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    }

    const joinReservationsAndLocations = () => {
      reservations.forEach(reservation => {
        const location = locations.find(location => location.locationId === reservation.locationId);
        reservation.location = location;
      });
    };

    useEffect(() => {
      setIsLoading(true);
      fetchReservations();
    }, []);

    useEffect(() => {
      if (reservations.length > 0) {
        fetchLocations();
      }else{
        setIsLoading(false);
      }
    }, [reservations]);

    useEffect(() => {
      console.log("locations", locations);
      console.log("reservations", reservations);
      if (locations.length > 0) {
        
        joinReservationsAndLocations();

        const currentTrips = reservations.filter(reservation => !historyStates.includes(reservation.state));
        const historyTrips = reservations.filter(reservation => historyStates.includes(reservation.state));
        setCurrentTrips(currentTrips);
        setHistoryTrips(historyTrips);
      }
    }, [locations]);

    useFocusEffect(
      React.useCallback(() => {
        setIsLoading(true);
        fetchReservations(); // Recharger les réservations
      }, [])
    );


    const renderReservationItem = ({ item }) => {
      // Déterminer si la réservation est dans "current" ou "history"
      const isCurrent = !historyStates.includes(item.state);
      const isCompleted = item.state === 'COMPLETED';
    
      return (
        <View style={styles.locationCard}>
          <Image
            source={
              item.location.images[0].data? 
              { uri: `data:image/jpeg;base64,${item.location.images[0].data}` }
              : require('../../assets/location/photo1.jpg')
            }
            style={styles.locationImage}
          />
          <View style={styles.locationContent}>
            <Text style={styles.locationTitle}>{item.location.name}</Text>
            <Text style={styles.dateText}>From: {item.startDate} - To: {item.endDate}</Text>
            {isCurrent ? (
              item.messageRequest ? (
                <Text style={styles.messageText}>Message: {
                  item.messageRequest.length > 30 ? item.messageRequest.substring(0, 30) + '...' : item.messageRequest
                } </Text>
              ) : (
                <Text style={styles.messageText}>No request message</Text>
              )
            ) : (
              <Text style={styles.messageText}>Host Comment: {
                !item.ratingHostComment ? 'No comment' :
                item.ratingHostComment.length > 30 ? item.ratingHostComment.substring(0, 30) + '...' : item.ratingHostComment
                }</Text>
            )}
            <Text style={styles.reservationState}>{item.state}</Text>
            {(isCompleted || isCurrent) && (
              <TouchableOpacity style={styles.detailsButton}>
                <Text
                  style={styles.detailsButtonText}
                  onPress={() => {
                    if (isCurrent) {
                      navigation.navigate('ReservationDetailsView', { item, navigation });
                    } else if (isCompleted) {
                      navigation.navigate('ReservationDetailsView', { item, navigation });
                    }
                  }}
                  >
                  {isCurrent ? 'Details' : isCompleted ? 'Review' : 'View'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    };
    

    return (
      isLoading ? (
        <Loading message="Loading my trips..." color='#006400' />
      ) : (
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Current</Text>
        {currentTrips.length > 0 ? (
        <FlatList
          data={currentTrips}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.reservationId.toString()}
          contentContainerStyle={styles.listContent}
        />):(
          <Text>No currend trips found</Text>
        )}
        
        <Text style={styles.sectionTitle}>History</Text>

        {historyTrips.length > 0 ? (
          <FlatList
          data={historyTrips}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.reservationId.toString()}
          contentContainerStyle={styles.listContent}
        />):(
          <Text>No history trips found</Text>
        )}

      </ScrollView>
      )
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 10,
      paddingHorizontal: 16,
      backgroundColor: '#f5f5f5',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 10,
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
      top: 60, 
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
      fontSize: 14,
      color: '#444',
    },
    datePicker: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      elevation: 1,
      width: 140,
      justifyContent: 'space-between',
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
    travellerNumber: {
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
      paddingBottom: 10,
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
      alignSelf: 'flex-end',
    },
    detailsButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 12,
    },
    reservationState: {
      position: 'absolute',
      top: 10,
      right: 10,
      fontSize: 12,
      color: '#006400',
      fontWeight: 'bold',
    },
    messageText: {
      fontSize: 12,
      color: '#333',
      marginTop: 8,
    },
    dateText: {
      fontSize: 12,
      color: '#555',
      marginTop: 5,
    },
    
  });

  export default MyTripsView;
