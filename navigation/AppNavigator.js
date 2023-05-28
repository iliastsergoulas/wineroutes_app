import React from 'react';
import { createAppContainer, createSwitchNavigator } from '@react-navigation/native';
import MainTabNavigator from './BottomTabNavigator';

export default createAppContainer(
  	createSwitchNavigator({Main: MainTabNavigator})
);
