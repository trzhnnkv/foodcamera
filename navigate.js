import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View, Text } from 'react-native';
import Recipe from './components/Recipe';
import Main from './components/Main';
import Ingredients from './components/Ingredients'
import RecipesByIngredientsPage from './components/RecipesByIngredientsPage'

import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const Navigate = () => {
    return (
            <Stack.Navigator
                screenOptions={{
                    animationEnabled: true,
                    animationTypeForReplace: 'push',
                    headerStyle: {
                        elevation: 0,
                    },
                }}
            >
                <Stack.Screen
                    name="Main"
                    component={Main}
                    options={{
                        headerShown: false,
                        title: 'FoodCamera',
                        headerTitleStyle: {
                            color: '#588460',
                            fontFamily: 'font-berlin',
                            fontSize: 20,
                        },
                        headerTitleAlign: 'center',
                    }}
                />
                <Stack.Screen
                    name="Recipe"
                    component={Recipe}
                    options={({ route }) => ({
                        title: route.params.title,
                        headerTitleStyle: {
                            color: '#588460',
                            fontFamily: 'font-jost-bold',
                            marginLeft: -20,
                            
                        },
                        headerTintColor: '#588460',
                        headerTitleAlign: 'left',
                    })}
                />
            </Stack.Navigator>
    );
}

const RecipesByIngredients = () => {
    return (
            <Stack.Navigator
                screenOptions={{
                    
                    animationEnabled: true,
                    animationTypeForReplace: 'push',
                    headerStyle: {
                        
                        elevation: 0,
                    },
                }}
            >
                <Stack.Screen
                    name="Ingredients"
                    component={Ingredients}
                    options={{
                        headerShown: false,
                        title: 'FoodCamera',
                        headerTitleStyle: {
                            color: '#588460',
                            fontFamily: 'font-berlin',
                            fontSize: 20,
                        },
                        headerTitleAlign: 'center',
                    }}
                />
                <Stack.Screen
                    name="RecipesByIngredientsPage"
                    component={RecipesByIngredientsPage}
                    options={({ route }) => ({
                        title: route.params.join(', '),
                        headerTitleStyle: {
                            color: '#588460',
                            fontFamily: 'font-jost-bold',
                            marginLeft: -20,
                        },
                        headerTintColor: '#588460',
                        headerTitleAlign: 'left',
                    })}
                />
                <Stack.Screen
                    name="Recipe"
                    component={Recipe}
                    options={({ route }) => ({
                        title: route.params.title,
                        headerTitleStyle: {
                            color: '#588460',
                            fontFamily: 'font-jost-bold',
                            marginLeft: -20,
                        },
                        headerTintColor: '#588460',
                        headerTitleAlign: 'left',
                    })}
                />
            </Stack.Navigator>
    );
}

export { Navigate, RecipesByIngredients };

const styles = StyleSheet.create({

});


