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
    { amount: 50, bonus: 0, color: ['#222222', '#333333'] },
    { amount: 100, bonus: 10, color: ['#222222', '#333333'] },
    { amount: 200, bonus: 30, color: ['#222222', '#333333'] },
    { amount: 500, bonus: 100, color: ['#222222', '#333333'] },
  ]

  const expenses = [
    { id: '1', place: 'Saucisse Bar', amount: 30, time: '14:32' },
    { id: '2', place: 'Saucisse Bar', amount: 25, time: '13:05' },
  ]

  const prepareAndOpenPaymentSheet = async (amountCoins: number) => {
    try {
      const data = await fetcherPost('/payment-intent-ticket', { amountCoins })
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
  const confirmLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Es-tu sûr·e de vouloir te déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: () => {
            handleLogout()
          },
        },
      ],
      { cancelable: true }
    )
  }


  const confirmBuyCoins = (coin: number) => {
    const amountEuro = coin / 10
    const amount = amountEuro * 100

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

  const confirmBuyTicket = () => {
    const ticket = 15
    const amount = ticket * 100
    Alert.alert(
      'Confirmation d’achat',
      'Voulez-vous acheter un billet pour 15 € ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: () => {
            setTicketModalVisible(false)
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
            Coucou toi
          </ThemedText>
          <Pressable onPress={confirmLogout}>
            <IconSymbol size={28} name="logout" color="#000" />
          </Pressable>
        </View>

        {user?.roles.includes('ROLE_Admin') && (
          <Pressable style={styles.adminButton} onPress={() => router.push('/employee/(tabs)')}>
            <Text style={styles.adminButtonText}>Accéder à l’espace employé</Text>
            <IconSymbol size={20} name="chevron.right" color="#000" />
          </Pressable>
        )}

        {user?.ticket ? (
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
                      <IconSymbol size={24} name="map" style={styles.expenseIcon} color="#eee" />
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
                onValueChange={setCustomSliderValue}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#D1D1D1"
                thumbTintColor="#2196F3"
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
                colors={['#2196F3', '#1976D2'] as any}
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
                confirmBuyTicket()


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
const SCREEN_WIDTH = Dimensions.get('window').width

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, gap: 20, marginTop: 48 },

  inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h1: { color: '#000' },
  h2: { fontSize: 20, fontWeight: '600', marginTop: 32, color: '#333' },

  /* Bouton admin */
  adminButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adminButtonText: {
    color: '#000',
    fontSize: FONT_SIZE_BODY,
    fontWeight: '600',
  },

  /* Solde */
  balanceCard: {
    padding: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  balanceLabel: { marginBottom: 4, fontSize: 16, opacity: 0.7, color: '#fff' },
  balanceValue: { fontSize: 28, fontWeight: '700', color: '#fff' },
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

  /* Bouton achat billet */
  tokenShopButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },

  /* Dépenses */
  expensesList: { gap: 6, marginBottom: 30 },
  expenseRow: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16 },
  lastExpenseRow: { marginBottom: 40 },
  expenseContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseIcon: { opacity: 0.6 },
  expenseDetails: { flex: 1 },
  expensePlace: { fontSize: 16, fontWeight: '500', marginBottom: 2, color: '#333' },
  expenseTime: { fontSize: 14, color: '#666' },
  expenseAmount: { fontSize: 16, fontWeight: '600', color: '#333' },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  emptyIcon: { opacity: 0.4, marginBottom: 12, color: '#999' },
  emptyText: { fontSize: 16, opacity: 0.6, textAlign: 'center', color: '#666' },

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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#333' },
  closeButton: { padding: 8 },
  modalInfo: { marginBottom: 20, fontSize: 15, color: '#666' },

  /* Cards */
  cardsContainer: { paddingVertical: 8, paddingHorizontal: 4, gap: 10 },
  card: {
    backgroundColor: 'white',
    width: SCREEN_WIDTH * 0.35,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 4,
    elevation: 3,
  },
  activeCard: { borderWidth: 2, borderColor: '#2196F3', backgroundColor: '#444' },
  cardGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  cardContent: { alignItems: 'center' },
  cardTitle: { fontSize: 32, fontWeight: '700', color: '#fff' },
  coinsLabel: { fontSize: 16, color: '#fff', marginBottom: 8 },
  bonusBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 6,
  },

  bonusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  priceText: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },

  /* Slider */
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 24 },
  customAmountTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  sliderContainer: { marginBottom: 24 },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  sliderValue: { fontWeight: '600', color: '#2196F3' },
  totalValue: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
    fontWeight: '500',
    color: 'grey',
  },

  buyCustomButton: { height: 50, borderRadius: 25, overflow: 'hidden' },
  buyButtonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buyButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },

  /* Billet */
  ticketCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#000',
    elevation: 3,
  },
  ticketContent: { alignItems: 'center' },
  ticketTitle: { fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  ticketDescription: { fontSize: 16, color: '#FFF', textAlign: 'center', marginBottom: 16 },
  paymentButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  paymentButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
})
