import React from 'react'
import { FlatList, Pressable, StyleSheet, View, Image, Dimensions, ScrollView } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { router } from 'expo-router'

type Stand = {
  id: number
  name: string
  img: string
}

const stands: Stand[] = [
  {
    id: 1,
    name: 'Bar à bières',
    img: 'https://images.happycow.net/venues/1024/25/39/hcmp253902_1228597.jpeg',
  },
  {
    id: 2,
    name: 'Stand à la saucisse',
    img: 'https://images.happycow.net/venues/1024/25/39/hcmp253902_1228597.jpeg',
  },
  {
    id: 3,
    name: 'Goodies et smarties',
    img: 'https://images.happycow.net/venues/1024/25/39/hcmp253902_1228597.jpeg',
  },
  {
    id: 4,
    name: 'Goodies et smarties',
    img: 'https://images.happycow.net/venues/1024/25/39/hcmp253902_1228597.jpeg',
  },
]

export default function HomeScreen() {
  const renderItem = ({ item }: { item: Stand }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/employee/stand/[id]', params: { id: item.id } })}
    >
      <Image source={{ uri: item.img }} style={styles.thumb} />
      <ThemedText style={styles.name}>{item.name}</ThemedText>
    </Pressable>
  )

  return (
    <View style={styles.container}>
      <ThemedText type="title">Dans quelle boutique vas‑tu taffer?</ThemedText>

      <FlatList
        data={stands}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.rowSpace}
      />
    </View>
  )
}

const GAP = 16
const CARD_WIDTH = (Dimensions.get('window').width - GAP * 3 - 48) / 2

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 24,
    marginTop: 48,
    backgroundColor: 'white',
  },

  listContainer: { padding: 8, marginTop: 24 },
  rowSpace: { justifyContent: 'space-between' },

  title: { marginBottom: GAP * 1.5 },

  card: {
    width: CARD_WIDTH,
    marginBottom: GAP * 1.5,
  },
  thumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#ccc',
  },
  name: { fontSize: 16 },
})
