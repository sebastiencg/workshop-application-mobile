import React, { useState } from "react";
import { StyleSheet, View, Pressable, Text, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/contexts/UserContext";

export default function ProfileScreen() {
  const { user, setUser } = useUser();

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    router.replace("/login");
  };

  // Fonction pour vérifier si une date est passée
  const isPastDate = (date) => {
    const today = new Date();
    const [day, month] = date.split("/");
    const currentYear = today.getFullYear();
    const taskDate = new Date(currentYear, month - 1, day);
    return taskDate < today.setHours(0, 0, 0, 0);
  };

  const PlanningBadge = ({ timeSlot, location, date }) => {
    const isExpired = isPastDate(date);

    return (
      <View
        style={[
          styles.planningBadge,
          isExpired ? styles.badgeExpired : styles.badge,
        ]}
      >
        <View style={styles.badgeContent}>
          <Text style={[styles.badgeTime, isExpired && styles.expiredText]}>
            {timeSlot}
          </Text>
          <Text style={[styles.badgeLocation, isExpired && styles.expiredText]}>
            {location}
          </Text>
        </View>
      </View>
    );
  };

  const planningData = [
    { timeSlot: "14h00 - 18h00", location: "Billeterie", date: "24/06/2025" },
    {
      timeSlot: "19h00 - 23h00",
      location: "Stand Goodies",
      date: "24/06/2025",
    },
    {
      timeSlot: "19h00 - 23h00",
      location: "Stand Goodies",
      date: "25/07/2025",
    },
  ];

  const groupedByDate = planningData.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});

  const formatDateHeader = (date) => {
    const [day, month] = date.split("/");
    const dateObj = new Date(2024, month - 1, day);
    const dayName = dateObj.toLocaleDateString("fr-FR", { weekday: "long" });
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${day}/${month}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <ThemedText type="title">Profil employé</ThemedText>
        <Pressable onPress={handleLogout}>
          <IconSymbol size={28} name="logo.xbox" color={'black'} />
        </Pressable>
      </View>

      <ThemedView>
        <Pressable
          style={styles.switchRoleButton}
          onPress={() => router.push("/guest/(tabs)/profile")}
        >
          <Text style={styles.switchRoleButtonText}>
            Retourner vers l'espace visiteur{" "}
          </Text>
          <IconSymbol size={20} name="chevron.right" color="#000" />
        </Pressable>
      </ThemedView>

      <ThemedText style={styles.h2}>Ton planning</ThemedText>

      <View style={styles.planningContainer}>
        {Object.entries(groupedByDate).map(([date, tasks]) => (
          <View key={date} style={styles.daySection}>
            <Text style={styles.dayHeader}>{formatDateHeader(date)}</Text>
            <View style={styles.dayTasks}>
              {tasks.map((task, index) => (
                <PlanningBadge
                  key={index}
                  timeSlot={task.timeSlot}
                  location={task.location}
                  date={task.date}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const DARK_GREY = '#333';
const LIGHT_GREY = '#666';
const PRIMARY = '#EB7F15';
const SECONDARY = '#FCF6DF'

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
    marginTop: 48,
    height: "100%",
    backgroundColor: "white",
  },
  h2: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 32,
    color: "#333",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: PRIMARY,
    alignItems: "center",
    borderRadius: 28,
  },
  backBtnText: {
    color: "#fff",
  },
  switchRoleButton: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: SECONDARY,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  switchRoleButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  // Planning styles
  planningContainer: {
    gap: 20,
  },
  daySection: {
    gap: 12,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: PRIMARY,
    marginBottom: 4,
  },
  dayTasks: {
    gap: 8,
  },
  planningBadge: {
    borderRadius: 12,
    padding: 16,
  },
  badge: {
    borderColor: DARK_GREY,
    borderWidth: 1,
    backgroundColor: "white",
  },
  badgeExpired: {
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#f5f5f5",
  },
  badgeContent: {
    gap: 4,
  },
  badgeTime: {
    fontSize: 16,
    fontWeight: "600",
    color: DARK_GREY,
  },
  badgeLocation: {
    fontSize: 14,
    color: LIGHT_GREY,
  },
  expiredText: {
    color: LIGHT_GREY,
  },
});
