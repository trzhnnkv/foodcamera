import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Camera } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { modelURI } from "./modelHandler";
import CameraView from "./CameraView";
import AppLoading from 'expo-app-loading';

const App = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const type = "back";
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [inputTensor, setInputTensor] = useState([]);
  const [error, setError] = useState(null);

  // model configuration
  const configurations = { threshold: 0.25 };

  const loadModel = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      await tf.ready();

      const yolov5 = await tf.loadGraphModel(modelURI, {
        onProgress: (fractions) => {
          setLoading({ loading: true, progress: fractions });
        },
      });

      const dummyInput = tf.ones(yolov5.inputs[0].shape);
      await yolov5.executeAsync(dummyInput);
      tf.dispose(dummyInput);

      setInputTensor(yolov5.inputs[0].shape);
      setModel(yolov5);
      setLoading({ loading: false, progress: 1 });
    } catch (error) {
      setError(error);
      setLoading({ loading: false, progress: 0 });
    }
  };

  useEffect(() => {
    loadModel();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading({ loading: true, progress: 0 });
    loadModel();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      {error ? (
        <View style={{ backgroundColor: 'white', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <Text style={{
            fontFamily: 'font-jost-reg',
            fontSize: 20,
          }}>Произошла ошибка</Text>
          <TouchableOpacity
            onPress={handleRetry}
            style={{
              backgroundColor: '#588460',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 5,
            }}
          >
            <Text style={{
              color: 'white'
            }}>Повторить попытку</Text>
          </TouchableOpacity>
        </View>
      ) : loading.loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', gap: 10, }}>
          <StatusBar barStyle='dark-content' backgroundColor='white' />
          <ActivityIndicator
            color={'#588460'}
            size={40}
          />
          <Text style={{
            fontFamily: 'font-jost-reg',
            fontSize: 18,
          }}>Настройка камеры</Text>
        </View>
      ) : (
        <CameraView
          type={type}
          model={model}
          inputTensorSize={inputTensor}
          config={configurations}
          navigation={navigation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  permissionDeniedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionDeniedText: {
    fontSize: 18,
  },
});

export default App;
