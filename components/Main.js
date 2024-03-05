/**
 * @file Main.js
 * @brief Main screen component for the recipe application.
 */

import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  LogBox,
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';

LogBox.ignoreAllLogs();

/**
 * @brief Main component for the application.
 * @param {Object} navigation - The navigation object.
 * @returns {JSX.Element} The rendered component.
 */
export default function Main({ navigation }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [inputText, setInputText] = useState('');
  const [onChange, setOnChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [endOfData, setEndOfData] = useState(false);

  /**
   * @brief Handles the search button press.
   * Fetches recipes based on the provided inputText.
   */
  const handleSearchPress = async () => {
    setLoading(true);
    setPage(1);
    setOnChange(false);
    if (inputText !== "") {
      try {
        setData([]);
        let url = `http://213.132.76.244:7000/searchRecipes?recipe=${inputText}`;
        let result = await fetch(url);
        let jsonData = await result.json();
        setData(jsonData);
        setEndOfData(true);
        setLoading(false);
      } catch (err) {
        console.error(err.message);
        setErrorLoading(true);
        setLoading(false);
      }
    } else {
      return;
    }
    setLoading(false);
  };

  /**
   * @brief Fetches recipes from the API.
   * Triggered when the user scrolls to the end of the list.
   */
  const getAPIdata = async () => {
    try {
      setLoading(true);
      setErrorLoading(false);
      const response = await fetch(`http://213.132.76.244:7000/recipes?offset=${(page - 1) * 8}&limit=8`);
      const jsonData = await response.json();
      if (jsonData.length === 0) {
        setEndOfData(true);
        setLoading(false);
      } else {
        setData(prevData => [...prevData, ...jsonData]);
        setPage(prevPage => prevPage + 1);
        setLoading(false);
      }
    } catch (err) {
      console.error(err.message);
      setErrorLoading(true);
      setLoading(false);
    }
  };

  /**
   * @brief Resets the search by clearing inputText and fetching all recipes.
   */
  const resetSearch = () => {
    setEndOfData(false);
    setInputText('');
    setData([]);
    getAPIdata();
  };

  /**
   * @brief Handles the scroll event.
   * Triggers fetching more data when the user reaches the end of the list.
   * @param {Object} event - The scroll event.
   */
  const handleScroll = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;

    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      handleEndReached();
    }
  };

  /**
   * @brief Handles the end of the list being reached.
   * Fetches more data if not currently loading and not in search mode.
   */
  const handleEndReached = () => {
    if (!loading) {
      if (inputText === '') {
        getAPIdata();
      } else {
        return;
      }
    }
  };

    return (
        <View style={{
            backgroundColor: 'white',
            flex: 1,
        }}>
            <StatusBar barStyle='dark-content' backgroundColor='white' />
            {errorLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
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
                </View>
            ) : (
                <View style={{ backgroundColor: 'white', flex: 1, }}>
                    <View style={{
                        paddingHorizontal: 30,
                        paddingTop: 15,
                        paddingBottom: 15,
                        position: 'absolute',
                        zIndex: 10,
                        width: '100%',
                        alignSelf: 'center',
                    }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', position: 'relative' }}>
                            <TextInput
                                placeholder="Введите название рецепта"
                                placeholderTextColor="#727272"
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    paddingLeft: 20,
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
                                    setSubmitted(false);
                                }}
                                onSubmitEditing={() => {
                                    handleSearchPress();
                                    setSubmitted(true);
                                }}
                            />
                            {submitted && inputText !== '' ? (
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
                    {
                        data.length === 0 && loading ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80, backgroundColor: 'white' }}>
                                <ActivityIndicator
                                    color={'#588460'}
                                    size={40}
                                />
                            </View>
                        ) : (
                            data.length === 0 ? (
                                <View style={{
                                    width: '80%',
                                    height: '100%',
                                    paddingBottom: 80,
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
                                <ScrollView
                                    contentContainerStyle={{
                                        position: 'relative',
                                        paddingBottom: 120,
                                        paddingTop: 80,
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        justifyContent: 'space-evenly',
                                    }}
                                    showsVerticalScrollIndicator={false}
                                    onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
                                >
                                    {
                                        data.length == 0 ? (
                                            <View style={{
                                                width: '80%',
                                                alignItems: 'center',
                                                alignSelf: 'center',
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
                                            data.map((item, index) => (
                                                <View key={index} style={[
                                                    styles.block,
                                                    index !== 1 && index % 2 !== 0 ? { marginTop: -20 } : null,
                                                    endOfData && index === data.length - 2 ? { marginTop: -20 } : null,
                                                    index === 1 ? { height: 200 } : { height: 210 },]}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.element,
                                                            { flex: 1, }
                                                        ]}
                                                        activeOpacity={0.8}
                                                        onPress={() => navigation.navigate('Recipe', { id: item.id, title: item.title })}
                                                    >
                                                        <View style={[styles.imageContainer, { backgroundColor: '#9EC2A4', borderRadius: 20, overflow: 'hidden', }]}>
                                                            <Image source={{ uri: item.image_url }} style={styles.image} />
                                                            <Text style={styles.time}>
                                                                {item.preparation_time ? (
                                                                    <Text style={styles.bold}>{item.preparation_time}</Text>
                                                                ) : (
                                                                    <Text>Не указано</Text>
                                                                )}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.content}>
                                                            <Text style={styles.title}>{(index === 1 || index === data.length - 4) && item.title.length > 30
                                                                ? `${item.title.substring(0, 30)}...`
                                                                : item.title.length > 50
                                                                    ? `${item.title.substring(0, 50)}...`
                                                                    : item.title
                                                            }</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            ))
                                        )
                                    }
                                    {loading && (
                                        <View style={{
                                            width: '100%',
                                            position: 'relative',
                                        }}>
                                            <View style={{
                                                position: 'absolute',
                                                bottom: -15,
                                                alignSelf: 'center',

                                            }}>
                                                <ActivityIndicator
                                                    color={'#588460'}
                                                    size={30}
                                                />
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>
                            )
                        )
                    }
                </View >
            )
            }
        </View>
    )

}

const styles = StyleSheet.create({
    block: {
        width: '45%',
        borderRadius: 20,
        marginBottom: 15,
        gap: 5,
    },
    element: {
        borderRadius: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'column',
    },
    time: {
        fontFamily: 'font-jost-reg',
        position: 'absolute',
        backgroundColor: '#FFEBB7',
        padding: 5,
        borderRadius: 50,
        color: '#494F55',
        fontSize: 9,
        top: 10,
        left: 10,
    },
    bold: {
        fontFamily: 'font-jost-bold',
    },
    title: {
        paddingHorizontal: 10,
        paddingTop: 10,
        lineHeight: 15,
        fontSize: 15,
        color: '#1c1c1c',
        fontFamily: 'font-jost-reg',
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        borderRadius: 20,
        width: '100%',
        height: 150,
    },
});