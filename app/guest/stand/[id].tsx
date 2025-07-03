import React from "react";
import { StyleSheet, Image, View, Pressable } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";

const menu = [
  {
    id: "1",
    name: "Burger maison",
    description: "Pain brioché, steak 150 g, cheddar",
    price: "9 €",
    image: "https://www.gardengourmet.be/sites/default/files/recipes/aeead5804e79ff6fb98b2039619c5230_200828_MEDIAMONKS_GG_Spicytarian.jpg",
  },
  {
    id: "2",
    name: "Frites fraîches",
    description: "Pommes de terre locale, double cuisson",
    price: "4 €",
    image: "https://www.lespommesdeterre.com/wp-content/uploads/2017/10/frites-maison-c-shutterstock_bd.jpg",
  },
  {
    id: "3",
    name: "Frites fraîches",
    description: "Pommes de terre locale, double cuisson",
    price: "4 €",
    image: "https://www.lespommesdeterre.com/wp-content/uploads/2017/10/frites-maison-c-shutterstock_bd.jpg",
  },
  {
    id: "4",
    name: "Frites fraîches",
    description: "Pommes de terre locale, double cuisson",
    price: "4 €",
    image: "https://www.lespommesdeterre.com/wp-content/uploads/2017/10/frites-maison-c-shutterstock_bd.jpg",
  },
];

export default function ProfileScreen() {
  const renderMenuItem = (item) => (
    <View key={item.id} style={styles.menuItem}>
      <Image source={{ uri: item.image }} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <ThemedText style={styles.menuName}>{item.name}</ThemedText>
        <ThemedText style={styles.menuDescription}>{item.description}</ThemedText>
        <ThemedText style={styles.menuPrice}>{item.price}</ThemedText>
      </View>
    </View>
  );

  return (
    <ParallaxScrollView
      headerImage={
        <Image
          source={{
            uri: "https://lvdneng.rosselcdn.net/sites/default/files/dpistyles_v2/vdn_864w/2024/06/27/node_1477123/59504073/public/2024/06/27/20361477.jpeg?itok=1YnvP-GK1719476644",
          }}
          resizeMode="cover"
          style={styles.headerImage}
        />
      }
      headerBackgroundColor={{ dark: "", light: "" }}
    >
      <Pressable onPress={() => router.push("/")} style={styles.flexRow}>
        <IconSymbol name="chevron.left" color="#000" />
        <ThemedText style={styles.backToHome}>retour à la carte</ThemedText>
      </Pressable>

      <ThemedView>
        <ThemedText type="title" style={styles.title}>
          Mampf
        </ThemedText>
      </ThemedView>

      <ThemedText style={styles.description}>
        Grillades qui crépitent, effluves de cheddar fondant. On sert des burgers généreux – pain brioché doré, steak à point ou galette veggie – accompagnés de frites croustillantes coupées maison et d'un bar à sauces gourmandes.
      </ThemedText>

      <View style={styles.menuList}>
        {menu.map(renderMenuItem)}
      </View>
    </ParallaxScrollView>
  );
}

const PRIMARY = "#EB7F15";

const styles = StyleSheet.create({
  headerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  h2: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 32,
    color: "#333",
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backToHome: {
    color: "#000",
  },
  title: {
    paddingVertical: 16,
    textAlign: "center",
  },
  description: {
    color: "#000",
    marginBottom: 24,
  },
  menuList: {
    gap: 16,
    paddingBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  menuImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontWeight: "bold",
    color: PRIMARY,
  },
  menuDescription: {
    fontSize: 14,
    color: "#000",
    marginVertical: 4,
  },
  menuPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
});