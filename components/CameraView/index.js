/**
 * @file CameraView.js - React component for capturing and processing images using the device's camera.
 * @module CameraView
 * @requires React
 * @requires react-native
 * @requires expo-camera
 * @requires @expo/vector-icons
 * @requires @tensorflow/tfjs-react-native
 * @requires expo-image-picker
 * @requires expo-image-manipulator
 * @requires ../utils/preprocess
 * @requires ../utils/renderBox
 * @requires react-native-snap-carousel
 * @requires @fortawesome/react-native-fontawesome
 * @requires @fortawesome/free-solid-svg-icons
 */

import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Image, FlatList, Text, StatusBar, ActivityIndicator, Dimensions } from "react-native";
import { Camera } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { cameraWithTensors, decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as ImageManipulator from 'expo-image-manipulator';
import { preprocess } from "../utils/preprocess";
import { getClasses } from "../utils/renderBox";
import { Pagination } from 'react-native-snap-carousel';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons/';

/**
 * A HOC that wraps the Camera component with tensor processing capabilities.
 */
const TensorCamera = cameraWithTensors(Camera);

/**
 * An array of sections providing instructions to the user.
 * Each section includes an image and a title explaining the step.
 * @constant
 * @type {Array}
 */
const sections = [
  {
    image_url: require('../../assets/images/1.jpg'),
    title: 'Наведите камеру на продукты',
  },
  {
    image_url: require('../../assets/images/2.jpg'),
    title: 'Нажмите на кнопку "Сфотографировать"',
  },
  {
    image_url: require('../../assets/images/3.jpg'),
    title: 'Отредактируйте список по мере необходимости',
  },
  {
    image_url: require('../../assets/images/4.jpg'),
    title: 'Камера может распознать: яблоко, банан, апельсин, брокколи, морковь',
  },
];

/**
 * Functional component representing the CameraView.
 * @function
 * @param {Object} props - React props
 * @param {string} props.type - Type of the camera (front or back).
 * @param {object} props.model - TensorFlow model for image processing.
 * @param {Array} props.inputTensorSize - Size of the input tensor.
 * @param {Object} props.config - Configuration for image processing.
 * @param {Object} props.navigation - React Navigation object for navigating between screens.
 * @returns {JSX.Element} CameraView component
 */
const CameraView = ({ type, model, inputTensorSize, config, navigation }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ctx, setCTX] = useState(null);
  const flatListRef = useRef(null);
  const [deletedItems, setDeletedItems] = useState([]);

  const cameraRef = useRef(null);

  /**
   * Requests camera permission.
   * @async
   * @function
   */
  const askPermission = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  /**
   * Scrolls to the specified index in the FlatList.
   * @param {number} index - Index to scroll to.
   * @function
   */
  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setActiveSlide(index);
    }
  };

  /**
   * Scrolls to the next section in the FlatList.
   * @function
   */
  const scrollToNext = () => {
    const nextIndex = activeSlide + 1;
    if (nextIndex < sections.length) {
      scrollToIndex(nextIndex);
    }
  };

  /**
   * Scrolls to the previous section in the FlatList.
   * @function
   */
  const scrollToPrevious = () => {
    const previousIndex = activeSlide - 1;
    if (previousIndex >= 0) {
      scrollToIndex(previousIndex);
    }
  };

  /**
   * Processes the captured photo and updates the component state.
   * @async
   * @param {Object} photo - Captured photo object.
   * @function
   */
  const processPhoto = async (photo) => {
    const resizedImage = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 600, height: 800 } }]
    );

    const response = await fetch(resizedImage.uri, {}, { isBinary: true });
    const rawImageData = await response.arrayBuffer();
    const imageData = new Uint8Array(rawImageData);
    const imageTensor = decodeJpeg(imageData);

    const [input, xRatio, yRatio] = preprocess(
      imageTensor,
      inputTensorSize[2],
      inputTensorSize[1]
    );

    await model.executeAsync(input).then((res) => {
      const [boxes, scores, classes] = res.slice(0, 3);
      const boxes_data = boxes.dataSync();
      const scores_data = scores.dataSync();
      const classes_data = classes.dataSync();
      let classList = getClasses(config.threshold, scores_data, classes_data);
      setData(classList);
    });

    setLoading(false);
  };

  /**
   * Captures a photo using the device's camera.
   * @async
   * @function
   */
  const takePicture = async () => {
    const photo = await cameraRef.current.takePictureAsync();
    setDeletedItems([]);
    setLoading(true);
    processPhoto(photo);
    setImageUri(photo.uri);
  };

  /**
   * Resets the component state to capture a new photo.
   * @function
   */
  const takeNewPhoto = async () => {
    setImageUri(null);
    setFlash(Camera.Constants.FlashMode.off);
    setData([]);
    setDeletedItems([]);
  }

  /**
   * Opens the device's image library for photo selection.
   * @async
   * @function
   */
  const pickImage = async () => {
    setDeletedItems([]);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setLoading(true);
      processPhoto(result.assets[0]);
      setImageUri(result.assets[0].uri)
    }
  };

  /**
   * Handles the camera button press event.
   * @function
   */
  const handleCameraButtonPress = () => {
    setShowCamera(true);
  };

  /**
   * Closes the camera view.
   * @function
   */
  const closeCamera = () => {
    setShowCamera(false);
    setImageUri(null);
  }

  /**
   * Handles the viewable items change event in the FlatList.
   * @constant
   * @type {Function}
   */
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length === 1) {
      setActiveSlide(viewableItems[0].index);
    }
  }).current;

  /**
   * Marks or unmarks an item for deletion.
   * @param {string} name - Name of the item.
   * @function
   */
  const deleteItem = (name) => {
    let index = data.indexOf(name);
    let newData = [...data];

    if (!deletedItems.includes(name)) {
      setDeletedItems(prevDeletedItems => [...prevDeletedItems, name]);
    } else {
      setDeletedItems(prevDeletedItems => prevDeletedItems.filter(item => item !== name));
    }

    setData(newData);
  }

  /**
   * Adds selected items to the ingredient list and navigates to the next screen.
   * @function
   */
  const addToIngredients = () => {
    const selectedItems = data.filter(item => !deletedItems.includes(item));
    navigation.navigate('RecipesByIngredients', { screen: 'Ingredients', params: { data: selectedItems } });
  }

  /**
   * Renders each item in the FlatList.
   * @param {Object} item - Item data.
   * @returns {JSX.Element} - Rendered item.
   * @constant
   * @type {Function}
   */
  const renderItem = ({ item }) => (
    <View style={{ width: Dimensions.get('window').width, paddingHorizontal: 20, gap: 20, }}>
      <View style={{
      }}>
        <Image source={item.image_url} style={{
          width: '100%',
          height: undefined,
          aspectRatio: 1 / 1,
        }} />
      </View>
      <View style={{ height: 150 }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ width: '70%', alignSelf: 'center', textAlign: 'center', fontSize: 24, fontFamily: 'font-jost-reg', color: '#808080' }}>{item.title}</Text>
        </View>
      </View>
    </View>
  );

  const statusBarColor = !showCamera || imageUri ? 'white' : 'black';
  const statusBarStyle = !showCamera || imageUri ? 'dark-content' : 'light-content';

  return (
    <View style={styles.container}>
      {!showCamera || imageUri ? (
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.backButton}
            onPress={() => {
              navigation.goBack(); setShowCamera(false); setImageUri(null);
            }}
          >
            <FontAwesomeIcon icon={faXmark} color={'#588460'} size={30} />
          </TouchableOpacity>
        </View>
      ) : null}
      <StatusBar backgroundColor={statusBarColor} barStyle={statusBarStyle} />
      {showCamera ? (
        <>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                color={'#588460'}
                size={40}
              />
              <Text style={styles.loadingText}>Анализирую...</Text>
            </View>
          ) : (
            <>
              {imageUri ? (
                <View style={{ backgroundColor: 'white', gap: 0, flex: 1, justifyContent: 'space-between', paddingBottom: 40, position: 'relative', alignItems: 'center' }}>
                  <View style={{
                    borderRadius: 0,
                    overflow: 'hidden',
                    borderRadius: 30,
                    marginTop: 20,
                    elevation: 10,
                    width: '90%',
                  }}>
                    <Image source={{ uri: imageUri }} style={[styles.image, {}]} />
                  </View>
                  <View style={[styles.detectedObjects]}>
                    <View style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      flex: 1,
                    }}>
                      {
                        data.length !== 0 ? (
                          <View style={{
                            alignItems: 'center',
                            gap: 20,
                            flex: 1,
                          }}>
                            <FlatList
                              persistentScrollbar
                              showsHorizontalScrollIndicator={true}
                              horizontal
                              style={{
                                height: 70,
                              }}
                              contentContainerStyle={{ alignItems: 'center', gap: 20, paddingHorizontal: 10, alignSelf: 'flex-end', paddingBottom: 30, }}
                              data={data}
                              renderItem={({ item }) => (
                                <TouchableOpacity
                                  onPress={() => {
                                    deleteItem(item);
                                  }}
                                  activeOpacity={0.5}
                                  style={{
                                    backgroundColor: deletedItems.includes(item) ? '#cccccc' : '#9EC2A4',
                                    padding: 10,
                                    borderRadius: 50,
                                    flexDirection: 'row',
                                    gap: 10,
                                  }}>
                                  <Text style={{ fontSize: 15, textTransform: 'capitalize', color: 'white' }}>{item}</Text>
                                  <View style={{
                                    backgroundColor: deletedItems.includes(item) ? "#9EC2A4" : "#CD5C5C",
                                    borderRadius: 50,
                                  }}>
                                    <MaterialIcons
                                      name={deletedItems.includes(item) ? "add" : "remove"}
                                      color={'white'}
                                      size={25}
                                    />
                                  </View>
                                </TouchableOpacity>
                              )}
                            />

                            <TouchableOpacity
                              onPress={addToIngredients}
                              activeOpacity={0.8}
                              style={[styles.button, { paddingHorizontal: 20 }]}
                            >
                              <Text style={styles.buttonText}>Добавить в ингредиенты</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={takeNewPhoto}
                              activeOpacity={0.8}
                              style={[styles.button, { backgroundColor: '#cccccc', paddingHorizontal: 20 }]}
                            >
                              <Text style={[styles.buttonText]}>Сделать новое фото</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={{
                            alignItems: 'center',
                            gap: 20,
                          }}>
                            <View>
                              <Text style={{
                                color: '#588460',
                                fontFamily: 'font-jost-reg',
                                fontSize: 18,
                              }}>Ингредиентов не обнаружено</Text>
                            </View>
                            <TouchableOpacity
                              onPress={takeNewPhoto}
                              activeOpacity={0.8}
                              style={[styles.button, { borderColor: '#808080' }]}
                            >
                              <Text style={[styles.buttonText, { color: 'white' }]}>Сделать новое фото</Text>
                            </TouchableOpacity>
                          </View>
                        )
                      }
                    </View>
                  </View>
                </View>
              ) : (
                <View style={{ backgroundColor: 'black', flex: 1 }}>
                  <View style={styles.cameraContainer}>
                    <Camera
                      style={styles.camera}
                      type={type}
                      ref={cameraRef}
                      flashMode={flash}
                    />
                  </View>
                  <View style={{ height: 220, position: 'absolute', bottom: 0, }}>
                    <View style={[styles.buttonsContainer, { flex: 1, alignItems: 'flex-end', justifyContent: 'center', gap: 70, }]}>
                      {!imageUri && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            setFlash(
                              flash === Camera.Constants.FlashMode.off
                                ? Camera.Constants.FlashMode.torch
                                : Camera.Constants.FlashMode.off
                            );
                          }}
                          style={styles.icons}
                        >
                          <MaterialIcons
                            name={flash ? "flash-off" : "flash-on"}
                            size={30}
                            color="white"
                          />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={takePicture}
                        activeOpacity={0.8}
                        style={[styles.icons, { backgroundColor: 'white', width: 90, height: 90, position: 'absolute', bottom: '100%', }]}
                      >
                        <MaterialIcons name="photo-camera" size={40} color="#1c1c1c" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={pickImage}
                        activeOpacity={0.8}
                        style={styles.icons}
                      >
                        <MaterialIcons name="photo-library" size={30} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={closeCamera}
                        activeOpacity={0.8}
                        style={styles.icons}
                      >
                        <MaterialIcons name="close" size={30} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </>
      ) : !showCamera ? (
        <View style={{ flex: 1, gap: 30 }}>
          <View style={{ alignSelf: 'center', flexDirection: 'row', position: 'absolute', top: 500, width: '85%', justifyContent: 'space-between', zIndex: 10, }}>
            <TouchableOpacity activeOpacity={0.8} onPress={scrollToPrevious} style={{
              left: -15,
            }}>
              <View style={{
                display: (activeSlide > 0) ? 'flex' : 'none',
                backgroundColor: '#9EC2A4',
                borderRadius: 50,
              }}>
                <MaterialIcons name={"keyboard-arrow-left"} color={'white'} size={50} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={scrollToNext} style={{
              right: -15,
            }}>
              <View style={{
                display: (activeSlide < sections.length - 1) ? 'flex' : 'none',
                backgroundColor: '#9EC2A4',
                borderRadius: 50,
              }}>
                <MaterialIcons name={"keyboard-arrow-right"} color={'white'} size={50} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            gap: 30,
          }}>
            <View style={{ width: '100%' }}>
              <FlatList
                ref={flatListRef}
                data={sections}
                renderItem={renderItem}
                pagingEnabled
                horizontal
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
              />
              <Pagination
                dotsLength={sections.length}
                activeDotIndex={activeSlide}
                dotStyle={{
                  width: 15,
                  height: 15,
                  borderRadius: 50,
                  marginHorizontal: 0,
                  backgroundColor: '#588460',
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={1}
              />
            </View>
            <View style={{
              alignItems: 'center',
            }}>
              <TouchableOpacity
                onPress={handleCameraButtonPress}
                activeOpacity={0.8}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Открыть камеру</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        hasPermission === false && <Text>Нет доступа к камере</Text>
      )
      }
    </View >
  );
};

const styles = StyleSheet.create({
  backButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 30,
  },
  backButton: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    width: '80%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 10,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'font-jost-reg',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'font-jost-bold',
  },
  buttonsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
    paddingHorizontal: 50,
    paddingBottom: 50,
  },
  button: {
    backgroundColor: '#588460',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 40,
    gap: 10,
  },
  icons: {
    borderColor: 'white',
    borderWidth: 2,
    width: 60,
    height: 60,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    flex: 1,
    aspectRatio: 2 / 3,
    justifyContent: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 3 / 4,
    zIndex: 0,
  },
  ingredientList: {
    color: '#588460',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'font-jost-bold',
  },
  detectedObjects: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
  },
  glView: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
  },

});

export default CameraView;
