import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,  Image, Platform, Alert, TouchableWithoutFeedback, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@env';
import * as ImagePicker from 'expo-image-picker';
import OutsidePressHandler from 'react-native-outside-press';
import Tabs from '../components/Tabs';
import MyRentalsView from './MyRentalsView';
import NewRentalView from './NewRentalView';
import BookingRequestView from './BookingRequestView';

const RentalView = () => {
 const tabs = [
  {
    label: 'My Rentals',
    content: (
      <MyRentalsView style={styles.container}/>
    ),
  },
  {
    label: 'Booking Request',
    content: <BookingRequestView style={styles.container}/>,
  },
];
return(
 <View style={styles.container}>
  <Tabs tabs={tabs} role="user" />
 </View>
)

}
const styles = StyleSheet.create({
 container: {
   flex: 1,
   padding: 16,
   // backgroundColor: '#e8f5e9',
 }
}
)

export default RentalView;