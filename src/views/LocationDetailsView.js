import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@env';
import axios from 'axios';
import { selectAuth } from '../store/authSlice';
import { useSelector } from 'react-redux';

const LocationDetailsView = ({ route, navigation }) => {
  const {item, startDate, endDate, numTravellers, canBook, canDelete} = route.params;
  const [latitude, setLatitude] = useState(item.latitude);
  const [longitude, setLongitude] = useState(item.longitude);
  const [images, setImages] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const commentsRef = useRef(null);
  const { token } = useSelector(selectAuth);

  const localImages = [
    require('../../assets/location/photo1.jpg'),
    require('../../assets/location/photo2.jpg'),
    require('../../assets/location/photo3.jpg')
  ];

  const getImages = (item) => {
    if (item.images.length > 0 && item.images[0].data) {
      const locationImages = item.images.map(image => `data:image/jpeg;base64,${image.data}`);
      setImages(locationImages);
    }
  };

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/reservations/location/${item.locationId}/ratings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        const data = response.data;
        setRatings(data);
  
        if (data.length > 0) {
          const totalStars = data.reduce((sum, rating) => sum + rating.ratingClientStar, 0);
          setAverageRating((totalStars / data.length).toFixed(1));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des évaluations :", error);
      }
    };
  
    getImages(item);
    fetchRatings();
  }, [item.locationId]);
  

  //TODO  Fonction pour défiler vers les commentaires
  const scrollToComments = () => {
    //commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteLocation = async (locationId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/locations/${locationId}/delete`,
      {},  
      {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalVisible(false);
      navigation.navigate({
        name: 'RentalView',
        key: `${Date.now()}` 
    });
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Image */}
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

        {/* Titre et avis */}
        <View style={styles.ratingAndAction}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.title}>{item.name}</Text>
            <TouchableOpacity onPress={scrollToComments} style={styles.underline}>
              <View style={styles.reviewContainer}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.floor(averageRating) ? "star" : i < averageRating ? "star-half" : "star-outline"}
                    size={16}
                    color="green"
                  />
                ))}
                <Text style={styles.rating}>{averageRating}/5</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtons}>
            {
            canBook &&
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => navigation.navigate('BookReservationView', { item, navigation, startDate, endDate, numTravellers })}
            >
              <Ionicons name="calendar" size={20} color="white" />
              <Text style={styles.actionText}>BOOK</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => navigation.navigate('LocalisationMapView', { latitude, longitude })}
              >
              <Ionicons name="location" size={20} color="white" />
              <Text style={styles.actionText}>LOCATION</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Services et équipements */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Services</Text>
        {item.assets.filter(asset => asset.typeAsset === 'Service').length > 0 ? (
          item.assets
            .filter(asset => asset.typeAsset === 'Service')
            .map((service, index) => (
              <View style={styles.asset} key={index}>
                <Text style={styles.infoText}>{service.name}</Text>
              </View>
            ))
        ) : (
          <Text style={styles.noInfoText}>No services proposed</Text>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Equipment</Text>
        {item.assets.filter(asset => asset.typeAsset === 'Equipment').length > 0 ? (
          item.assets
            .filter(asset => asset.typeAsset === 'Equipment')
            .map((equipment, index) => (
              <View style={styles.asset} key={index}>
                <Text style={styles.infoText}>{equipment.name}</Text>
              </View>
            ))
        ) : (
          <Text style={styles.noInfoText}>No equipment available</Text>
        )}
      </View>

      {/* Commentaires */}
      <View style={styles.infoSection} ref={commentsRef}>
        <Text style={styles.infoTitle}>Reviews</Text>
        {ratings.length > 0 ? (
          ratings.map((rating, index) => (
            <View key={index} style={styles.review}>
              <View style={styles.reviewRating}>
                <Text style={styles.reviewUser}>User {rating.userId}</Text>
                <View style={{ flexDirection: "row" }}>
                  {[...Array(rating.ratingClientStar)].map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color="green" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{rating.ratingClientComment}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noInfoText}>No reviews yet</Text>
        )}
      </View>

      {(canDelete && item.isAvailable) &&
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => setModalVisible(true)}
        > 
          <Text style={styles.actionText}>DELETE</Text>
        </TouchableOpacity>
      }

      {/* Info Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Location</Text>
            <Text>Are you sure you want to delete this location?</Text>
            <View style={{flexDirection:'row', justifyContent:'space-around'}}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={() => deleteLocation(item.locationId)}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 30 }} />

    </ScrollView>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
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
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingAndAction: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    paddingHorizontal: 20,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  rating: {
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006400',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006400',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006400',
    padding: 10,
    borderRadius: 5,
  },
  actionText: {
    color: 'white',
    marginLeft: 5,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginVertical: 10,
  },
  infoSection: {
    marginVertical: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  review: {
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  asset: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  noInfoText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#b0bec5',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    margin:10
  },
  confirmButton: {
    backgroundColor: '#006400',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    margin:10
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
});

export default LocationDetailsView;
