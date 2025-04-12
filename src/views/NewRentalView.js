import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView, Image, Platform, Alert, TouchableWithoutFeedback, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@env';
import * as ImagePicker from 'expo-image-picker';
import OutsidePressHandler from 'react-native-outside-press';
import { selectAuth } from '../store/authSlice';
import { useSelector } from 'react-redux';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';


const NewRentalView = ({setSelectedView}) => {

  const { token, userId } = useSelector(selectAuth);

  const [rentalName, setRentalName] = useState('');
  const [maxTravellers, setMaxTravellers] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(41.40338);
  const [longitude, setLongitude] = useState(2.17403);
  const [services, setServices] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedEquipments, setSelectedEquipments] = useState([]);
  const [images, setImages] = useState([]);
  const [searchTextE, setSearchTextE] = useState('');
  const [searchTextS, setSearchTextS] = useState('');
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [showEquipments, setShowEquipments] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [isWeb, setIsWeb] = useState(Platform.OS === 'web');

  useEffect(() => {
      const fetchAssets = async () => {
          try {
              // Fetch services
              const serviceResponse = await axios.get(`${API_BASE_URL}/locations/services`, {
                  headers: {
                      'Authorization': `Bearer ${token}`, 
                      'Content-Type': 'application/json',
                  },
              });
  
              const serviceData = serviceResponse.data;
              setServices(serviceData);
  
              // Fetch equipments
              const equipmentResponse = await axios.get(`${API_BASE_URL}/locations/equipments`, {
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                  },
              });
  
              const equipmentData = equipmentResponse.data;
              setEquipments(equipmentData);
          } catch (error) {
              console.error("Erreur lors de la récupération des services/équipements :", error);
              if (error.response) {
                  console.error(`Erreur HTTP: ${error.response.status} - ${error.response.data}`);
              }
          }
      };
  
      fetchAssets();
  }, []);  


  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Required", "We need permission to access your photos.");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4 - images.length,
      quality: 1,
    });
 
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
      }));
      setImages((prevImages) => [...prevImages, ...newImages]);
    } else {
      console.log('User cancelled image picker');
    }
  };

 const handleRemoveImage = (indexToRemove) => {
  setImages(images.filter((_, index) => index !== indexToRemove));
};

  const handleSearchEquipmentChange = (text) => {
   setSearchTextE(text);
   if (text.trim() !== '') {
     setFilteredEquipments(
       equipments.filter(equipment =>
         equipment.name.toLowerCase().includes(text.toLowerCase())
       )
     );
   } else {
     setFilteredEquipments([]);
   }
   console.log(filteredEquipments)
 };

  const handleSearchServiceChange = (text) => {
    setSearchTextS(text);
    if (text.trim() !== '') { 
      setFilteredServices(
        services.filter(service =>
          service.name.toLowerCase().includes(text.toLowerCase())
        )
      );
     } else {
      setFilteredServices([]);
     }
  };

   const toggleSelectEquipment = (equipment) => {
    if (selectedEquipments.some(e => e.name == equipment.name)) {
      setSelectedEquipments(selectedEquipments.filter(e => e.name != equipment.name));
    } else {
      setSelectedEquipments([...selectedEquipments, equipment]);
    }
  };

  const toggleSelectService = (service) => {
    if (selectedServices.some(s => s.name == service.name)) {
      setSelectedServices(selectedServices.filter(s => s.name != service.name));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const getBlobFromUri = async (imageUri) => {
    try {
        if (isWeb) {
            // Cas Web
            console.log("Conversion de l'image pour le web...");
            const response = await fetch(imageUri);
            if (!response.ok) throw new Error(`Erreur lors de la récupération de l'image : ${response.status}`);
            return await response.blob();
        } else {
            // Cas Mobile
            console.log("Conversion de l'image pour le mobile...");
            const fileData = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
            const blob = `data:image/jpeg;base64,${fileData}`;
            return blob;
        }
    } catch (error) {
        console.error(`Erreur lors de la conversion de l'image (${imageUri}) en blob :`, error);
        throw error;
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    // Ajouter les champs texte
    formData.append("userId", userId);
    formData.append("name", rentalName);
    formData.append("description", description);
    formData.append("address", address);
    formData.append("nbPersons", maxTravellers);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);

    // Ajouter les IDs des assets
    const assetIds = [...selectedServices, ...selectedEquipments].map(asset => asset.assetId);
    assetIds.forEach(id => formData.append("assetIds", id));

    // Gérer les fichiers images
    await Promise.all(
        images.map(async (img, index) => {
            try {
                const blob = await getBlobFromUri(img.uri);
             
                if(isWeb) {
                  formData.append("images", blob, `image_${index}.jpg`);
                }else{
                  formData.append("images", {
                      uri: img.uri,
                      name: `image_${index}.jpg`,
                      type: "image/jpeg",
                  });
                }
            } catch (error) {
                console.error(`Erreur lors de la récupération de l'image ${img.uri} :`, error);
            }
        })
    );

    try {
        // Envoyer la requête
        const response = await fetch(`${API_BASE_URL}/locations/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erreur lors de l'ajout de la location : ${errorMessage}`);
        }

        const data = await response.json();
        // console.log("Location ajoutée :", data);
        setSelectedView("MyRentalsView");
    } catch (error) {
        console.error("Erreur post location:", error);
    }
  };



  return (
    <>
    <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign:'center'}}>New Rental</Text>
    <ScrollView style={styles.container}  horizontal={false}>
      <View style={styles.field}>
        <Text style={styles.label}>Rental Name</Text>
        <TextInput
          style={styles.input}
          value={rentalName}
          onChangeText={setRentalName}
          placeholder="Enter rental name"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Max Number of Travellers</Text>
        <TextInput
          style={styles.input}
          value={maxTravellers}
          onChangeText={setMaxTravellers}
          keyboardType="numeric"
          placeholder="Enter max number of travellers"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Enter description"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input]}
          value={address}
          onChangeText={setAddress}
          multiline
          placeholder="Enter address"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Longitude</Text>
        <TextInput
          style={[styles.input]}
          value={longitude}
          onChangeText={setLongitude}
          multiline
          placeholder="Enter longitude"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>latitude</Text>
        <TextInput
          style={[styles.input]}
          value={latitude}
          onChangeText={setLatitude}
          multiline
          placeholder="Enter Latitude"
        />
      </View>

        <View style={styles.field}>
        <Text style={styles.label}>Services</Text>
        <View style={styles.tagContainer}>
          {selectedServices.map((service, index) => (
            <TouchableOpacity key={index} style={styles.tag} onPress={() => toggleSelectService(service)}>
              <Text style={styles.tagText}>{service.name}</Text>
                <Ionicons name="close" size={12} color="#fff" style={{marginLift:5}} />
            </TouchableOpacity>
          ))}
        </View>
              <OutsidePressHandler onOutsidePress={() => {setShowServices(false)}}>
        <TextInput
          placeholder="Search services"
          style={styles.input}
          value={searchTextS}
          onFocus={() => setShowServices(true)}
          onChangeText={handleSearchServiceChange}
        />
        {showServices &&
          <FlatList
          horizontal={false}
          data={searchTextS=="" ? services : filteredServices}
          style={styles.list}
          keyExtractor={(item) => item.assetId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggleSelectService(item)}>
              <Text style={styles.listItem}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
        }
      </OutsidePressHandler>
        </View>  
      
        <View style={styles.field}>
        <Text style={styles.label}>Equipments</Text>
        <View style={styles.tagContainer}>
          {selectedEquipments.map((equipment, index) => (
            <TouchableOpacity key={index} style={styles.tag} onPress={() => toggleSelectEquipment(equipment)}>
              <Text style={styles.tagText}>{equipment.name}</Text>
                <Ionicons name="close" size={12} color="#fff" style={{marginLeft:5}} />
            </TouchableOpacity>
          ))}
        </View>
        <OutsidePressHandler onOutsidePress={() => {setShowEquipments(false)}}>
        <TextInput
          placeholder="Search equipments"
          style={styles.input}
          value={searchTextE}
          onFocus={() => setShowEquipments(true)}
          onChangeText={handleSearchEquipmentChange}
          />
        {showEquipments &&
          <FlatList
          horizontal={false}
          data={searchTextE == '' ? equipments :  filteredEquipments}
          style={styles.list}
          keyExtractor={(item) => item.assetId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggleSelectEquipment(item)}>
                <Text style={styles.listItem}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        }
      </OutsidePressHandler>
        </View>  

      <View style={styles.imageSection}>
        <Text style={styles.label}>Images</Text>
        <View style={styles.imagePreview}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: img.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleRemoveImage(index)}
            >
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>
          </View>
          ))}
          <TouchableOpacity style={styles.imageUpload} onPress={handleImagePicker}>
            <Ionicons name="cloud-upload-outline" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedView("MyRentalsView")}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
      </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
   },
   tag: {
    backgroundColor: '#006400',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
  list:{
   backgroundColor: '#fff',
   marginBottom: 4,
  },
  listItem: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  imageSection: {
    marginBottom: 30,
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imageContainer: {
   position: 'relative',
   marginRight: 10,
  },
  deleteIcon: {
   position: 'absolute',
   top: 0,
   right: 0,
   backgroundColor: 'white',
   borderRadius: 12,
 },

  image: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 8,
  },
  imageUpload: {
    width: 60,
    height: 60,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop:10
  },
  cancelButton: {
    backgroundColor: '#b0bec5',
    padding: 12,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#006400',
    padding: 12,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NewRentalView;
