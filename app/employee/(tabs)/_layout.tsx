import { Redirect, Tabs } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Platform, View } from 'react-native'

import { HapticTab } from '@/components/HapticTab'
import { IconSymbol } from '@/components/ui/IconSymbol'
import TabBarBackground from '@/components/ui/TabBarBackground'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useUser } from '@/contexts/UserContext'
import { useSessionGuard } from '@/hooks/useSessionGuard'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const { user } = useUser()
  const { loading } = useSessionGuard()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  if (!user) {
    return <Redirect href="/login" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#EB7F15',
        tabBarInactiveTintColor: '#FCF6DF',
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Stands',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="banknote" color={color} />,
        }}
      />
      <Tabs.Screen
        name="qr-scan"
        options={{
          title: 'Billeterie',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="ticket.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="face.dashed" color={color} />,
        }}
      />
    </Tabs>
  )
}
