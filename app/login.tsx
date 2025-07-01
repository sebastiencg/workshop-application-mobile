import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logoImage from '@/assets/images/icon.png';
import { fetcher, fetcherPost } from '@/services/apiService';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const navigation = useNavigation();
  const { setUser } = useUser();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    StatusBar.setBackgroundColor('#D8E7FE');
    StatusBar.setBarStyle('dark-content');
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const data = await fetcherPost('/login_check', { email, password });

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      await AsyncStorage.setItem('refresh_token_expiration', data.refresh_token_expiration.toString());
      await AsyncStorage.setItem('hasSession', 'true');


      const user = await fetcher('/user');
      setUser(user.data);

      Alert.alert('Connexion réussie', 'Bienvenue !');



      router.replace('/(tabs)');

    } catch (error) {
      console.error('Erreur de connexion :', error);
      Alert.alert('Erreur', 'Email ou mot de passe incorrect.');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  return (
    <View style={styles.container}>
      <Image source={logoImage} style={styles.logo} />
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#4d4d4d" style={{ marginHorizontal: 10 }} />
        <TextInput
          style={styles.input}
          placeholder="VotreEmail@gmail.com"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#4d4d4d" style={{ marginHorizontal: 10 }} />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="············"
          secureTextEntry={passwordVisibility}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={{ paddingHorizontal: 10 }}>
          <Ionicons name={passwordVisibility ? 'eye-off' : 'eye'} size={24} color="#4d4d4d" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Mot de passe oublié ?</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D8E7FE',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#e6e9f9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    width: '80%',
  },
  input: {
    marginLeft: 10,
    width: '90%',
  },
  button: {
    backgroundColor: '#011B46',
    padding: 15,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '80%',
  },
  footerText: {
    fontSize: 14,
    color: '#5e5e5e',
  },
});

export default LoginScreen;
