/**
 * @file App.js
 * @brief React Native application entry point.
 */

import { useEffect, useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import BottomNavigation from './bottomNavigate';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

/**
 * @brief Main application component.
 * @returns {JSX.Element} The rendered component.
 */
export default function App() {
  /**
   * @brief State to track the loading status of fonts.
   */
  const [font, setFont] = useState(false);

  /**
   * @brief State to track the overall loading status.
   */
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  /**
   * @brief Effect hook to handle resource loading.
   */
  useEffect(() => {
    /**
     * @brief Asynchronous function to load resources and data.
     */
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();
        await loadFontsAsync(); // Wait for fonts to load
        // Your other resource loading logic goes here
      } catch (e) {
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  /**
   * @brief Asynchronous function to load fonts.
   */
  const loadFontsAsync = async () => {
    await Font.loadAsync({
      'font-jost-reg': require('./assets/fonts/Jost-Regular.ttf'),
      'font-jost-bold': require('./assets/fonts/Jost-Bold.ttf'),
      'font-berlin': require('./assets/fonts/BRLNSDB.ttf'),
    });
    setFont(true);
  };

  /**
   * @brief Render method.
   */
  if (!isLoadingComplete || !font) {
    return null; // Return a loading component or null until fonts and resources are loaded
  }

  return (
    <BottomNavigation />
  );
}

const styles = StyleSheet.create({
  // Add your styles if necessary
});

