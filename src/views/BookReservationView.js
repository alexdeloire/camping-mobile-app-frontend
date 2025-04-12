import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, FlatList, Image, ScrollView, Alert } from 'react-native';
import { API_BASE_URL } from '@env';
import CalendarPicker from 'react-native-calendar-picker';
import { selectAuth } from '../store/authSlice';
import { useSelector } from 'react-redux';
import axios from 'axios';

const BookReservationView = ({ route, navigation}) => {
  const { token, userId } = useSelector(selectAuth);

  const {item, startDate: sd, endDate: ed, numTravellers: num } = route.params; 
  const [startDate, setStartDate] = useState(sd);
  const [endDate, setEndDate] = useState(ed);
  const [numTravellers, setNumTravellers] = useState(num);
  const [message, setMessage] = useState('');
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [images, setImages] = useState([]);

  const localImages = [
   require('../../assets/location/photo1.jpg'),
   require('../../assets/location/photo2.jpg'),
   require('../../assets/location/photo3.jpg')
 ];

 const screenWidth = Dimensions.get('window').width;

 const getImages = () => {
  if (item.images.length > 0 && item.images[0].data) {
    const locationImages = item.images.map(image => `data:image/jpeg;base64,${image.data}`);
    setImages(locationImages);
  }
};

 useEffect(() => {
  getImages();
  const fetchUnavailableDates = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reservations/location/${item.locationId}/pastNotRefused`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const data = response.data;

      const dates = data.map(reservation => ({
        startDate: new Date(reservation.startDate),
        endDate: new Date(reservation.endDate)
      }));
      setUnavailableDates(dates);
    } catch (error) {
      console.error("Erreur lors de la récupération des dates indisponibles :", error);
    }
  };

  fetchUnavailableDates();
}, [item.locationId]);


const isDateBlocked = (date) => {
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return unavailableDates.some(({ startDate, endDate }) => {
    const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    return normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate;
  });
};

const onDateChange = (date, type) => {
  if (type === 'START_DATE') {
    setStartDate(date);
  } else {
    setEndDate(date);
  }
};

const handleBooking = async () => {
  const reservationData = {
    userId: userId, 
    locationId: item.locationId,
    nbPersons: numTravellers,
    reservationDate: new Date().toISOString().split('T')[0], // Date actuelle
    startDate: startDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
    endDate: endDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
    messageRequest: message,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/reservations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Ajouter le token dans les headers
      },
      body: JSON.stringify(reservationData),
    });

    if (response.ok) {
      console.log("Reservation request successfully submitted.");
      navigation.navigate('BookingConfirmation'); 
    } else {
      const errorData = await response.json();
      console.error("Failed to create reservation:", errorData);
      throw new Error("Erreur lors de la création de la réservation");
    }
  } catch (error) {
    console.error("Error creating reservation:", error);
  }
};

  return (
    <ScrollView style={styles.container}>
      <View style={{ position: 'relative' }}>
        <FlatList
          data={images.length>0 ? images : localImages}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={screenWidth}
          decelerationRate="fast" 
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
            {images.length>0 ? 
              <Image source={{ uri: item }} style={styles.image} /> 
              : 
              <Image source={item} style={styles.image} />}
          </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <Text style={styles.title}>Enter information about your stay</Text>
      <Text style={styles.subtitle}>for {item.name}</Text>

       {/* <Ionicons name="calendar-outline" size={22} color="gray" onPress={() => setShowCalendarPicker(!showCalendarPicker)}/> */}
      <View style={styles.dateField}>
       <Text style={styles.label}>Start date:</Text>
       <TouchableOpacity onPress={() => setShowCalendarPicker(!showCalendarPicker)} style={styles.input}>
         <Text style={styles.dateText}>{startDate ? startDate.toISOString().split('T')[0] : 'YYYY-MM-DD'}</Text>
       </TouchableOpacity>
     </View>
     <View style={styles.dateField}>
       <Text style={styles.label}>End date:</Text>
       <TouchableOpacity onPress={() => setShowCalendarPicker(!showCalendarPicker)} style={styles.input}>
         <Text style={styles.dateText}>{endDate ? endDate.toISOString().split('T')[0] : 'YYYY-MM-DD'}</Text>
       </TouchableOpacity>
     </View>

      <View style={styles.field}>
        <Text style={styles.label}>Number of travellers</Text>
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
            disabledDates={isDateBlocked}
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

      <View style={styles.messageField}>
       <Text style={styles.label}>Message</Text>
       <TextInput
         style={[styles.messageInput, { height: 100 }]} // Ajustez la hauteur pour plus de lignes
         multiline
         numberOfLines={4} // Nombre de lignes affichées initialement
         value={message}
         onChangeText={setMessage}
         placeholder="Enter your message"
         textAlignVertical="top" // Aligne le texte en haut
       />
     </View>


      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Text style={styles.bookButtonText}>BOOK NOW</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
   width: screenWidth,
   alignItems: 'center',
 },
 image: {
   width: screenWidth,
   height: 300,
   alignSelf: 'center',
 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop:10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  dateField: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   marginBottom: 8,
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
  field: {
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageField: {
   marginBottom: 20,
 },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    height: 100,
  },
  bookButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  travellerSelector: {
   flexDirection: 'row',
   alignItems: 'center',
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
   backgroundColor: '#fff',
   borderWidth: 1,
   borderColor: '#ccc',
   borderRadius: 5,
 },
});

export default BookReservationView;
