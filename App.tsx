import { StatusBar } from 'expo-status-bar';

import './global.css';
import { ScreenContent } from './components/ScreenContent';

export default function App() {
  return (
    <>
      <ScreenContent title="Home" path="App.tsx"></ScreenContent>
      <StatusBar style="auto" />
    </>
  );
}
