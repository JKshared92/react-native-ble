import React from 'react';
import { View, Text, Button } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import SearchScreen from './Search'
import SettingScreen from './Setting'
import ConnectedScreen from './Connected'
import NewConnectedScreen from './NewConnected'

const AppNavigator = createStackNavigator(
  {
    Home: SearchScreen
  },
  {
    initialRouteName: 'Home'
  }
);

const DetailNavigator = createStackNavigator(
  {
    Main: NewConnectedScreen,
    Setting: SettingScreen
  },
  {
    initialRouteName: 'Main'
  }
)

const SwitchNavigator = createSwitchNavigator(
  {
    AppNavigator: { screen: AppNavigator },
    DetailNavigator: { screen: DetailNavigator }
  },
  {
    initialRouteName: 'AppNavigator'
  }
);

export default createAppContainer(SwitchNavigator);
