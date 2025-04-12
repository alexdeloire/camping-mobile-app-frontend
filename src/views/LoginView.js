import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { login, register } from '../store/authSlice';

export default function LoginView() {
  const [isRegister, setIsRegister] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const getErrorMessage = (status) => {
    switch (status) {
      case 400:
        return 'Bad Request. Please check your input.';
      case 401:
        return 'Invalid credentials. Please try again.';
      case 403:
        return 'You are not authorized to perform this action.';
      case 409:
        return 'This account already exists. Try a different email or username.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  };

  const handleLogin = async (username, password) => {
    try {
      setError('');
      await dispatch(login({ username, password })).unwrap();
    } catch (err) {
      const customMessage = getErrorMessage(err.status);
      setError(customMessage || err.message);
    }
  };

  const handleRegister = async (email, username, password) => {
    try {
      setError('');
      await dispatch(register({ email, username, password })).unwrap();
    } catch (err) {
      const customMessage = getErrorMessage(err.status);
      setError(customMessage || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo2.png')} style={styles.logo} />

      {isRegister ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity onPress={() => handleRegister(email, username, password)} style={styles.button}>
            <Text style={styles.buttonText}>REGISTER</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsRegister(false)}>
            <Text style={styles.switchText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity onPress={() => handleLogin(username, password)} style={styles.button}>
            <Text style={styles.buttonText}>CONNECTION</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsRegister(true)}>
            <Text style={styles.switchText}>New here? Create an account</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B873E',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#3B873E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    color: '#3B873E',
    marginTop: 20,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});
