import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput, Button } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/authSlice';

const RentalManagementComponent = () => {
  const { token } = useSelector(selectAuth);
  const [equipment, setEquipment] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllEquipment, setShowAllEquipment] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [assetType, setAssetType] = useState('');

  useEffect(() => {
    const fetchRentalData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/locations/all-assets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Rental data:', response.data);

        const equipmentData = response.data.filter(item => item.typeAsset === 'Equipment');
        const servicesData = response.data.filter(item => item.typeAsset === 'Service');

        setEquipment(equipmentData);
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching rental data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentalData();
  }, []);

  const handleDelete = async (assetId, isEquipment) => {
    try {
      await axios.delete(`${API_BASE_URL}/locations/assets/delete-admin/${assetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isEquipment) {
        setEquipment(equipment.filter(item => item.assetId !== assetId));
      } else {
        setServices(services.filter(item => item.assetId !== assetId));
      }

      Alert.alert('Success', 'Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handleAddAsset = async () => {
    if (!newAssetName.trim()) {
      //Alert.alert('Error', 'Please enter a name for the asset');
      console.log('Please enter a name for the asset');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/locations/assets/add-admin`,
        { name: newAssetName, typeAsset: assetType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newAsset = response.data;
      if (assetType === 'Equipment') {
        setEquipment([...equipment, newAsset]);
      } else {
        setServices([...services, newAsset]);
      }

      setIsModalVisible(false);
      setNewAssetName('');
      //Alert.alert('Success', `${assetType} added successfully`);
      console.log(`${assetType} added successfully`);
    } catch (error) {
      console.error('Error adding asset:', error);
      //Alert.alert('Error', 'Failed to add asset');
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#D2691E" />;
  }

  return (
    <View style={styles.container}>
      {/* Modal for Adding New Asset */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New {assetType}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              value={newAssetName}
              onChangeText={setNewAssetName}
            />
            <TouchableOpacity style={styles.addButtonStyle} onPress={handleAddAsset}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButtonStyle} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Equipment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipment</Text>
        <Text style={styles.sectionDescription}>Lorem Ipsum is simply dummy text of the printing and typesetting industry</Text>

        {(showAllEquipment ? equipment : equipment.slice(0, 3)).map((item, index) => (
          <View key={item.assetId} style={styles.item}>
            <Text style={styles.circle}>{String.fromCharCode(65 + index)}</Text>
            <Text style={styles.itemText}>{item.name}</Text>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDelete(item.assetId, true)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={() => setShowAllEquipment(!showAllEquipment)}>
          <Text style={styles.toggleText}>{showAllEquipment ? 'Hide' : 'Show All'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setAssetType('Equipment'); setIsModalVisible(true); }}>
          <Text style={styles.addButton}>+ Add Equipment</Text>
        </TouchableOpacity>
      </View>

      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>
        <Text style={styles.sectionDescription}>Lorem Ipsum is simply dummy text of the printing and typesetting industry</Text>

        {(showAllServices ? services : services.slice(0, 3)).map((item, index) => (
          <View key={item.assetId} style={styles.item}>
            <Text style={styles.circle}>{String.fromCharCode(65 + index)}</Text>
            <Text style={styles.itemText}>{item.name}</Text>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDelete(item.assetId, false)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={() => setShowAllServices(!showAllServices)}>
          <Text style={styles.toggleText}>{showAllServices ? 'Hide' : 'Show All'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setAssetType('Service'); setIsModalVisible(true); }}>
          <Text style={styles.addButton}>+ Add Service</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D2691E',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D2691E',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 10,
    fontWeight: 'bold',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF4500',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  toggleText: {
    color: '#D2691E',
    fontSize: 14,
    marginTop: 10,
  },
  addButton: {
    color: '#D2691E',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D2691E',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  addButtonStyle: {
    backgroundColor: '#D2691E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButtonStyle: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RentalManagementComponent;
