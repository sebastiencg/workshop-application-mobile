import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the guest tab screen
  return <Redirect href="/guest/(tabs)" />;
}
