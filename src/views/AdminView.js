import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import Loading from '../components/Loading';
import { selectAuth } from '../store/authSlice';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import Tabs from '../components/Tabs';
import RentalManagementComponent from '../components/RentalManagementComponent';

const AdminView = () => {
  const [activeTab, setActiveTab] = useState('UserManagement');
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { token } = useSelector(selectAuth);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Users:', response.data);
        setUsers(response.data);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Open info modal for selected user
  const handleInfoClick = (user) => {
    setSelectedUser(user);
    setInfoModalVisible(true);
  };

  // Open delete confirmation modal for selected user
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  // Confirm user deletion
  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/users/delete-by-admin/${selectedUser.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user.userId !== selectedUser.userId));
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Render Users Section
  const renderUsersSection = () => {
    const visibleUsers = showAllUsers ? users : users.slice(0, 3);
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Users</Text>
        <Text style={styles.sectionDescription}>Manage users in the system</Text>
        {visibleUsers.map((user) => (
          <View key={user.userId} style={styles.userItem}>
            <View style={styles.userInitialCircle}>
              <Text style={styles.userInitial}>{user.username[0]}</Text>
            </View>
            <Text style={styles.userName}>{user.username}</Text>
            <TouchableOpacity style={styles.infoButton} onPress={() => handleInfoClick(user)}>
              <Text style={styles.infoButtonText}>Info +</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={() => setShowAllUsers(!showAllUsers)}>
          <Text style={styles.showHideText}>{showAllUsers ? 'Hide' : 'Show All'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render User Requests Section
  const renderUserRequestsSection = () => {
    const userRequests = users.filter((user) => user.requestedDeletion);
    const visibleRequests = showAllRequests ? userRequests : userRequests.slice(0, 3);
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Requests</Text>
        {visibleRequests.map((user) => (
          <View key={user.userId + "req"} style={styles.userItem}>
            <View style={styles.userInitialCircle}>
              <Text style={styles.userInitial}>{user.username[0]}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={styles.userRequest}>Request: Account Deletion</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteClick(user)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={() => setShowAllRequests(!showAllRequests)}>
          <Text style={styles.showHideText}>{showAllRequests ? 'Hide' : 'Show All'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const tabs = [
    {
      label: 'User Management',
      content: (
        <ScrollView>
          {renderUsersSection()}
          {renderUserRequestsSection()}
        </ScrollView>
      ),
    },
    {
      label: 'Rental Management',
      content: <ScrollView><RentalManagementComponent/></ScrollView>,
    },
  ];

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Loading message="Loading Admin Section..." />
      ) : (
        <>
          {/* Tabs */}
          <Tabs tabs={tabs} role="admin"/>
          {/* <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'UserManagement' ? styles.activeTab : null]}
              onPress={() => setActiveTab('UserManagement')}
            >
              <Text style={[styles.tabText, activeTab === 'UserManagement' ? styles.activeTabText : null]}>User Management</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'RentalManagement' ? styles.activeTab : null]}
              onPress={() => setActiveTab('RentalManagement')}
            >
              <Text style={[styles.tabText, activeTab === 'RentalManagement' ? styles.activeTabText : null]}>Rental Management</Text>
            </TouchableOpacity>
          </View> */}

          {/* Content */}
          {/* <ScrollView>
            {activeTab === 'UserManagement' ? (
              <>
                {renderUsersSection()}
                {renderUserRequestsSection()}
              </>
            ) : (
              <RentalManagementComponent />
            )}
          </ScrollView> */}

          {/* Info Modal */}
          <Modal visible={infoModalVisible} transparent animationType="slide">
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>User Info</Text>
                <Text>Username: {selectedUser?.username}</Text>
                <Text>Email: {selectedUser?.email}</Text>
                <Text>Telephone: {selectedUser?.telephone}</Text>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setInfoModalVisible(false)}>
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal visible={deleteModalVisible} transparent animationType="slide">
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Confirm Delete</Text>
                <Text>Are you sure you want to delete {selectedUser?.username}?</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.confirmButton} onPress={confirmDeleteUser}>
                    <Text style={styles.confirmButtonText}>Yes, Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setDeleteModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
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
    // backgroundColor: '#fff',
    // paddingTop: 40,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  activeTab: {
    borderBottomColor: '#D2691E',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#D2691E',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#D2691E',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  section: {
    marginHorizontal: 20,
  },
  userInitialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D2691E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  userRequest: {
    fontSize: 12,
    color: '#777',
  },
  infoButton: {
    backgroundColor: '#D2691E',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 'auto',
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  detailsButton: {
    backgroundColor: '#D2691E',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 'auto',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  showHideContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  showHideText: {
    color: '#D2691E',
    fontSize: 14,
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
  modalCloseButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#D2691E',
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  confirmButton: {
    padding: 10,
    backgroundColor: '#FF4500',
    borderRadius: 5,
    marginRight: 10,
  },
  confirmButtonText: {
    color: '#fff',
  },
  cancelButton: {
    padding: 10,
    backgroundColor: '#888',
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#FF4500',
    borderRadius: 5,
    marginLeft: 'auto',
  },
  deleteButtonText: {
    color: '#fff',
  },
});

export default AdminView;
