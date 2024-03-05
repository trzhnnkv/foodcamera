/**
 * @file Ingredients.js
 * @brief Component for handling and displaying ingredients in the recipe application.
 */

import React, { useState, useEffect, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Button,
  StatusBar,
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  LogBox,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

LogBox.ignoreAllLogs();

/**
 * @brief Main component for handling ingredients.
 * @param {Object} navigation - The navigation object.
 * @param {Object} route - The route object.
 * @returns {JSX.Element} The rendered component.
 */
export default function Ingredients({ navigation, route }) {
  const [data, setData] = useState([]);
  const [inputText, setInputText] = useState('');
  const [onChange, setOnChange] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /**
   * @brief Fetches ingredient data from the API.
   */
  const getAPIdata = async () => {
    try {
      setLoading(true);
      setErrorLoading(false);
      const response = await fetch(`http://213.132.76.244:7000/ingredients?limit=42`);
      const jsonData = await response.json();
      setData(jsonData);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setErrorLoading(true);
    }
  }

  /**
   * @brief Handles the press event on an ingredient.
   * If the ingredient is not already selected, adds it to the selected items.
   * If the maximum limit of 10 selected items is reached, displays a modal.
   * If the ingredient is already selected, removes it from the selected items.
   * @param {Object} item - The selected ingredient.
   */
  const handlePress = (item) => {
    if (selectedItems.length >= 10) {
      setModalVisible(true);
      return;
    }

    if (selectedItems.some(selectedItem => selectedItem.title === item.title)) {
      deleteItem(item);
    } else {
      setSelectedItems(prevSelectedItems => [item, ...prevSelectedItems]);
    }
  };

  /**
   * @brief Closes the modal.
   */
  const closeModal = () => {
    setModalVisible(false);
  };

  /**
   * @brief Resets the search by clearing inputText and fetching all ingredients.
   */
  const resetSearch = () => {
    setInputText('');
    getAPIdata();
  };

  /**
   * @brief Handles the search button press.
   * Fetches ingredients based on the provided inputText.
   */
  const handleSearchPress = async () => {
    setLoading(true);
    setOnChange(false);
    console.log(typeof (inputText));
    if (inputText !== "") {
      try {

        let url = `http://213.132.76.244:7000/searchIngredient?ingredient=${inputText}`;
        let result = await fetch(encodeURI(url));
        jsonData = await result.json();
        setData(jsonData);
      } catch (err) {
        console.error(err.message);
        setErrorLoading(true);
      }
    } else {
      getAPIdata();
    }
    setLoading(false);
  };

  /**
   * @brief Removes an item from the selected items.
   * @param {Object} item - The item to be removed.
   */
  const deleteItem = (item) => {
    let index = selectedItems.indexOf(item);
    let newSelectedItems = [...selectedItems];
    newSelectedItems.splice(index, 1);
    setSelectedItems(newSelectedItems);
  }

  /**
   * @brief Effect hook to fetch data when the component mounts.
   */
  useEffect(() => {
    const fetchData = async () => {
      await getAPIdata();
    };
    fetchData();
  }, []);

  /**
   * @brief Effect hook to update selected items when the route parameters change.
   */
  useEffect(() => {
    const updateSelectedItems = async () => {
      setLoading(true);
      if (route && route.params && route.params.data !== undefined) {
        let amount = selectedItems.length + route.params.data.length;
        if (amount > 10) {
          setModalVisible(true);
          setLoading(false);
          return;
        } else {
          for (const title of route.params.data) {
            const response = await fetch(encodeURI(`http://213.132.76.244:7000/searchIngredient?ingredient=${title}`));
            const ingredientData = await response.json();
            const ingredient = ingredientData[0];
            if (!selectedItems.some(selectedItem => selectedItem.id === ingredient.id)) {
              setSelectedItems(prevSelectedItems => [ingredient, ...prevSelectedItems]);
            }
          }
        }
      }
      setLoading(false);
    };

    updateSelectedItems();
  }, [route.params]);

    if (errorLoading) {
        return (
            <View style={{ backgroundColor: 'white', flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <Text style={{
                    fontFamily: 'font-jost-reg',
                    fontSize: 20,
                }}>Произошла ошибка</Text>
                <TouchableOpacity
                    onPress={getAPIdata}
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
            </View>)
    } else {
        return (
            <>
                <StatusBar />
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={{ position: 'relative', flex: 1 }}>
                        <View style={{
                            paddingHorizontal: 30,
                            paddingTop: 15,
                            paddingBottom: 15,
                            position: 'absolute',
                            zIndex: 20,
                            width: '100%',
                            alignSelf: 'center',
                        }}>
                            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', position: 'relative' }}>
                                <TextInput
                                    placeholder="Введите название ингредиента"
                                    placeholderTextColor="#727272"
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        paddingLeft: 20,
                                        borderColor: '#F0F0F0',
                                        backgroundColor: 'white',
                                        fontSize: 14,
                                        borderRadius: 50,
                                        color: 'black',
                                        fontFamily: 'font-jost-reg',
                                        elevation: 5,
                                    }}
                                    value={inputText}
                                    maxLength={20}
                                    onChangeText={(text) => {
                                        setInputText(text);
                                        setOnChange(true);
                                        setSubmitted(false);
                                    }}
                                    onSubmitEditing={() => {
                                        handleSearchPress();
                                        setSubmitted(true);
                                    }}
                                />
                                {submitted ? (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            resetSearch();
                                            setSubmitted(false);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            right: 15,
                                            backgroundColor: '#588460',
                                            borderRadius: 50,
                                            width: 35,
                                            height: 35,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                        <MaterialIcons name={"close"} color={'white'} size={20} />
                                    </TouchableOpacity>
                                ) : null
                                }
                            </View>
                        </View>
                        {selectedItems.length !== 0 && !loading ? (
                            <View style={{
                                paddingVertical: 15,
                                paddingHorizontal: 20,
                                alignItems: 'center',
                                gap: 10,
                                position: 'absolute',
                                zIndex: 10,
                                width: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: 50,
                                paddingTop: 80,
                            }}>
                                <View style={{
                                    width: '100%',
                                    alignItems: 'center',
                                }}>
                                    <FlatList
                                        persistentScrollbar
                                        showsHorizontalScrollIndicator={true}
                                        contentContainerStyle={{ justifyContent: 'space-between', gap: 20, paddingBottom: 10, }}
                                        data={selectedItems}
                                        horizontal
                                        renderItem={({ item, index }) => (
                                            <>
                                                <View style={{
                                                    alignItems: 'center',
                                                    position: 'relative',
                                                    padding: 0,
                                                    width: 100,
                                                }}>
                                                    <View style={{
                                                        borderRadius: 100,
                                                        borderColor: '#588460',
                                                        borderWidth: 4,
                                                        padding: 5,
                                                    }}>
                                                        <View>
                                                            <View style={{
                                                                borderRadius: 100,
                                                                overflow: 'hidden',
                                                            }}>
                                                                <Image source={{ uri: item.image_url }} style={{
                                                                    width: 70,
                                                                    height: 70,
                                                                    aspectRatio: 1 / 1,
                                                                    resizeMode: 'contain',
                                                                    backgroundColor: 'white',
                                                                }} />
                                                            </View>
                                                            <TouchableOpacity
                                                                activeOpacity={0.5}
                                                                onPress={() => {
                                                                    deleteItem(item);
                                                                }}
                                                                style={{
                                                                    borderColor: 'white',
                                                                    borderWidth: 2,
                                                                    borderRadius: 50,
                                                                    position: 'absolute',
                                                                    top: -10,
                                                                    right: -10,
                                                                    backgroundColor: '#CD5C5C',
                                                                }}>
                                                                <MaterialIcons name="remove" color={'white'} size={25} />
                                                            </TouchableOpacity>
                                                        </View>

                                                    </View>
                                                    <Text style={{
                                                        color: 'black',
                                                        fontFamily: 'font-jost-reg',
                                                        textAlign: 'center',
                                                    }}>{item.title}</Text>

                                                </View>

                                            </>
                                        )} />

                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => navigation.navigate('RecipesByIngredientsPage', selectedItems.map(item => item.title))}
                                    style={{
                                        backgroundColor: '#588460',
                                        borderRadius: 50,
                                        paddingHorizontal: 15,
                                        paddingVertical: 10,

                                    }}>
                                    <Text style={{
                                        color: 'white',
                                        fontFamily: 'font-jost-reg',
                                        fontSize: 16,

                                    }}>Сформировать рецепты</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                        }
                        {
                            loading ? (
                                <View style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flex: 1,
                                }}>
                                    <ActivityIndicator size="large" color="#588460" />
                                </View>
                            ) : (
                                inputText != "" && data.length === 0 ? (
                                    <View style={{
                                        width: '80%',
                                        height: '100%',
                                        paddingBottom: 90,
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Text style={{
                                            color: '#588460',
                                            fontFamily: 'font-jost-reg',
                                            fontSize: 18,
                                            textAlign: 'center',
                                        }}>
                                            Упс... По данному запросу ничего не найдено
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={{
                                        flex: 1,
                                    }}>
                                        <FlatList
                                            contentContainerStyle={{
                                                paddingBottom: 120,
                                                paddingHorizontal: 20,
                                                paddingTop: selectedItems.length == 0 ? 80 : 300,
                                                gap: 0,
                                            }}
                                            columnWrapperStyle={{ justifyContent: "space-evenly", gap: 0, marginTop: 10, }}
                                            showsVerticalScrollIndicator={false}
                                            data={data}
                                            numColumns={3}
                                            renderItem={({ item, index }) => (
                                                <>
                                                    {!selectedItems.some(selectedItem => selectedItem.title === item.title) && (
                                                        <TouchableOpacity
                                                            style={{
                                                                height: 150,
                                                                width: '30%',
                                                                alignItems: 'center',
                                                            }}
                                                            activeOpacity={0.8}
                                                            onPress={() => {
                                                                handlePress(item);
                                                            }}>
                                                            <View style={{
                                                                width: '100%',
                                                                alignItems: 'center',
                                                                paddingTop: 10,
                                                                zIndex: 10,
                                                            }}>
                                                                <View style={{
                                                                    backgroundColor: '#9EC2A4',
                                                                    width: '100%',
                                                                    height: 60,
                                                                    position: 'absolute',
                                                                    borderRadius: 10,

                                                                }}>
                                                                </View>
                                                                <View style={{
                                                                    width: '70%',
                                                                    borderRadius: 100,
                                                                    overflow: 'hidden',
                                                                    borderColor: 'white',
                                                                    borderWidth: 4,
                                                                    backgroundColor: 'white',
                                                                }}>
                                                                    <Image source={{ uri: item.image_url }} style={styles.image} />
                                                                </View>
                                                            </View>

                                                            <View style={{
                                                                width: '100%',
                                                                flex: 1,
                                                                backgroundColor: '#F0F0F0',
                                                                borderRadius: 10,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                bottom: 20,
                                                                zIndex: 0,
                                                                paddingTop: 15,
                                                            }}>
                                                                <Text style={{
                                                                    color: '#1c1c1c',
                                                                    fontFamily: 'font-jost-bold',
                                                                    borderRadius: 20,
                                                                    fontSize: 11,
                                                                    textAlign: 'center',
                                                                    padding: 5,
                                                                }}
                                                                >
                                                                    {item.title}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    )}
                                                </>
                                            )} />
                                    </View>
                                )
                            )
                        }
                    </View>
                </View >
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={closeModal}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                    }}>
                        <View style={{
                            backgroundColor: '#F0F0F0',
                            width: '90%',
                            borderRadius: 20,
                            borderColor: '#CD5C5C',
                            borderWidth: 5,
                        }}>
                            <Text style={{
                                fontSize: 18,
                                textAlign: 'center',
                                backgroundColor: '#F9F9F9',
                                padding: 10,
                                color: '#727272',
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                fontFamily: 'font-jost-bold',
                            }}>
                                Упс
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                textAlign: 'left',
                                paddingLeft: 10,
                                paddingTop: 10,
                                color: '#797979',
                                fontFamily: 'font-jost-reg',
                                lineHeight: 20,
                            }}>
                                Вы не можете добавить более 10 ингредиентов.
                            </Text>
                            <TouchableOpacity style={{
                                alignItems: 'flex-end',
                            }}
                                activeOpacity={0.8}
                                onPress={() => {
                                    closeModal();
                                }}>
                                <View style={{
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,

                                }}>
                                    <Text style={{
                                        fontSize: 18,
                                        color: '#9EC2A4',
                                        fontFamily: 'font-jost-bold',
                                    }}>Хорошо</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal >
            </>
        )
    };
};


const styles = StyleSheet.create({
    image: {
        backgroundColor: 'white',
        width: '100%',
        height: undefined,
        aspectRatio: 1 / 1,
        resizeMode: 'contain',
    }
});