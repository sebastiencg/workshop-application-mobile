import React, { useState } from 'react'
import { StyleSheet, View, Pressable, Text, Dimensions } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { router } from 'expo-router'
import { IconSymbol } from '@/components/ui/IconSymbol'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useUser } from '@/contexts/UserContext'

export default function ProfileScreen() {
  const { user, setUser } = useUser()

  const handleLogout = async () => {
    await AsyncStorage.clear()
    setUser(null)
    router.replace('/login')
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <ThemedText type="title">Profil employé</ThemedText>
        <Pressable onPress={handleLogout}>
          <IconSymbol size={28} name="logo.xbox" color={'black'} />
        </Pressable>
      </View>

      <ThemedView style={styles.centeredBox}>
        <Pressable
          onPress={() => {
            router.navigate('/guest/(tabs)/profile')
          }}
          style={styles.backBtn}
        >
          <ThemedText style={styles.backBtnText}>Retourner vers l’espace visiteur</ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 24, marginTop: 48, height: '100%', backgroundColor: 'white' },
  centeredBox: {
    height: Dimensions.get('window').height / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#EB7F15',
    alignItems: 'center',
    borderRadius: 28,
  },
  backBtnText: {
    color: '#fff',
  },
})
