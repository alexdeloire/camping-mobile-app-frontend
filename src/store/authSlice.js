import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

// Helper functions to interact with AsyncStorage
const storeAuthData = async (data) => {
  try {
    await AsyncStorage.setItem('auth', JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save auth data:", error);
  }
};

const loadAuthData = async () => {
  try {
    const storedData = await AsyncStorage.getItem('auth');
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error("Failed to load auth data:", error);
    return null;
  }
};

const removeAuthData = async () => {
  try {
    await AsyncStorage.removeItem('auth');
  } catch (error) {
    console.error("Failed to remove auth data:", error);
  }
};

// Async thunk for handling login
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      console.log(API_BASE_URL);
      const response = await axios.post(`${API_BASE_URL}/users/login`, { username, password });
      const data = response.data; // Assuming response includes { userId, username, token, isAdmin }
      console.log('Login data:', data);

      // Store auth info in AsyncStorage
      await storeAuthData(data);

      return data;
    } catch (error) {
      console.error('Login error:', error.response?.data || 'Login failed');
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

// Async thunk for handling registration
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/register`, { email, username, password });
      const data = response.data;

      // Store auth info in AsyncStorage
      await storeAuthData(data);

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Registration failed');
    }
  }
);

// Initial auth state loaded from AsyncStorage
let initialState = {
  userId: null,
  username: null,
  token: null,
  isAdmin: false,
  status: 'idle',
  error: null,
};

// Load stored authentication data asynchronously
loadAuthData().then((storedAuth) => {
  if (storedAuth) {
    initialState = {
      ...initialState,
      ...storedAuth,
    };
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.userId = null;
      state.username = null;
      state.token = null;
      state.isAdmin = false;
      state.status = 'idle';
      state.error = null;

      // Remove auth info from AsyncStorage
      removeAuthData();
    },
    setCredentials: (state, action) => {
      const { userId, username, token, isAdmin } = action.payload;
      state.userId = userId;
      state.username = username;
      state.token = token;
      state.isAdmin = isAdmin;

      // Update auth info in AsyncStorage
      storeAuthData(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userId = action.payload.userId;
        state.username = action.payload.username;
        state.token = action.payload.token;
        state.isAdmin = action.payload.isAdmin;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userId = action.payload.userId;
        state.username = action.payload.username;
        state.token = action.payload.token;
        state.isAdmin = action.payload.isAdmin;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Export actions
export const { logout, setCredentials } = authSlice.actions;

// Selector to access auth state in components
export const selectAuth = (state) => state.auth;

export default authSlice.reducer;
