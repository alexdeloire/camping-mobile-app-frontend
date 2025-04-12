import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/authSlice';
import { API_BASE_URL } from '@env';
import axios from 'axios';

const ReservationDetailsView = ({ route, navigation }) => {
  const { item } = route.params;

  const { token } = useSelector(selectAuth);
  const [images, setImages] = useState([]);
  const [clientRating, setClientRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hasCommented, setHasCommented] = useState(false);


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

  const handleStarPress = (rating) => {
    setClientRating(rating);
  };

  const putComment = async () => {
    try {
      if (!clientRating) {
        console.error('Rating is required');
        return;
      }
      const reservationDetails = item;
      reservationDetails.ratingClientStar = clientRating;
      reservationDetails.ratingClientComment = reviewComment;
      const response = await axios.put(`${API_BASE_URL}/reservations/${item.reservationId}`,
        reservationDetails, 
        { headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Comment sent:', response.data);
      setHasCommented(true);
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  const putCancel = async () => {
    try {
      const reservationDetails = item;
      reservationDetails.state = 'CANCELED';
      const response = await axios.put(`${API_BASE_URL}/reservations/${item.reservationId}`,
        reservationDetails, 
        { headers: { Authorization: `Bearer ${token}` }
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  const putComplete = async () => {
    try {
      const reservationDetails = item;
      reservationDetails.state = 'COMPLETED';
      const response = await axios.put(`${API_BASE_URL}/reservations/${item.reservationId}`,
        reservationDetails,
        { headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Reservation completed:', response.data);
      navigation.goBack();
    } catch (error) {
      console.error('Error completing reservation:', error);
    }
  };

  useEffect(() => {
    getImages(item.location);
    setClientRating(item.ratingClientStar);
    setReviewComment(item.ratingClientComment);
    setHasCommented(item.ratingClientStar && item.ratingClientStar > 0);
  }, []);

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
            <Text style={styles.title}>{item.location.name}</Text>
            <Text style={styles.stateTitle}>{item.state}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => navigation.navigate('LocalisationMapView', { latitude:item.location.latitude, longitude: item.location.longitude })}
              >
              <Ionicons name="location" size={20} color="white" />
              <Text style={styles.actionText}>LOCATION</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Section des Dates */}
      <View style={styles.datesSection}>
        <View style={{ display : 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'left', height: 80 }}>
          <Text style={styles.dateTitle}>Arrival</Text>
          <Text style={styles.dateText}>{item.startDate}</Text>
        </View>
        <View style={styles.separator} />
        <View style={{ display : 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'right', height: 80 }}>
          <Text style={styles.dateTitle}>Departure</Text>
          <Text style={styles.dateText}>{item.endDate}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{item.location.description}</Text>

      {/* Services et équipements */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Services</Text>
        {item.location.assets.filter(asset => asset.typeAsset === 'Service').length > 0 ? (
          item.location.assets
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
        {item.location.assets.filter(asset => asset.typeAsset === 'Equipment').length > 0 ? (
          item.location.assets
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

      {['PENDING', 'CONFIRMED'].includes(item.state) ? (
        // Section message request
        <View style={styles.messageRequest}>
          <Text style={styles.messageTitle}>Message Request</Text>
          <Text style={styles.messageText}>{item.messageRequest}</Text>
        </View>
      ) : (
        // Section notation
        <View style={styles.reviewSection}>
          {hasCommented ? (
            <>
              <Text style={styles.reviewTitle}>Your Review</Text>
              <View style={styles.starRating}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < clientRating ? "star" : "star-outline"}
                    size={24}
                    color="green"
                  />
                ))}
              </View>
              <Text style={styles.reviewComment}>{reviewComment}</Text>
            </>
          ) : (
            <>
              <Text style={styles.reviewTitle}>Leave a Review</Text>
              <View style={styles.starRating}>
                {[...Array(5)].map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => handleStarPress(i + 1)}>
                    <Ionicons
                      name={i < clientRating ? "star" : "star-outline"}
                      size={24}
                      color="green"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="Write your comment here..."
                multiline
                value={reviewComment || ''}
                onChangeText={(text) => setReviewComment(text)}
              />
              <TouchableOpacity style={styles.submitButton}>
                <Text
                  style={styles.submitButtonText}
                  onPress={() => {
                    putComment();
                  }}
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Notation par l'hôte */}
          <View style={styles.hostReview}>
            <Text style={styles.reviewTitle}>Host's Review</Text>
            {(item.ratingHostStar && item.ratingHostStar > 0) ? (
              <>
                <View style={styles.starRating}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                  key={i}
                  name={i < item.ratingHostStar ? "star" : "star-outline"} 
                  size={20}
                  color="green"
                  />
                ))}
              </View>
              <Text style={styles.hostComment}>{item.ratingHostComment || "No review from the host."}</Text>
            </>    
            ) : (
              <>
                <Text style={styles.hostComment}>No review from the host yet.</Text>
              </>
            )}
          </View>
        </View>
      )}

      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} >
        { ['PENDING', 'CONFIRMED'].includes(item.state) && (
          <TouchableOpacity style={styles.cancelButton}>
            <Text
              style={styles.submitButtonText}
              onPress={() => {
                putCancel();
              }}
            >
              CANCEL
            </Text>
          </TouchableOpacity>
        )}
        { item.state === 'CONFIRMED' && (
          <TouchableOpacity style={styles.submitButton}>
            <Text
              style={styles.submitButtonText}
              onPress={() => {
                putComplete();
              }}
            >
              Booking COMPLETED
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  stateTitle: {
    fontSize: 15,
    color: '#006400',
    fontWeight: 'bold',
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
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'green',
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
  asset: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  datesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    // paddingHorizontal: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  messageRequest: {
    backgroundColor: '#e0f7fa',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  reviewSection: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewInput: {
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginVertical: 10,
  },
  starRating: {
    flexDirection: 'row',
  },
  hostReview: {
    marginTop: 20,
  },
  hostComment: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#006400',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
});

export default ReservationDetailsView;
