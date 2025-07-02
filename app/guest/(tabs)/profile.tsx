import AsyncStorage from '@react-native-async-storage/async-storage'
import Slider from '@react-native-community/slider'
import {
  initPaymentSheet,
  PaymentSheetError,
  presentPaymentSheet,
} from '@stripe/stripe-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useUser } from '@/contexts/UserContext'
import { fetcher, fetcherPost } from '@/services/apiServiceTest'

export default function ProfileScreen() {
  const balance = 42
  const [customSliderValue, setCustomSliderValue] = useState(100)
  const { user, setUser } = useUser()
  const [ticketModalVisible, setTicketModalVisible] = useState(false)

  const [modalVisible, setModalVisible] = useState(false)
  const [activeCard, setActiveCard] = useState<number | null>(null)

  const tokenPackages = [
    { amount: 50, bonus: 0, color: ['#FCF6DF', '#FCF6DF'] },
    { amount: 100, bonus: 10, color: ['#FCF6DF', '#FCF6DF'] },
    { amount: 200, bonus: 30, color: ['#FCF6DF', '#FCF6DF'] },
    { amount: 500, bonus: 100, color: ['#FCF6DF', '#FCF6DF'] },
  ]

  const expenses = [
    { id: '1', place: 'Saucisse Bar', amount: 30, time: '14:32' },
    { id: '2', place: 'Saucisse Bar', amount: 25, time: '13:05' },
  ]

  const prepareAndOpenPaymentSheet = async (amountCoins: number) => {
    try {
      const data = await fetcherPost('/payment-intent', { amountCoins })
      const { paymentIntent, ephemeralKey, customer } = data

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Saucisse Bar',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: false,
      })

      if (initError) {
        Alert.alert('Stripe', initError.message)
        return
      }

      const { error: presentError } = await presentPaymentSheet({
        clientSecret: paymentIntent,
      })

      if (presentError) {
        if ((presentError as unknown as PaymentSheetError).code !== 'Canceled') {
          Alert.alert('Échec', presentError.message)
        }
      } else {
        Alert.alert('Succès', 'Paiement effectué !')
        await fetcher('/coins/credit')
      }
    } catch (err: any) {
      console.error(err)
      Alert.alert('Stripe', err.message || 'Erreur inconnue')
    }
  }

  const handleLogout = async () => {
    await AsyncStorage.clear()
    setUser(null)
    router.replace('/login')
  }

  const confirmBuyCoins = (amount: number) => {
    Alert.alert(
      'Confirmation d’achat',
      `Es-tu sûr·e de vouloir acheter ${amount} coins ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: () => {
            setModalVisible(false)
            prepareAndOpenPaymentSheet(amount)
          },
        },
      ],
      { cancelable: true }
    )
  }

  const calculateBonus = (amount: number): number => {
    if (amount < 100) return 0
    if (amount < 200) return Math.floor(amount * 0.1)
    if (amount < 500) return Math.floor(amount * 0.15)
    return Math.floor(amount * 0.2)
  }

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputRow}>
          <ThemedText type="title" style={styles.h1}>
            Votre profil
          </ThemedText>
          <Pressable onPress={handleLogout}>
            <IconSymbol size={28} name="logout" color="#000" />
          </Pressable>
        </View>

        {user?.roles.includes('ROLE_Admin') && (
          <Pressable style={styles.adminButton} onPress={() => router.push('/employee/(tabs)')}>
            <Text style={styles.adminButtonText}>Accéder à l’espace employé</Text>
            <IconSymbol size={20} name="chevron.right" color="#000" />
          </Pressable>
        )}

        {user ? (
          <ThemedView style={styles.balanceCard}>
            <ThemedText type="subtitle" style={styles.balanceLabel}>
              Ton solde
            </ThemedText>
            <ThemedText type="title" style={styles.balanceValue}>
              {balance} coins
            </ThemedText>

            <Pressable onPress={() => setModalVisible(true)} style={styles.addCoinsButton}>
              <Text style={styles.addCoinsText}>Recharger</Text>
            </Pressable>
          </ThemedView>
        ) : (
          <Pressable
            accessibilityLabel="Acheter un billet"
            onPress={() => setTicketModalVisible(true)}
            style={styles.tokenShopButton}
          >
            <Text style={styles.buttonText}>Acheter un billet</Text>
          </Pressable>
        )}

        <ThemedText style={styles.h2}>Tes dernières dépenses</ThemedText>

        {expenses.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol size={48} name="receipt" style={styles.emptyIcon} />
            <ThemedText style={styles.emptyText}>Aucune dépense récente</ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.expensesList}>
            {expenses.map((exp, index) => (
              <ThemedView
                key={exp.id}
                style={[styles.expenseRow, index === expenses.length - 1 && styles.lastExpenseRow]}
              >
                <View style={styles.expenseContent}>
                  <View style={styles.leftSection}>
                    <View style={styles.iconContainer}>
                      <IconSymbol
                        size={24}
                        name="map"
                        style={styles.expenseIcon}
                        color={'#EB7F15'}
                      />
                    </View>
                    <View style={styles.expenseDetails}>
                      <ThemedText style={styles.expensePlace}>{exp.place}</ThemedText>
                      <ThemedText style={styles.expenseTime}>{exp.time}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.expenseAmount}>{exp.amount} coins</ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Acheter des jetons</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <IconSymbol size={24} name="xmark" color="#333" />
              </Pressable>
            </View>

            <Text style={styles.modalInfo}>1 euro = 10 coins</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsContainer}
            >
              {tokenPackages.map((pack, index) => (
                <Pressable
                  key={pack.amount}
                  onPress={() => {
                    setActiveCard(index)
                    confirmBuyCoins(pack.amount)
                  }}
                  style={[styles.card, activeCard === index && styles.activeCard]}
                >
                  <LinearGradient
                    colors={pack.color as any}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{pack.amount}</Text>
                      <Text style={styles.coinsLabel}>coins</Text>
                      {pack.bonus > 0 && (
                        <View style={styles.bonusBadge}>
                          <Text style={styles.bonusText}>+{pack.bonus} offerts</Text>
                        </View>
                      )}
                      <Text style={styles.priceText}>{pack.amount / 10} €</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.divider} />

            <Text style={styles.customAmountTitle}>Montant personnalisé</Text>

            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={1000}
                step={10}
                value={customSliderValue}
                onValueChange={(value) => setCustomSliderValue(value)}
                minimumTrackTintColor="#EB7F15"
                maximumTrackTintColor="#EB7F15"
                thumbTintColor="#EB7F15"
              />

              <View style={styles.sliderLabels}>
                <Text>100</Text>
                <Text style={styles.sliderValue}>
                  {customSliderValue} coins
                  {calculateBonus(customSliderValue) > 0 &&
                    ` (+${calculateBonus(customSliderValue)} offerts)`}
                </Text>
                <Text>1000</Text>
              </View>

              <Text style={styles.totalValue}>
                Total : {customSliderValue + calculateBonus(customSliderValue)} coins pour{' '}
                {customSliderValue / 10} €
              </Text>
            </View>

            <Pressable
              onPress={() => confirmBuyCoins(customSliderValue)}
              style={styles.buyCustomButton}
            >
              <LinearGradient
                colors={['#EB7F15', '#d16a00'] as any}
                style={styles.buyButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buyButtonText}>Payer {customSliderValue} coins</Text>
              </LinearGradient>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={ticketModalVisible}
        onRequestClose={() => setTicketModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setTicketModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Acheter un billet d’entrée</Text>
              <Pressable onPress={() => setTicketModalVisible(false)} style={styles.closeButton}>
                <IconSymbol size={24} name="xmark" color="#333" />
              </Pressable>
            </View>

            <View style={styles.ticketCard}>
              <View style={styles.ticketContent}>
                <Text style={styles.ticketTitle}>15 €</Text>
                <Text style={styles.ticketDescription}>
                  Accès complet à l’événement pour toute la durée
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.paymentButton}
              onPress={() => {
                setTicketModalVisible(false)
                Alert.alert(
                  'Confirmation d’achat',
                  'Voulez-vous acheter un billet pour 15 € ?',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Confirmer',
                      style: 'default',
                      onPress: () => {
                        Alert.alert('Achat réussi', 'Votre billet est maintenant disponible.')
                      },
                    },
                  ],
                  { cancelable: true }
                )
              }}
            >
              <Text style={styles.paymentButtonText}>Payer avec une carte bancaire</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const FONT_SIZE_BODY = 16
const INPUT_HEIGHT = 48
const BORDER_RADIUS = 8
const SCREEN_WIDTH = Dimensions.get('window').width

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#ffffff' },
  container: { padding: 20, gap: 20, marginTop: 48 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  h1: {
    color: '#000',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 32,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  /* Solde */

  balanceLabel: {
    marginBottom: 4,
    fontSize: 16,
    opacity: 0.7,
    color: '#FCF6DF',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FCF6DF',
  },

  /* Dépenses */

  tokenShopButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#EB7F15',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },

  adminButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FCF6DF',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#EB7F15',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adminButtonText: {
    color: '#000',
    fontSize: FONT_SIZE_BODY,
    fontWeight: '600',
  },

  addCoinsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addCoinsText: { color: '#fff', fontSize: 14, fontWeight: '500' },

  /* Modal générique */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  modalInfo: {
    marginBottom: 20,
    fontSize: 15,
    color: '#666',
  },

  cardsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 10,
  },

  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 24 },
  customAmountTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  sliderContainer: { marginBottom: 24 },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  card: {
    width: SCREEN_WIDTH * 0.35,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    backgroundColor: '#FCF6DF',
  },
  activeCard: {},
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'black',
  },
  coinsLabel: {
    fontSize: 16,
    color: 'black',
    marginBottom: 8,
  },
  amountText: { fontSize: FONT_SIZE_BODY, fontWeight: '500' },
  bonusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#EB7F15',
    borderRadius: 60,
  },

  bonusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EB7F15',
  },
  priceText: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  sliderValue: {
    fontWeight: '600',
    color: '#EB7F15',
  },
  totalValue: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
    fontWeight: '500',
    color: 'grey',
  },

  buyCustomButton: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  buyButton: {
    height: INPUT_HEIGHT,
    paddingHorizontal: 20,
    borderBottomEndRadius: BORDER_RADIUS,
    borderTopEndRadius: BORDER_RADIUS,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },

  emptyIcon: {
    opacity: 0.4,
    marginBottom: 12,
    color: '#EB7F15',
  },

  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    color: '#666',
  },

  /* Dépenses */
  expensesList: {
    gap: 6,
    marginBottom: 30,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  expenseIcon: {
    opacity: 1,
  },

  expenseDetails: {
    flex: 1,
  },

  expensePlace: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
    color: '#333',
  },

  rightSection: {
    alignItems: 'flex-end',
  },

  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  balanceCard: {
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#333',
    position: 'relative',
  },

  expenseRow: {
    backgroundColor: '#FCF6DF',
    borderRadius: 12,
    padding: 16,
  },

  lastExpenseRow: {
    marginBottom: 40,
  },

  expenseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ticketCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  ticketContent: {
    alignItems: 'center',
  },
  ticketTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'black',
    marginBottom: 8,
  },
  ticketDescription: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginBottom: 16,
  },
  paymentButton: {
    backgroundColor: '#EB7F15',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  paymentButtonText: {},
})
