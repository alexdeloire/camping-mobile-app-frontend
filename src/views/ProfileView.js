import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { selectAuth } from '../store/authSlice';
import Loading from '../components/Loading';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const ProfileView = () => {
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // New state for modal visibility
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userId, isAdmin, token } = useSelector(selectAuth);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveChanges = async () => {
    try {
      await axios.put(`${API_BASE_URL}/users/${userId}`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditable(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleModifyClick = () => {
    if (isEditable) handleSaveChanges();
    setIsEditable(!isEditable);
  };

  const handleLogout = () => {
    dispatch(logout());
    // navigation.navigate('Login');
  };

  const handleRequestDeletion = async () => {
    try {
      console.log(API_BASE_URL);
      await axios.post(`${API_BASE_URL}/users/${userId}/request-deletion`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsModalVisible(false); // Close modal on success
      console.log("Deletion Requested: Your account deletion request has been submitted.");
    } catch (error) {
      console.error('Error requesting account deletion:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (value.length <= 30) {
      setProfileData({ ...profileData, [field]: value });
    }
  };

  const getValueOrPlaceholder = (value, placeholder = '') => {
    return value ? value : placeholder;
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Loading message="Loading Profile..." />
      ) : (
        <>
          <View style={styles.profilePicture}>
            <Text style={styles.profileInitial}>{profileData.username ? profileData.username[0].toUpperCase() : '?'}</Text>
          </View>
          <Text style={styles.username}>@{profileData.username || 'No Username'}</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.infoText}
              value={getValueOrPlaceholder(profileData.name)}
              editable={isEditable}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.infoText}
              value={getValueOrPlaceholder(profileData.email)}
              editable={isEditable}
              onChangeText={(text) => handleInputChange('email', text)}
            />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.infoText}
              value={getValueOrPlaceholder(profileData.telephone)}
              editable={isEditable}
              onChangeText={(text) => handleInputChange('telephone', text)}
            />
          </View>

          <TouchableOpacity style={styles.modifyButton} onPress={handleModifyClick}>
            <Text style={styles.buttonText}>{isEditable ? 'SAVE' : 'MODIFY'}</Text>
          </TouchableOpacity>

          {isAdmin ? (
            <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('AdminView')}>
              <Text style={styles.buttonText}>GO TO ADMIN PAGE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.deletionButton} onPress={() => setIsModalVisible(true)}>
              <Text style={styles.buttonText}>REQUEST ACCOUNT DELETION</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>LOGOUT</Text>
          </TouchableOpacity>

          {/* Custom Modal for Confirmation */}
          <Modal
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>Confirm Account Deletion</Text>
                <Text style={styles.modalMessage}>Are you sure you want to request account deletion?</Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButton} onPress={handleRequestDeletion}>
                    <Text style={styles.buttonText}>Yes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingTop: 10,
  },
  profilePicture: {
    marginTop: 10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 40,
    color: '#fff',
  },
  username: {
    fontSize: 20,
    marginTop: 10,
    color: '#333',
  },
  infoContainer: {
    width: '90%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
  },
  modifyButton: {
    backgroundColor: '#3CB371',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  adminButton: {
    backgroundColor: '#D2691E',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  deletionButton: {
    backgroundColor: '#FF4500',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#FF4500',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileView;
