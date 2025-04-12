import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View, Image } from 'react-native';
import { store } from "./src/store/store";
import { useSelector } from 'react-redux';
import { selectAuth } from './src/store/authSlice';
import { Provider } from 'react-redux'
import CounterComponent from './src/components/CounterComponent';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ExploreView from './src/views/ExploreView';
import ProfileView from './src/views/ProfileView';
import AdminView from './src/views/AdminView';
import HeaderWithLogo from './src/components/HeaderWithLogo';
import LocationDetailsView from './src/views/LocationDetailsView';
import BookingConfirmationView from './src/views/BookingConfirmationView';
import BookReservationView from './src/views/BookReservationView';
import LoginView from './src/views/LoginView';
import MyTripsView from './src/views/MyTripsView';
import ReservationDetailsView from './src/views/ReservationDetailsView';
import LocalisationMapView from './src/views/LocalisationMapView';
import MyRentalsView from './src/views/MyRentalsView';
import NewRentalView from './src/views/NewRentalView';
import RentalView from './src/views/RentalView';
import BookingRequestDetailsView from './src/views/BookingRequestDetailsView';
import { EventProvider } from 'react-native-outside-press';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
]);

const ProfileStack = createNativeStackNavigator();
const ExploreStack = createNativeStackNavigator();
const MyTripsStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const RentalStack = createNativeStackNavigator();

function ExploreScreen() {
  return (
    <ExploreStack.Navigator initialRouteName="ExploreView">
      <ExploreStack.Screen 
        name="ExploreView" 
        component={ExploreView} 
        options={{ headerShown: false }} 
      />
      <ExploreStack.Screen 
        name="LocationDetailsView" 
        component={LocationDetailsView} 
        options={{ title: 'Details' }} 
      />
      <ExploreStack.Screen
        name="BookReservationView"
        component={BookReservationView}
        options={{ title: 'Book Reservation' }}
      />
      <ExploreStack.Screen
        name="LocalisationMapView"
        component={LocalisationMapView}
        options={{ title: 'Map' }}
      />
    </ExploreStack.Navigator>
  );
}

function BookingConfirmationScreen() {
  return (
    <ExploreStack.Navigator>
      <ExploreStack.Screen
        name="BookingConfirmationView"
        component={BookingConfirmationView}
        options={{ headerShown: false }}
      />
    </ExploreStack.Navigator>
  );
}

function MyTripsScreen() {
  return (
    <MyTripsStack.Navigator>
      <MyTripsStack.Screen
        name="MyTripsView"
        component={MyTripsView}
        options={{ headerShown: false }}
      />
      <MyTripsStack.Screen 
        name="ReservationDetailsView" 
        component={ReservationDetailsView} 
        options={{ title: 'Details' }} 
      />
      <MyTripsStack.Screen
        name="LocalisationMapView"
        component={LocalisationMapView}
        options={{ title: 'Map' }}
      />
    </MyTripsStack.Navigator>
  );
}

function MyRentalsScreen() {

  return (
       <RentalStack.Navigator initialRouteName="RentalView">
        <RentalStack.Screen 
          name="NewRentalView" 
          component={NewRentalView} 
          options={{ title: 'New Rental' }} 
          />
        <RentalStack.Screen 
          name="LocationDetailsView" 
          component={LocationDetailsView} 
          options={{ title: 'Details' }} 
        />
        <RentalStack.Screen 
          name="RentalView" 
          component={RentalView} 
          options={{ headerShown: false }} 
        />
        <RentalStack.Screen
        name="BookingRequestDetailsView" 
        component={BookingRequestDetailsView} 
        options={{ title: 'Details' }} 
        />
        <RentalStack.Screen
          name="LocalisationMapView"
          component={LocalisationMapView}
          options={{ title: 'Map' }}
        />

      </RentalStack.Navigator>
 )

}

function ProfileScreen() {
  return (
    <ProfileStack.Navigator initialRouteName="ProfileView">
      <ProfileStack.Screen 
        name="ProfileView" 
        component={ProfileView} 
        options={{ title: 'Profile', headerShown: false }}
      />
      <ProfileStack.Screen 
        name="AdminView" 
        component={AdminView} 
        options={{ title: 'Admin Page' }} 
      />
    </ProfileStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function App() {
  const { token } = useSelector(selectAuth);
  // const token = null;
  return (
    
      <NavigationContainer>
      {token ? (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Explore') {
              iconName = focused ? 'location' : 'location-outline';
            } else if (route.name === 'MyTrips') {
              iconName = focused ? 'walk' : 'walk-outline';
            } else if (route.name === 'MyRentals') {
              iconName = focused ? 'bonfire' : 'bonfire-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'forestgreen',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen
            name="Explore"
            component={ExploreScreen}
            options={{
              headerTitle: () => <HeaderWithLogo title="Explore" />,
            }}
          />
         <Tab.Screen
            name="MyTrips"
            component={MyTripsScreen}
            options={{
              headerTitle: () => <HeaderWithLogo title="MyTrips" />,
              unmountOnBlur: true,
            }}
          />
          <Tab.Screen
            name="MyRentals"
            component={MyRentalsScreen}
            options={{
              headerTitle: () => <HeaderWithLogo title="MyRentals" />,
              unmountOnBlur: true,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerTitle: () => <HeaderWithLogo title="Profile" />,
            }}
          />
          <Tab.Screen
            name="BookingConfirmation"
            component={BookingConfirmationScreen}
            options={{ 
              headerTitle: () => <HeaderWithLogo title="" />, 
              headerShown: true, 
              tabBarButton: () => null 
            }} // Masquer l'onglet dans le TabBar
          />

          
      </Tab.Navigator>
      ) : (
          <AuthStack.Navigator>
            <AuthStack.Screen name="Login" component={LoginView} options={{ headerShown: false }} />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
  );
}

export default function RootApp() {
  return (
    <Provider store={store}>
      <EventProvider>
        <App />
      </EventProvider>
    </Provider>
  );
}