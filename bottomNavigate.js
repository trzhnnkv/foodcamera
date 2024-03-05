import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Navigate, RecipesByIngredients, CameraPage } from './navigate';
import Camera from './components/Camera';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBook, faCarrot } from '@fortawesome/free-solid-svg-icons/';

const Tab = createBottomTabNavigator();

export default BottomNavigation = () => {

    return (
        <NavigationContainer>
            <Tab.Navigator
                initialRouteName="AllRecipces"
                screenOptions={{
                    animationEnabled: true,
                    animationTypeForReplace: 'push',
                    tabBarStyle: {
                        backgroundColor: 'white',
                        paddingHorizontal: 20,
                        height: 70,
                        elevation: 10,
                        borderTopWidth: 0,
                        width: '90%',
                        left: '5%',
                        position: 'absolute',
                        borderRadius: 20,
                        bottom: 15,
                    },
                    tabBarLabelStyle: {
                        display: 'none',
                    },
                    lazy: 'true',
                }}
            >
                <Tab.Screen
                    name="AllRecipces"
                    component={Navigate}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <View style={{
                                alignItems: 'center',
                            }}>
                                <FontAwesomeIcon icon={faBook} color={focused ? '#588460' : '#cccccc'} size={25}/>
                                <Text style={{
                                    color: focused ? '#588460' : '#cccccc',
                                    fontFamily: 'font-jost-reg',
                                }}>Все рецепты</Text>
                            </View>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Camera"
                    component={Camera}
                    options={{
                        headerShown: false,
                        tabBarStyle: {
                            display: 'none',
                        },
                        tabBarIcon: ({ focused }) => (
                            <View style={{
                                backgroundColor: '#588460',
                                borderColor: 'white',
                                borderWidth: 7,
                                position: 'absolute',
                                padding: 15,
                                bottom: -5,
                                borderRadius: 60,
                                zIndex: 10,
                            }}>
                                <MaterialIcons name="camera-alt" color={'white'} size={45} />
                            </View>
                        ),
                    }}
                />
                <Tab.Screen
                    name="RecipesByIngredients"
                    component={RecipesByIngredients}
                    options={{
                        headerShown: false,
                        title: 'FoodCamera',
                        headerTitleStyle: {
                            color: '#588460',
                            fontFamily: 'font-berlin',
                            fontSize: 20,
                        },
                        tabBarIcon: ({ focused }) => (
                            <View style={{
                                alignItems: 'center',
                            }}>
                                <FontAwesomeIcon icon={faCarrot} color={focused ? '#588460' : '#cccccc'} size={25}/>
                                <Text style={{
                                    color: focused ? '#588460' : '#cccccc',
                                    fontFamily: 'font-jost-reg',
                                }}>Ингредиенты</Text>
                            </View>
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};