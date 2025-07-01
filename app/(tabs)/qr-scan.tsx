import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function QRScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [userTokens, setUserTokens] = useState<number>(100);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScanned = (barcode: { type: string; data: string }) => {
    if (barcode.data !== scannedData) {
      setScannedData(barcode.data);
      setAmountToPay(Math.floor(Math.random() * 50) + 10);
      setModalVisible(true);
      console.log(`Scanned ${barcode.type}: ${barcode.data}`);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setModalVisible(false);
    setAmountToPay(0);
  };

  const handlePayment = () => {
    if (userTokens >= amountToPay) {
      setUserTokens((prevTokens) => prevTokens - amountToPay);
      Alert.alert(
        'Succès',
        `Paiement de ${amountToPay} tokens effectué ! Il vous reste ${userTokens - amountToPay} tokens.`
      );
    } else {
      Alert.alert(
        'Erreur',
        `Fonds insuffisants. Vous avez ${userTokens} tokens, mais il faut ${amountToPay} tokens.`
      );
    }
    resetScanner();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Demande de permission en cours...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Permission caméra refusée. Activez-la dans les paramètres.</Text>
        <Button title="Demander la permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanneur de QR Code</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={({ type, data }) => {
            if (data && !modalVisible) {
              handleScanned({ type, data });
            }
          }}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetScanner}>
        <TouchableWithoutFeedback onPress={resetScanner}>
          <View style={styles.modalOverlay}>
            <View style={styles.bottomMenu}>
              <Text style={styles.menuTitle}>Détails du paiement</Text>
              <Text style={styles.menuText}>Montant à payer : {amountToPay} tokens</Text>
              <Text style={styles.menuText}>Vos tokens : {userTokens} tokens</Text>
              <View style={styles.menuButtonContainer}>
                <Button title="Payer" onPress={handlePayment} />
                <View style={{ marginTop: 10 }}>
                  <Button title="Annuler" onPress={resetScanner} color="#FF6347" />
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomMenu: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  menuText: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  menuButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
