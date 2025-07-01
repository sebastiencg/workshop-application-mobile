import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Text,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/contexts/UserContext';

export default function ProfileScreen() {
  const balance = 42;
  const tabBarHeight = 50;
  const [customAmount, setCustomAmount] = useState('');
  const { user, setUser } = useUser();

  const [modalVisible, setModalVisible] = useState(false);

  const expenses = [
    { id: '1', place: 'Saucisse Bar', amount: 30, time: '14:32' },
    { id: '2', place: 'Saucisse Bar', amount: 25, time: '13:05' },
    { id: '3', place: 'Saucisse Bar', amount: 50, time: '11:47' },
  ];

  const showModalForTokenShop = () => {
    setModalVisible(true);
  };

  const handleCustomAmount = () => {
    const parsed = parseInt(customAmount, 10);

    if (!isNaN(parsed) && parsed >= 10) {
      confirmBuyCoins(parsed);
      setCustomAmount('');
      setModalVisible(false);
    } else {
      console.log('Montant invalide');
    }
  };


  const buyCoins = (amount: number) => {
    setModalVisible(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    router.replace('/login');
  };
  const confirmBuyCoins = (amount: number) => {
    Alert.alert(
      'Confirmation d’achat',
      `Es-tu sûr·e de vouloir acheter ${amount} coins ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: () => buyCoins(amount),
        },
      ],
      { cancelable: true }
    );
  };


  const confirmLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Es-tu sûr·e de vouloir te déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: handleLogout,
        },
      ],
      { cancelable: true }
    );
  };

  const navigateToAdminZone = () => {
    router.push('/employee/profile');
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputRow}>
          <ThemedText type="title">Coucou toi</ThemedText>
          <Pressable onPress={confirmLogout}>
            <IconSymbol size={28} name="logout" color={'#fff'} />
          </Pressable>
        </View>

        <ThemedView style={styles.balanceCard}>
          <ThemedText type="subtitle" style={styles.balanceLabel}>
            Ton solde
          </ThemedText>
          <ThemedText type="title" style={styles.balanceValue}>
            {balance} coins
          </ThemedText>
        </ThemedView>

        {user?.roles.includes('ROLE_Admin') && (
          <Pressable style={styles.adminButton} onPress={navigateToAdminZone}>
            <Text style={styles.adminButtonText}>Accéder à l'espace employé</Text>
          </Pressable>
        )}

        <ThemedText style={styles.h2}>Tes dernières dépenses</ThemedText>
        {expenses.map((exp) => (
          <ThemedView key={exp.id} style={styles.expenseRow}>
            <View>
              <ThemedText>{exp.place}</ThemedText>
              <ThemedText>{exp.time}</ThemedText>
            </View>
            <ThemedText style={styles.expenseAmount}>‑ {exp.amount}</ThemedText>
          </ThemedView>
        ))}
      </ScrollView>

      <Pressable
        accessibilityLabel="Acheter des jetons"
        onPress={showModalForTokenShop}
        style={[styles.floatingButton, { bottom: tabBarHeight }]}>
        <Text style={styles.floatingButtonText}>Acheter des jetons</Text>
      </Pressable>

      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir le montant</Text>
            <Text style={styles.modalInfo}>1 euro = 10 coins</Text>

            {[50, 100, 200, 500].map((amount) => (
              <Pressable key={amount} onPress={() => confirmBuyCoins(amount)} style={styles.amountButton}>
                <Text style={styles.amountText}>{amount} coins</Text>
              </Pressable>
            ))}

            <Text style={styles.customAmount}>Autre montant: </Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Autre montant"
                keyboardType="numeric"
                value={customAmount}
                onChangeText={setCustomAmount}
                style={styles.input}
              />
              <Pressable onPress={handleCustomAmount} style={styles.buyButton}>
                <Text style={styles.amountText}>Acheter</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const INPUT_HEIGHT = 48;
const BORDER_RADIUS = 8;
const FONT_SIZE_BODY = 16;
const FONT_SIZE_H2 = 18;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 24, gap: 24, marginTop: 48 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h2: { fontSize: FONT_SIZE_H2, marginTop: 18 },

  /* Solde */
  balanceCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: { marginBottom: 4 },
  balanceValue: { fontSize: 32, fontWeight: '700' },

  /* Dépenses */
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  expenseAmount: {
    fontWeight: '700',
    fontSize: FONT_SIZE_H2,
  },

  adminButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#265d88',
    alignItems: 'center',
    borderRadius: 28,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE_BODY,
    fontWeight: '600',
  },
  /* Bouton  flottant */
  floatingButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    paddingVertical: 20,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  floatingButtonText: { color: '#fff', fontSize: FONT_SIZE_BODY, fontWeight: '600' },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 24 },
  modalTitle: { fontSize: FONT_SIZE_H2, fontWeight: '600', marginBottom: 5, textAlign: 'center' },
  modalInfo: { textAlign: 'center', marginBottom: 20 },

  amountButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS,
    alignItems: 'center',
    marginBottom: 8,
  },
  amountText: { fontSize: FONT_SIZE_BODY, fontWeight: '500' },

  customAmount: { marginTop: 24 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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

  cancelButton: { marginTop: 40, alignItems: 'center' },
});
