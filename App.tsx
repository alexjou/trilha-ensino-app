import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/Pages/Login';
import Home from './src/Pages/Home';
import { StatusBar } from 'react-native';
import Colors from './src/Constants/Colors';
import Onboarding from './src/Pages/Onboarding';
import Chat from './src/Pages/Chat';
import VoiceAssistant from './src/Pages/VoiceAssistant';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor={Colors.default} />
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="VoiceAssistant" component={VoiceAssistant} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
