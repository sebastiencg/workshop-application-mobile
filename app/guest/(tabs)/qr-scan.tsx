import { CameraView, useCameraPermissions } from 'expo-camera'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Image,
  Animated,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useUser } from '@/contexts/UserContext'

export default function QRScanScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [amountToPay, setAmountToPay] = useState<number>(0)
  const [userTokens, setUserTokens] = useState<number>(100)
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false)
  const [currentQRIndex, setCurrentQRIndex] = useState(0)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true)
  const cameraRef = useRef(null)
  const { user } = useUser()
  const slideAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (permission === null) {
      requestPermission()
    }
  }, [permission, requestPermission])

  useEffect(() => {
    if (modalVisible || qrModalVisible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
      setIsCameraActive(false)
    } else {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
      setIsCameraActive(true)
    }
  }, [modalVisible, qrModalVisible, slideAnimation])

  const handleScanned = (barcode: { type: string; data: string }) => {
    if (barcode.data !== scannedData) {
      setScannedData(barcode.data)
      setAmountToPay(Math.floor(Math.random() * 50) + 10)
      setModalVisible(true)
    }
  }

  const resetScanner = () => {
    setScannedData(null)
    setModalVisible(false)
    setAmountToPay(0)
  }

  const handlePayment = () => {
    if (userTokens >= amountToPay) {
      setUserTokens((prevTokens) => prevTokens - amountToPay)
      Alert.alert(
        'Succès',
        `Paiement de ${amountToPay} tokens effectué ! Il vous reste ${userTokens - amountToPay} tokens.`
      )
    } else {
      Alert.alert(
        'Erreur',
        `Fonds insuffisants. Vous avez ${userTokens} tokens, mais il faut ${amountToPay} tokens.`
      )
    }
    resetScanner()
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Demande de permission en cours...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Permission caméra refusée. Activez-la dans les paramètres.</Text>
        <Button title="Demander la permission" onPress={requestPermission} />
      </View>
    )
  }

  const renderQRCodeWithLogo = (ticketId: number) => {
    const qrValue = `/tickets/validate/${ticketId}`

    return (
      <View style={styles.qrCodeWrapper}>
        <QRCode value={qrValue} size={200} backgroundColor="white" color="black" />
        <Text style={styles.ticketIdText}>ID: {ticketId}</Text>
      </View>
    )
  }

  const translateY = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  })

  const nextTicket = () => {
    if (user?.ofUser?.tickets && user.ofUser.tickets.length > 0) {
      setCurrentQRIndex((prevIndex) =>
        prevIndex === user.ofUser.tickets!.length - 1 ? 0 : prevIndex + 1
      )
    }
  }

  const prevTicket = () => {
    if (user?.ofUser?.tickets && user.ofUser.tickets.length > 0) {
      setCurrentQRIndex((prevIndex) =>
        prevIndex === 0 ? user.ofUser.tickets!.length - 1 : prevIndex - 1
      )
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanneur de QR Code</Text>
      <View style={styles.cameraContainer}>
        {isCameraActive && (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={({ type, data }) => {
              if (data && !modalVisible) {
                handleScanned({ type, data })
              }
            }}
          />
        )}
      </View>

      {modalVisible && (
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={resetScanner}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.bottomMenu, { transform: [{ translateY }] }]}>
            <Text style={styles.menuTitle}>Détails du paiement</Text>
            <Text style={styles.menuText}>Montant à payer : {amountToPay} tokens</Text>
            <Text style={styles.menuText}>Vos tokens : {userTokens} tokens</Text>
            <View style={styles.menuButtonContainer}>
              <Button title="Payer" onPress={handlePayment} />
              <View style={{ marginTop: 10 }}>
                <Button title="Annuler" onPress={resetScanner} color="#FF6347" />
              </View>
            </View>
          </Animated.View>
        </View>
      )}

      {user?.ofUser?.tickets && user.ofUser.tickets.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => {
            setQrModalVisible(true)
          }}
        >
          <IconSymbol name="qrcode" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {qrModalVisible && user?.ofUser?.tickets && user.ofUser.tickets.length > 0 && (
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={() => setQrModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.bottomMenu, { transform: [{ translateY }] }]}>
            <Text style={styles.menuTitle}>Vos QR Codes</Text>

            <View style={styles.qrCodeContainer}>
              {renderQRCodeWithLogo(user.ofUser.tickets[currentQRIndex].id)}

              <View style={styles.qrNavigation}>
                <TouchableOpacity onPress={prevTicket} style={styles.navButton}>
                  <Text style={styles.navButtonText}>Précédent</Text>
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>
                  {currentQRIndex + 1}/{user.ofUser.tickets.length}
                </Text>
                <TouchableOpacity onPress={nextTicket} style={styles.navButton}>
                  <Text style={styles.navButtonText}>Suivant</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.menuButtonContainer}>
              <Button title="Fermer" onPress={() => setQrModalVisible(false)} color="#FF6347" />
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: 'white',
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
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomMenu: {
    backgroundColor: '#FCF6DF',
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
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EB7F15',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  qrCodeContainer: {
    height: 320,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeWrapper: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketIdText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  qrNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 8,
    backgroundColor: '#EB7F15',
    borderRadius: 8,
  },
  navButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
})
