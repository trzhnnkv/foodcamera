// Import necessary React and React Native components and libraries
import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  LogBox,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

// Ignore all logs to prevent unnecessary warnings
LogBox.ignoreAllLogs();

// Main functional component for displaying a list of recipes
export default function Main({ route, navigation }) {
  // State variables to manage data fetching, loading, and error handling
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [endOfData, setEndOfData] = useState(false);

  // Selected ingredients received from route parameters
  const selectedItems = route.params;

  // Local image source for recipes without an image
  const localImageSource = require('../assets/replace.png');

  // Function to fetch recipe data from the API
  const getAPIdata = async () => {
    const ingredients = route.params;
    const ingredientsString = ingredients.join(',');
    const url = `http://213.132.76.244:7000/recipesByIngredients?offset=${(page - 1) * 16}&limit=16&ingredients=${ingredientsString}`;

    try {
      setErrorLoading(false);
      setLoading(true);
      const result = await fetch(url);
      const jsonData = await result.json();
      if (jsonData.length === 0) {
        setEndOfData(true);
        setLoading(false);
      } else {
        setData((prevData) => [...prevData, ...jsonData]);
        setPage((prevPage) => prevPage + 1);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorLoading(true);
      setLoading(false);
    }
  };

  // Function to handle scroll events and trigger fetching more data
  const handleScroll = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;

    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      handleEndReached();
    }
  };

  // Function to handle reaching the end of the list and trigger fetching more data
  const handleEndReached = () => {
    if (!loading && !endOfData) {
      getAPIdata();
    }
  };

  // useEffect hook to fetch data on component mount
  useEffect(() => {
    getAPIdata();
  }, []);

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
            </View>
        )
    } else if (!errorLoading && data.length == 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80, backgroundColor: 'white' }}>
                {endOfData ? (
                    <Text style={{
                        alignSelf: 'center',
                        width: '90%',
                        fontSize: 18,
                        color: '#588460',
                        paddingTop: 5,
                        marginTop: 10,
                        textAlign: 'center',
                        fontFamily: 'font-jost-reg',
                    }}>Упс... Нет рецептов из данных ингредиентов</Text>
                ) : (
                    <View>
                        <StatusBar barStyle='dark-content' backgroundColor='white' />
                        <ActivityIndicator
                            color={'#588460'}
                            size={40}
                        />
                    </View>
                )}
            </View>
        )
    } else {
        return (
            <View style={{ backgroundColor: 'white', flex: 1, }}>
                <StatusBar barStyle='dark-content' backgroundColor='white' />
                <ScrollView
                    contentContainerStyle={{
                        position: 'relative',
                        paddingTop: 25,
                        paddingBottom: 130,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'space-evenly',
                    }}
                    showsVerticalScrollIndicator={false}
                    onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
                >
                    {data.map((item, index) => {
                        const getMissingIngredientsCount = (recipeIngredients, selectedItems) => {
                            const count = recipeIngredients.reduce((acc, ingredient) => {
                                return acc + (selectedItems.includes(ingredient.name) ? 0 : 1);
                            }, 0);
                            return count;
                        };
                        return (
                            <View key={index} style={styles.block}>
                                <TouchableOpacity
                                    style={[
                                        styles.element,
                                        index !== 1 && index % 2 !== 0 ? { marginTop: -20 } : null,
                                        endOfData && index === data.length - 2 ? { marginTop: -20 } : null,
                                        index === 1 ? { height: 200 } : { height: 210 },
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate('Recipe', { id: item.id, title: item.title, selectedIngredients: selectedItems })}
                                >
                                    <View style={[styles.imageContainer, { overflow: 'hidden', borderRadius: 20, backgroundColor: '#9EC2A4', }]}>
                                        <Image source={item.image_url ? { uri: item.image_url } : localImageSource} style={styles.image} />
                                        <Text style={styles.time}>
                                            {item.preparation_time ? (
                                                <Text style={styles.bold}>{item.preparation_time}</Text>
                                            ) : (
                                                <Text>Не указано</Text>
                                            )}
                                        </Text>
                                        <View style={{
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            bottom: 0,
                                            padding: 0,
                                            alignSelf: 'center',
                                            position: 'absolute',
                                            width: '100%',
                                            flex: 1,
                                        }}>
                                            <Text style={{
                                                textAlign: 'center',
                                                width: '100%',
                                                fontSize: 11,
                                                backgroundColor: '#9EC2A4',
                                                fontFamily: 'font-jost-reg',
                                                paddingVertical: 3,
                                                color: 'white',
                                            }}>
                                                <Text>Не хватает </Text>
                                                <Text style={{
                                                    fontFamily: 'font-jost-bold',
                                                }}>{getMissingIngredientsCount(JSON.parse(item.ingredients), selectedItems)}</Text>
                                                <Text> ингредиента(-ов)</Text>
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.content}>
                                        <Text style={styles.title}>{(index === 1 || index === data.length - 4) && item.title.length > 30
                                            ? `${item.title.substring(0, 30)}...`
                                            : item.title.length > 37
                                                ? `${item.title.substring(0, 37)}...`
                                                : item.title
                                        }</Text>

                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                    )}
                    {loading && (
                        <View style={{
                            width: '100%',
                            position: 'relative',
                        }}>
                            <View style={{
                                position: 'absolute',
                                bottom: -25,
                                alignSelf: 'center',

                            }}>
                                <ActivityIndicator
                                    color={'#588460'}
                                    size={30}
                                />
                            </View>
                        </View>
                    )}
                    {endOfData && (
                        <View style={{
                            width: "90%",
                        }}>
                            <Text style={{
                                alignSelf: 'center',
                                width: '100%',
                                color: '#588460',
                                borderTopColor: '#588460',
                                borderTopWidth: 2,
                                paddingTop: 5,
                                marginTop: 10,
                                textAlign: 'center',
                                fontFamily: 'font-jost-reg',
                            }}>
                                Это все рецепты
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        )
    }
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