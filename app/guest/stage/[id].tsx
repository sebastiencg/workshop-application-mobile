import React from 'react'
import { StyleSheet, Image, View, FlatList, Pressable } from 'react-native'

import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { router } from 'expo-router'
import { IconSymbol } from '@/components/ui/IconSymbol'

const setSchedule = [
  { time: '14:00', artist: 'DJ Mirage' },
  { time: '15:00', artist: 'DJ Mirage' },
  { time: '16:30', artist: 'DJ Mirage' },
  { time: '18:00', artist: 'DJ Mirage' },
  { time: '21:00', artist: 'DJ Mirage' },
  { time: '22:00', artist: 'DJ Mirage' },
]

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export default function ProfileScreen() {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const currentIndex = setSchedule.findIndex((slot, i) => {
    const start = toMinutes(slot.time)
    const end = i < setSchedule.length - 1 ? toMinutes(setSchedule[i + 1].time) : 24 * 60
    return nowMinutes >= start && nowMinutes < end
  })

  const renderItem = ({ item, index }: { item: (typeof setSchedule)[0]; index: number }) => {
    const isCurrent = index === currentIndex

    return (
      <View style={styles.timelineRow}>
        {index !== setSchedule.length - 1 && (
          <View style={[styles.verticalLine, isCurrent && styles.currentVerticalLine]} />
        )}

        <View style={[styles.bullet, isCurrent && styles.currentBullet]} />

        <View style={[styles.card, isCurrent && styles.currentCard]}>
          <ThemedText style={[styles.time, isCurrent && styles.currentTime]}>
            {item.time}
          </ThemedText>
          <ThemedText style={[styles.artist, isCurrent && styles.currentArtist]}>
            {item.artist}
          </ThemedText>
        </View>
      </View>
    )
  }

  return (
    <ParallaxScrollView
      headerImage={
        <Image
          source={{
            uri: 'https://www.heurebleue.fr/wp-content/files_dnk/cache/7e6f4bb05446b6935b7583c8132db6e1_festival-evasion-2019-folamour-scne-house.png',
          }}
          resizeMode="cover"
          style={styles.headerImage}
        />
      }
      headerBackgroundColor={{
        dark: '',
        light: '',
      }}
    >
      <Pressable onPress={() => router.push('/')} style={styles.flexRow}>
        <IconSymbol name={'chevron.left'} color={'#000'} />
        <ThemedText style={styles.backToHome}> retour à la carte</ThemedText>
      </Pressable>

      <ThemedView>
        <ThemedText type="title" style={styles.title}>
          Scène Electro House
        </ThemedText>
      </ThemedView>

      <ThemedText style={styles.description}>
        Plonge au cœur d’un tourbillon de basses percutantes et de drops survoltés ! La scène
        Electro House du festival fait vibrer les foules avec des sets explosifs, des lumières
        stroboscopiques et une énergie sans relâche. Prépare-toi à danser, sauter, et te perdre dans
        le rythme effréné de l’électro.
      </ThemedText>

      <FlatList
        data={setSchedule}
        renderItem={renderItem}
        keyExtractor={(item) => item.time}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ParallaxScrollView>
  )
}

const BULLET_SIZE = 12
const LINE_WIDTH = 2
const PRIMARY = '#EB7F15'
const SECONDARY = '#FCF6DF'

const styles = StyleSheet.create({
  headerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backToHome: {
    color: '#000',
  },
  title: {
    paddingVertical: 16,
    textAlign: 'center',
  },
  description: {
    color: '#000',
  },

  listContent: { paddingVertical: 24 },

  timelineRow: {
    flexDirection: 'row',
    paddingLeft: BULLET_SIZE + 12,
    marginBottom: 24,
  },

  verticalLine: {
    position: 'absolute',
    top: BULLET_SIZE,
    left: BULLET_SIZE / 2,
    width: LINE_WIDTH,
    height: '100%',
    backgroundColor: '#000',
  },
  currentVerticalLine: {
    display: 'none',
  },

  bullet: {
    position: 'absolute',
    left: 0,
    top: BULLET_SIZE / 2,
    width: BULLET_SIZE,
    height: BULLET_SIZE,
    borderRadius: BULLET_SIZE / 2,
    backgroundColor: PRIMARY,
  },
  currentBullet: { width: 0 },

  card: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  currentCard: {
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },

  time: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: PRIMARY,
  },
  currentTime: {
    color: '#fff',
    marginTop: 10,
  },
  artist: {
    fontSize: 18,
    color: '#000',
  },
  currentArtist: {
    color: '#fff',
  },
})
