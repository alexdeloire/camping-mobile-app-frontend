import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const BookingConfirmationView = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo3.png')} style={styles.image} />

      <Text style={styles.title}>Congratulations!</Text>
      <Text style={styles.message}>
        Your reservation request has been successfully sent to the owner. The owner has 48 hours to respond.
      </Text>

      <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate('ExploreView')}>
        <Text style={styles.buttonText}>EXPLORE MORE</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tripsButton} onPress={() => navigation.navigate('MyTrips')}>
        <Text style={styles.buttonText}>SEE MY TRIPS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripsButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BookingConfirmationView;
