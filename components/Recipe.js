/**
 * @file Recipe.js
 * @brief Component for displaying details of a recipe in the recipe application.
 */

import React, { useEffect, useState, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Image, StatusBar, ScrollView, ActivityIndicator, FlatList, Dimensions, TouchableOpacity } from 'react-native';

/**
 * @brief Functional component to display recipe details.
 * @param {Object} route - The route object.
 * @param {Object} navigation - The navigation object.
 * @returns {JSX.Element} The rendered component.
 */
export default function Recipe({ route, navigation }) {
  const [data, setData] = useState(false);
  const [title, setTitle] = useState('');
  const [image_url, setImageUrl] = useState(route.params.image_url);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [preparation_time, setPreparationTime] = useState('');
  const [servings, setServings] = useState('');
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * @brief Scrolls the FlatList to the specified index.
   * @param {number} index - The index to scroll to.
   */
  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setActiveIndex(index);
    }
  };

  /**
   * @brief Scrolls to the next instruction.
   */
  const scrollToNext = () => {
    const nextIndex = activeIndex + 1;
    if (nextIndex < instructions.length) {
      scrollToIndex(nextIndex);
    }
  };

  /**
   * @brief Scrolls to the previous instruction.
   */
  const scrollToPrevious = () => {
    const previousIndex = activeIndex - 1;
    if (previousIndex >= 0) {
      scrollToIndex(previousIndex);
    }
  };

  const selectedIngredients = route.params.selectedIngredients;

  const nameOfNutrients = ["ккал", "белки", "жиры", "углеводы"];

  /**
   * @brief Fetches recipe data from the API.
   */
  const getAPIdata = async () => {
    try {
      const id = route.params.id;
      const response = await fetch(`http://213.132.76.244:7000/recipes/${id}`);
      const jsonData = await response.json();
      setData(jsonData);
      setTitle(jsonData.title);
      setImageUrl(jsonData.image_url);
      setIngredients(JSON.parse(jsonData.ingredients));
      setInstructions(JSON.parse(jsonData.instructions));
      setNutrition(JSON.parse(jsonData.nutrition_info));
      setPreparationTime(jsonData.preparation_time);
      setServings(jsonData.servings);
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    getAPIdata();
  }, [])


  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80, gap: 20, backgroundColor: 'white' }}>
        <StatusBar barStyle='dark-content' backgroundColor='white' />
        <ActivityIndicator
          color={'#588460'}
          size={40}
        />
      </View>
    )
  } else {
    return (
      <View style={{ backgroundColor: 'white' }}>
        <StatusBar style="auto" />
        <ScrollView contentContainerStyle={{paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: image_url }} style={styles.image} />
            <Text style={styles.title}>
              {title}
            </Text>
          </View>
          <View style={styles.content}>
            {preparation_time || servings ? (
              <View style={styles.separator}>
                {preparation_time ? (
                  <Text style={{
                    fontFamily: 'font-jost-reg',
                    fontSize: 17,
                    color: '#727272',
                  }}>
                    <Text>Время приготовления </Text>
                    <Text style={{
                      fontFamily: 'font-jost-bold',
                      color: '#588460',
                    }}>{preparation_time}</Text>
                  </Text>
                ) : null}
                {servings ? (
                  <Text style={{
                    fontFamily: 'font-jost-reg',
                    fontSize: 17,
                    color: '#727272',
                  }}>
                    <Text>Количество порций </Text>
                    <Text style={{
                      fontFamily: 'font-jost-bold',
                      color: '#588460',
                    }}>{servings}</Text>
                  </Text>
                ) : null}
              </View>
            ) : null}
            <View style={styles.separator}>
              <Text style={styles.header}>Ингредиенты</Text>
              {ingredients.map((item, index) => (
                <View key={index}>
                  <Text style={{
                    fontFamily: 'font-jost-reg',
                    fontSize: 17,
                    color: route.params.selectedIngredients ? (selectedIngredients.includes(item.name) ? '#588460' : '#CD5C5C') : '#727272',
                  }}>
                    <Text>{item.name}: </Text>
                    <Text style={{
                      fontFamily: 'font-jost-bold',
                      color: route.params.selectedIngredients ? null : '#588460',
                    }}>{item.value}</Text>
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.separator}>
              <Text style={styles.header}>Пищевая и энергетическая ценность:</Text>
              {nutrition.map((item, index) => (
                <View key={index} style={{
                  width: '100%',
                  gap: 10,
                  marginBottom: 10,
                }}>
                  <Text style={{
                    backgroundColor: '#9EC2A4',
                    color: 'white',
                    textAlign: 'center',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    fontSize: 16,
                    paddingVertical: 5,
                    fontFamily: 'font-jost-bold',
                  }}>{item.name}</Text>
                  <View style={{
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    width: '100%',
                    alignItems: 'center',
                    flexDirection: 'row',
                    backgroundColor: '#F0F0F0',
                    padding: 10,
                    borderBottomLeftRadius: 20,
                    borderBottomRightRadius: 20,
                  }}>

                    {Object.keys(item.values).map((key, i) => (
                      <View key={i} style={{
                        flexDirection: 'column',
                        flex: 1,
                        alignItems: 'center',
                      }}>

                        <View style={{

                        }}>
                          <Text style={{
                            color: '#1c1c1c',
                          }}>{nameOfNutrients[key]}</Text>
                        </View>
                        <View style={{

                        }}>
                          <Text style={{
                            color: '#588460',
                            fontWeight: 600,
                            textAlign: 'center',
                          }}>{item.values[key]}</Text>
                        </View>

                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.separator}>
              <Text style={styles.header}>Инструкция</Text>
              <View style={{
                position: 'relative',
              }}>
                <FlatList
                  onMomentumScrollEnd={(event) => {
                    const offsetX = event.nativeEvent.contentOffset.x;
                    const width = Dimensions.get('window').width - 40;
                    const newIndex = Math.round(offsetX / width);
                    setActiveIndex(newIndex);
                  }}
                  ref={flatListRef}
                  scrollEnabled={true}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={instructions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        padding: 10,
                        gap: 10,
                        borderRadius: 20,
                        width: Dimensions.get('window').width - 60,
                      }}
                    >
                      <View style={{
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        backgroundColor: '#9EC2A4',
                        paddingVertical: 5,
                        paddingLeft: 20,
                      }}>
                        <Text style={{
                          fontFamily: 'font-jost-bold',
                          fontSize: 16,
                          color: 'white',
                        }}>Шаг {index + 1}</Text>
                      </View>
                      <View style={{
                        backgroundColor: '#9EC2A4',
                      }}>
                        <Image
                          source={{ uri: item.image }}
                          style={{
                            width: '100%',
                            height: undefined,
                            aspectRatio: 4 / 3,
                          }}
                        />
                      </View>

                      <View
                        style={{
                          width: '100%',
                          padding: 20,
                          borderBottomLeftRadius: 20,
                          borderBottomRightRadius: 20,
                          paddingBottom: 30,
                          backgroundColor: '#F0F0F0',
                          flex: 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'font-jost-reg',
                          }}
                        >
                          {item.instruction}
                        </Text>
                      </View>
                    </View>
                  )}
                />
                <View style={{ flexDirection: 'row', position: 'absolute', top: 180, width: '100%', justifyContent: 'space-between' }}>
                  <TouchableOpacity activeOpacity={0.8} onPress={scrollToPrevious} style={{
                    left: -15,
                  }}>
                    <View style={{
                      display: (activeIndex > 0) ? 'flex' : 'none',
                      backgroundColor: '#588460',
                      borderRadius: 50,
                    }}>
                      <MaterialIcons name={"keyboard-arrow-left"} color={'white'} size={50} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.8} onPress={scrollToNext} style={{
                    right: -15,
                  }}>
                    <View style={{
                      display: (activeIndex < instructions.length - 1) ? 'flex' : 'none',
                      backgroundColor: '#588460',
                      borderRadius: 50,
                    }}>
                      <MaterialIcons name={"keyboard-arrow-right"} color={'white'} size={50} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    width: 300,
    alignSelf: 'center',
    marginBottom: 20,
    fontSize: 22,
    fontFamily: 'font-jost-reg',
    textAlign: 'center',
    color: '#494F55',
  },
  center: {
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    paddingBottom: 20,
  },
  imageContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 3 / 2,
  },
  title: {
    backgroundColor: '#F0F0F0',
    width: '100%',
    textTransform: 'uppercase',
    fontFamily: 'font-jost-bold',
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 20,
    lineHeight: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    color: '#588460',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  separator: {
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    marginBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
});
