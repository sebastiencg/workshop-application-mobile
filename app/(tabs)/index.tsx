import React, { useRef, useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    Pressable,
    TouchableOpacity,
} from 'react-native';
import MapView, { Marker, LatLng } from 'react-native-maps';

type Stand = {
    id: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    image?: string;
};

const stands: Stand[] = [
    {
        id: 1,
        name: 'Bar à bières',
        description: 'Jeune bar à bière aberrant de coiffeur amateur',
        latitude: 45.721400,
        longitude: 4.815700,
        image: 'https://img.icons8.com/?size=150&id=gvSTbbYdFYYL',
    },
    {
        id: 2,
        name: 'Stand à la saucisse',
        description: 'Petit stand entre amis, avec de belles merguez',
        latitude: 45.720500,
        longitude: 4.814834,
        image: 'https://img.icons8.com/?size=150&id=lrb9oiq7i0p9'
    },
    {
        id: 3,
        name: 'Goodies et smarties',
        description: 'Stand de ventes de goodies du festival et de smarties®',
        latitude: 45.720700,
        longitude: 4.814834,
        image: 'https://img.icons8.com/?size=150&id=kLORTzuNOM2d'
    },
];

type Concert = {
    id: number;
    title: string;
    horaire: string;
    latitude: number;
    longitude: number;
    image?: string;
};

const concerts: Concert[] = [
    {
        id: 1,
        title: 'Concert Rock',
        horaire: '21h00 - 22h30',
        latitude: 45.720500,
        longitude: 4.815700,
        image: 'https://img.icons8.com/?size=150&id=12035',
    },
    {
        id: 2,
        title: 'DJ Set Electro',
        horaire: '23h00 - 00h30',
        latitude: 45.721500,
        longitude: 4.814900,
        image: 'https://img.icons8.com/?size=150&id=HfymTjyRCG1f',
    },
];

export default function HomeScreen() {
    const mapRef = useRef<MapView>(null);
    const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [showRecenter, setShowRecenter] = useState(false);
    const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
    const [concertModalVisible, setConcertModalVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            fitAllMarkers();
        }, 500);
    }, []);

    const fitAllMarkers = () => {
        if (!mapRef.current) return;
        mapRef.current.fitToCoordinates(
            stands.map((s) => ({ latitude: s.latitude, longitude: s.longitude })),
            {
                edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                animated: true,
            }
        );
        setShowRecenter(false);
    };

    const handleMarkerPress = (stand: Stand) => {
        setSelectedStand(stand);
        setModalVisible(true);
    };

    const getDistanceKm = (a: LatLng, b: LatLng): number => {
        const toRad = (v: number) => (v * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(b.latitude - a.latitude);
        const dLng = toRad(b.longitude - a.longitude);
        const lat1 = toRad(a.latitude);
        const lat2 = toRad(b.latitude);
        const aVal =
            Math.sin(dLat / 2) ** 2 +
            Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
        return R * c;
    };

    const handleRegionChangeComplete = (region: any) => {
        const center = {
            latitude: region.latitude,
            longitude: region.longitude,
        };
        const reference = {
            latitude:
                stands.reduce((acc, s) => acc + s.latitude, 0) / stands.length,
            longitude:
                stands.reduce((acc, s) => acc + s.longitude, 0) / stands.length,
        };
        const dist = getDistanceKm(center, reference);
        setShowRecenter(dist > 0.5);
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                onRegionChangeComplete={handleRegionChangeComplete}
                zoomEnabled
                scrollEnabled
                rotateEnabled={false}
                pitchEnabled={false}
            >
                {stands.map((stand) => (
                    <Marker
                        key={stand.id}
                        coordinate={{
                            latitude: stand.latitude,
                            longitude: stand.longitude,
                        }}
                        onPress={() => handleMarkerPress(stand)}
                        image={stand.image ? { uri: stand.image } : undefined}
                    />
                ))}
                {concerts.map((concert) => (
                <Marker
                    key={`concert-${concert.id}`}
                    coordinate={{
                        latitude: concert.latitude,
                        longitude: concert.longitude,
                    }}
                    onPress={() => {
                        setSelectedConcert(concert);
                        setConcertModalVisible(true);
                    }}
                    image={concert.image ? { uri: concert.image } : undefined}
                />
                ))}
            </MapView>

            {showRecenter && (
                <TouchableOpacity
                    style={styles.recenterButton}
                    onPress={fitAllMarkers}
                >
                    <Text style={styles.recenterText}>Recentrer</Text>
                </TouchableOpacity>
            )}

            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalName}>{selectedStand?.name}</Text>
                        <Text>{selectedStand?.description}</Text>
                        <Pressable
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeText}>Fermer</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent
                visible={concertModalVisible}
                onRequestClose={() => setConcertModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalName}>{selectedConcert?.title}</Text>
                        <Text>{selectedConcert?.horaire}</Text>
                        <Pressable
                            style={styles.closeButton}
                            onPress={() => setConcertModalVisible(false)}
                        >
                            <Text style={styles.closeText}>Fermer</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    recenterButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#1e90ff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        elevation: 4,
    },
    recenterText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    modalName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 20,
        alignSelf: 'flex-end',
        padding: 10,
        backgroundColor: '#1e90ff',
        borderRadius: 8,
    },
    closeText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
