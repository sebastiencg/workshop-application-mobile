import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native'
// @ts-ignore
import logoImage from '@/assets/images/logo.png'
import { fetcherPost } from '@/services/apiService'

const RegisterScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordVisibility, setPasswordVisibility] = useState(true)
  const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(true)
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({ headerShown: false })
    StatusBar.setBackgroundColor('white')
    StatusBar.setBarStyle('dark-content')
  }, [navigation])

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility)
  }

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisibility(!confirmPasswordVisibility)
  }

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide.')
      return
    }

    try {
      const data = await fetcherPost('/register', {
        email,
        password,
      })

      Alert.alert(
        'Inscription réussie',
        'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/login'),
          },
        ]
      )
    } catch (error) {
      console.error('handleRegister: An error occurred during registration:', error)
      Alert.alert('Erreur', "Une erreur est survenue lors de l'inscription. Veuillez réessayer.")
    }
  }

  const navigateToLogin = () => {
    router.push('/login')
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={logoImage} style={styles.logo} />

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#4d4d4d" style={{ marginHorizontal: 10 }} />
        <TextInput
          style={styles.input}
          placeholder="VotreEmail@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
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
          placeholder="********"
          secureTextEntry={passwordVisibility}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={{ paddingHorizontal: 10 }}>
          <Ionicons name={passwordVisibility ? 'eye-off' : 'eye'} size={24} color="#4d4d4d" />
        </TouchableOpacity>
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
          placeholder="********"
          secureTextEntry={confirmPasswordVisibility}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={toggleConfirmPasswordVisibility}
          style={{ paddingHorizontal: 10 }}
        >
          <Ionicons
            name={confirmPasswordVisibility ? 'eye-off' : 'eye'}
            size={24}
            color="#4d4d4d"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>S'inscrire</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Vous avez déjà un compte? </Text>
        <TouchableOpacity onPress={navigateToLogin}>
          <Text style={styles.footerLinkText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const DARK_GREY = '#333';
const PRIMARY = '#EB7F15';
const SECONDARY = '#FCF6DF'

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 40,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: SECONDARY,
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
    backgroundColor: PRIMARY,
    padding: 15,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    width: '80%',
  },
  footerText: {
    fontSize: 14,
    color: DARK_GREY,
  },
  footerLinkText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: 'bold',
  },
})

export default RegisterScreen
