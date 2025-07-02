import { StatusBar } from 'expo-status-bar'
import { StripeProvider } from '@stripe/stripe-react-native'

import './global.css'
import { ScreenContent } from './components/ScreenContent'
import React from 'react'

export default function App() {
  return (
    <>
      <ScreenContent title="Home" path="App.tsx"></ScreenContent>
      <StatusBar style="auto" />
    </>
  )
}
