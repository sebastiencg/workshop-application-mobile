import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  StatusBar,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import logoImage from '@/assets/images/icon.png'
import { fetcher, fetcherPost } from '@/services/apiService'
import { useUser } from '@/contexts/UserContext'
import { router } from 'expo-router'

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisibility, setPasswordVisibility] = useState(true)
  const navigation = useNavigation()
  const { setUser } = useUser()
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      router.replace('/guest/(tabs)')
    }
  }, [user])
  useEffect(() => {
    navigation.setOptions({ headerShown: false })
    StatusBar.setBackgroundColor('#D8E7FE')
    StatusBar.setBarStyle('dark-content')
  }, [navigation])
  type ErrorType = { code: number; message: string }

  const handleLogin = async () => {
    console.log('handleLogin: Starting login process...')
    console.log(`handleLogin: Attempting to log in with email: ${email}`)

    if (!email || !password) {
      console.log('handleLogin: Email or password fields are empty. Displaying alert.')
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.')
      return
    }

    try {
      console.log('handleLogin: Calling fetcherPost for /login_check...')
      const data = await fetcherPost('/login_check', { email, password })
      console.log('handleLogin: /login_check response data received:', data)

      console.log('handleLogin: Setting token and hasSession in AsyncStorage...')
      await AsyncStorage.setItem('token', data.token)
      await AsyncStorage.setItem('hasSession', 'true')
      console.log('handleLogin: Token and hasSession set successfully.')

      console.log('handleLogin: Calling fetcher for /profile...')
      const user = await fetcher('/profile/')
      console.warn('handleLogin: /profile response:', user)
      if (user !== null) {
        console.log(
          'handleLogin: User profile returned 401. Removing token and hasSession from AsyncStorage.'
        )
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('hasSession')
        throw new Error('User null')
      }
      //todo ajouter ce qui manque en créant un nouveau type
      setUser({
        username: 'tibo',
        roles: ['employee', 'guest', 'ROLE_USER', 'ROLE_Admin'],
        billet: '123456',
      })

      console.log('handleLogin: Login successful. Redirecting to /guest/(tabs).')
      router.replace('/guest/(tabs)')
    } catch (error: unknown) {
      console.error('handleLogin: An error occurred during login:', error)
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const typedError = error as ErrorType
        if (typedError.code === 401) {
          console.log(
            'handleLogin: User profile returned 401. Removing token and hasSession from AsyncStorage.'
          )
          await AsyncStorage.removeItem('token')
          await AsyncStorage.removeItem('hasSession')
          throw new Error('User null')
        }
      }
      Alert.alert('Erreur', 'Email ou mot de passe incorrect.')
    }
  }

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility)
  }

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
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#4d4d4d"
          style={{ marginHorizontal: 10 }}
        />
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
  )
}

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
})

export default LoginScreen
