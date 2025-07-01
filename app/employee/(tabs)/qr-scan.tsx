import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';

export default function QRScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [canEnter, setCanEnter] = useState<boolean>(true);
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [userQrData, setUserQrData] = useState<string>('user123456');
  const cameraRef = useRef(null);

  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScanned = (barcode: { type: string; data: string }) => {
    if (barcode.data !== scannedData) {
      setScannedData(barcode.data);
      setCanEnter(true);
      setModalVisible(true);
      console.log(`Scanned ${barcode.type}: ${barcode.data}`);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setModalVisible(false);
  };

  const handleContinue = () => {
    Alert.alert('Entrée accordée', "L'utilisateur peut accéder à l'événement.");
    resetScanner();
  };

  const handleDeny = () => {
    Alert.alert('Entrée refusée', "L'utilisateur ne peut pas accéder à l'événement.");
    resetScanner();
  };

  const navigateToRandomStand = () => {
    const randomStandId = Math.floor(Math.random() * 3) + 1;
    router.push(`/employee/stand/${randomStandId}`);
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
      <Text style={styles.title}>Billeterie</Text>
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
              <Text style={styles.menuTitle}>Vérification d'entrée</Text>
              {canEnter ? (
                <>
                  <View style={styles.statusContainer}>
                    <IconSymbol name="checkmark-circle" size={60} color="#4CAF50" />
                  </View>
                  <Text style={[styles.menuText, styles.successText]}>Entrée autorisée</Text>
                  <Text style={styles.menuText}>Ticket valide pour cet événement</Text>
                </>
              ) : (
                <>
                  <View style={styles.statusContainer}>
                    <IconSymbol name="close-circle" size={60} color="#F44336" />
                  </View>
                  <Text style={[styles.menuText, styles.errorText]}>Entrée refusée</Text>
                  <Text style={styles.menuText}>Ticket non valide pour cet événement</Text>
                </>
              )}
              <View style={styles.menuButtonContainer}>
                <Button title="Confirmer" onPress={handleContinue} color="#4CAF50" />
                <View style={{ marginTop: 10 }}>
                  <Button title="Refuser" onPress={handleDeny} color="#FF6347" />
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomMenu}>
              <Text style={styles.menuTitle}>Votre QR Code</Text>
              <View style={styles.qrCodeContainer}>
                <QRCode value={userQrData} size={200} backgroundColor="white" color="black" />
              </View>
              <Text style={styles.menuText}>{userQrData}</Text>
              <View style={styles.menuButtonContainer}>
                <Button title="Fermer" onPress={() => setQrModalVisible(false)} color="#FF6347" />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      <TouchableOpacity style={styles.randomStandButton} onPress={navigateToRandomStand}>
        <Text style={styles.randomStandButtonText}>Voir un stand au hasard</Text>
      </TouchableOpacity>
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
  statusContainer: {
    marginVertical: 15,
    alignItems: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#F44336',
    fontSize: 20,
    fontWeight: 'bold',
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
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  randomStandButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  },
  randomStandButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  qrCodeContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
