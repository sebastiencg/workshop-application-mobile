import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // Redirect to the guest tab screen
  return <Redirect href="/guest/(tabs)" />;
}
