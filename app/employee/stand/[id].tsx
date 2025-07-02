import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  TextInput,
} from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import QRCode from 'react-native-qrcode-svg'

type StandItem = {
  id: number
  name: string
  description: string
  price: number
  image: string
}

const mockStandItems: Record<string, StandItem[]> = {
  '1': [
    {
      id: 1,
      name: 'Pinte de bière blonde',
      description: 'Bière blonde artisanale locale - 50cl',
      price: 5,
      image: 'https://img.icons8.com/?size=150&id=gvSTbbYdFYYL',
    },
    {
      id: 2,
      name: 'Pinte de bière ambrée',
      description: 'Bière ambrée avec des notes caramélisées - 50cl',
      price: 6,
      image: 'https://img.icons8.com/?size=150&id=gvSTbbYdFYYL',
    },
    {
      id: 3,
      name: 'Demi de bière IPA',
      description: 'IPA houblonnée et fruitée - 25cl',
      price: 4,
      image: 'https://img.icons8.com/?size=150&id=gvSTbbYdFYYL',
    },
    {
      id: 4,
      name: 'Bière sans alcool',
      description: 'Bière artisanale sans alcool - 33cl',
      price: 4,
      image: 'https://img.icons8.com/?size=150&id=gvSTbbYdFYYL',
    },
    {
      id: 5,
      name: 'Cocktail du festival',
      description: 'Mélange surprise du barman',
      price: 8,
      image: 'https://img.icons8.com/?size=150&id=gvSTbbYdFYYL',
    },
  ],
  '2': [
    {
      id: 1,
      name: 'Merguez de Salopard',
      description: 'Merguez grillée au barbecue - 2 pièces',
      price: 3,
      image: 'https://img.icons8.com/?size=150&id=lrb9oiq7i0p9',
    },
    {
      id: 2,
      name: 'Saucisse blanche',
      description: "Saucisse blanche à l'alsacienne - 1 pièce",
      price: 3,
      image: 'https://img.icons8.com/?size=150&id=lrb9oiq7i0p9',
    },
    {
      id: 3,
      name: 'Hot Dog',
      description: 'Hot dog avec saucisse et ketchup/moutarde',
      price: 4,
      image: 'https://img.icons8.com/?size=150&id=lrb9oiq7i0p9',
    },
    {
      id: 4,
      name: 'Frites',
      description: 'Portion de frites fraîches',
      price: 3,
      image: 'https://img.icons8.com/?size=150&id=lrb9oiq7i0p9',
    },
    {
      id: 5,
      name: 'Menu Complet',
      description: 'Sandwich au choix + Frites + Boisson',
      price: 8,
      image: 'https://img.icons8.com/?size=150&id=lrb9oiq7i0p9',
    },
    {
      id: 6,
      name: 'Burger Maison',
      description: 'Burger avec viande locale et fromage',
      price: 6,
      image: 'https://img.icons8.com/?size=150&id=lrb9oiq7i0p9',
    },
  ],
  '3': [
    {
      id: 1,
      name: 'T-shirt Festival',
      description: 'T-shirt officiel du festival - Édition 2023',
      price: 15,
      image: 'https://img.icons8.com/?size=150&id=kLORTzuNOM2d',
    },
    {
      id: 2,
      name: 'Casquette',
      description: 'Casquette brodée avec le logo du festival',
      price: 12,
      image: 'https://img.icons8.com/?size=150&id=kLORTzuNOM2d',
    },
    {
      id: 3,
      name: 'Smarties XL',
      description: 'Tube géant de Smarties®',
      price: 2,
      image: 'https://img.icons8.com/?size=150&id=kLORTzuNOM2d',
    },
    {
      id: 4,
      name: 'Porte-clés',
      description: 'Porte-clés collector du festival',
      price: 5,
      image: 'https://img.icons8.com/?size=150&id=kLORTzuNOM2d',
    },
    {
      id: 5,
      name: 'Affiche dédicacée',
      description: 'Affiche du festival dédicacée par les artistes',
      price: 20,
      image: 'https://img.icons8.com/?size=150&id=kLORTzuNOM2d',
    },
    {
      id: 6,
      name: 'Gourde réutilisable',
      description: 'Gourde en métal avec logo du festival - 500ml',
      price: 10,
      image: 'https://img.icons8.com/?size=150&id=kLORTzuNOM2d',
    },
    {
      id: 7,
      name: 'Bracelet festival',
      description: 'Bracelet tissé aux couleurs du festival',
      price: 3,
      image: 'https://img.icons8.com/?size=150&id=kLORTzuNOM2d',
    },
  ],
}

type Stand = {
  id: number
  name: string
  description: string
  latitude?: number
  longitude?: number
  image?: string
}

const stands: Record<string, Stand> = {
  '1': {
    id: 1,
    name: 'Bar à bières',
    description: 'Jeune bar à bière aberrant de coiffeur amateur',
    latitude: 45.7214,
    longitude: 4.8157,
    image: 'https://img.icons8.com/?size=150&id=gvSTbbYdFYYL',
  },
  '2': {
    id: 2,
    name: 'Stand à la saucisse',
    description: 'Petit stand entre amis, avec de belles merguez',
    latitude: 45.7205,
    longitude: 4.814834,
    image: 'https://img.icons8.com/?size=150&id=lrb9oiq7i0p9',
  },
  '3': {
    id: 3,
    name: 'Goodies et smarties',
    description: 'Stand de ventes de goodies du festival et de smarties®',
    latitude: 45.7207,
    longitude: 4.814834,
    image: 'https://img.icons8.com/?size=150&id=kLORTzuNOM2d',
  },
}

export default function StandDetailScreen() {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [standItems, setStandItems] = useState<StandItem[]>([])
  const [stand, setStand] = useState<Stand | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StandItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [beerSize, setBeerSize] = useState('50cl')
  const [showQRCode, setShowQRCode] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      if (id && typeof id === 'string') {
        setStand(stands[id])
        setStandItems(mockStandItems[id] || [])
      }
      setLoading(false)
    }, 500)
  }, [id])

  const handleBackPress = () => {
    navigation.goBack()
  }

  const handleManageItem = (item: StandItem) => {
    setSelectedItem(item)
    setQuantity(1)
    setBeerSize('50cl')
    setShowQRCode(false)
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setSelectedItem(null)
    setQuantity(1)
    setBeerSize('50cl')
    setShowQRCode(false)
  }

  const handleGenerateQRCode = () => {
    setShowQRCode(true)
  }

  const calculateTotal = () => {
    if (!selectedItem) return 0
    let price = selectedItem.price
    if (selectedItem.name.includes('bière') && beerSize === '25cl') {
      price = price * 0.6
    }
    return price * quantity
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Chargement des articles...</Text>
      </View>
    )
  }

  if (!stand) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Stand non trouvé</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1e90ff" />
        </TouchableOpacity>
        <Text style={styles.title}>{stand.name}</Text>
      </View>

      <Text style={styles.description}>{stand.description}</Text>

      <Text style={styles.sectionTitle}>Articles disponibles</Text>

      {standItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucun article disponible</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.cardContainer}
          showsVerticalScrollIndicator={false}
        >
          {standItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="contain" />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <Text style={styles.cardPrice}>{item.price} jetons</Text>
              </View>
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleManageItem(item)}
                >
                  <Text style={styles.actionButtonText}>Voir l'article</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedItem ? selectedItem.name : "Gérer l'article"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <View style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Quantité</Text>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setQuantity(quantity + 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {selectedItem.name.toLowerCase().includes('bière') && (
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Taille</Text>
                    <View style={styles.sizeSelector}>
                      <TouchableOpacity
                        style={[styles.sizeButton, beerSize === '25cl' && styles.selectedSize]}
                        onPress={() => setBeerSize('25cl')}
                      >
                        <Text
                          style={[
                            styles.sizeButtonText,
                            beerSize === '25cl' && styles.selectedSizeText,
                          ]}
                        >
                          25cl
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.sizeButton, beerSize === '50cl' && styles.selectedSize]}
                        onPress={() => setBeerSize('50cl')}
                      >
                        <Text
                          style={[
                            styles.sizeButtonText,
                            beerSize === '50cl' && styles.selectedSizeText,
                          ]}
                        >
                          50cl
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Total:</Text>
                  <Text style={styles.priceValue}>{calculateTotal()} jetons</Text>
                </View>

                {showQRCode ? (
                  <View style={styles.qrCodeContainer}>
                    <QRCode
                      value={JSON.stringify({
                        tokens: calculateTotal(),
                      })}
                      size={200}
                    />
                    <Text style={styles.qrCodeText}>
                      Scannez ce QR code pour payer {calculateTotal()} jetons
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.generateQRButton} onPress={handleGenerateQRCode}>
                    <Text style={styles.generateQRButtonText}>Générer QR code de paiement</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#1e90ff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
    height: 120,
    backgroundColor: '#f9f9f9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e90ff',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
    alignItems: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    paddingBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  sizeSelector: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  selectedSize: {
    backgroundColor: '#1e90ff',
    borderColor: '#1e90ff',
  },
  sizeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSizeText: {
    color: 'white',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e90ff',
  },
  generateQRButton: {
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 25,
  },
  generateQRButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 20,
  },
  qrCodeText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
})
