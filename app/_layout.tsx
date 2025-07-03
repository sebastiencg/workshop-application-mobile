import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { useColorScheme } from '@/hooks/useColorScheme'
import { StyleSheet } from 'react-native'
import { UserProvider } from '@/contexts/UserContext'
import { StripeProvider } from '@stripe/stripe-react-native'
import React from 'react'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  if (!loaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <UserProvider>
        <StripeProvider
          publishableKey="pk_test_51RgiJIFxFuaU1rwuJrKbzcYpQLTAkCVALZL8ODln57MCvu1x6x1bmP7S5xKp39ve6Ha4Pm79TPmOjFmk8HwNOafS00sugjYTod"
          //publishableKey="pk_test_51RgL6NFNtmC4igHH0eB1YY05qKJrnfOpYoWw01MMqt34JtoTHnFySYfcjYLI2kju8gxRjeqkoaoMcNF5Lhd73ema001VdGEYry"
          merchantIdentifier="merchant.com.miantsebastien" // requis pour Apple Pay, sinon mets juste ""
        >
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="employee" />
              <Stack.Screen name="guest" />
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="login" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </StripeProvider>
      </UserProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
