import * as React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/tabs';
import TabBarIcon from '../components/TabBarIcon';
import MapScreen from '../screens/MapScreen';
import WineriesScreen from '../screens/WineriesScreen';
import WineryScreen from '../screens/WineryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import InfoScreen from '../screens/InfoScreen';
import RoutesScreen from '../screens/RoutesScreen';
import LearnScreen from '../screens/LearnScreen';
import AccountScreen from '../screens/AccountScreen';
import SeminarsScreen from '../screens/SeminarsScreen';
import GlossaryScreen from '../screens/GlossaryScreen';
import RouteViewerScreen from '../screens/RouteViewerScreen';
import NewsScreen from '../screens/NewsScreen';
import ListingsScreen from '../screens/ListingsScreen';

const config = Platform.select({web:{ headerMode:'screen' },default:{},});

const MapStack = createStackNavigator({Map:MapScreen,Winery:WineryScreen,Info:InfoScreen,Settings:SettingsScreen},config,{initialRouteName:'Map',});
MapStack.navigationOptions = {
  tabBarLabel:<View/>,
  tabBarIcon:({ focused }) => (<TabBarIcon focused={focused} name='map'/>),
};
MapStack.path = '';

const WineriesStack = createStackNavigator({Wineries:WineriesScreen,Winery:WineryScreen,Info:InfoScreen,Settings:SettingsScreen},config,{initialRouteName:'Wineries',});
WineriesStack.navigationOptions = {
  tabBarLabel:<View/>,
  tabBarIcon:({ focused }) => (<TabBarIcon focused={focused} name='glass-wine'/>),
};
WineriesStack.path = 'wineries';

const RoutesStack = createStackNavigator({Routes:RoutesScreen,RouteViewer:RouteViewerScreen,Info:InfoScreen,Settings:SettingsScreen},config,{initialRouteName:'Routes'});
RoutesStack.navigationOptions = {
  tabBarLabel:<View/>,
  tabBarIcon:({ focused }) => (<TabBarIcon focused={focused} name='routes'/>),
};
RoutesStack.path = '';

const LearnStack = createStackNavigator({Learn:LearnScreen,Glossary:GlossaryScreen,Seminars:SeminarsScreen,Info:InfoScreen,Settings:SettingsScreen,News:NewsScreen,Listings:ListingsScreen},config,{initialRouteName:'Learn'});
LearnStack.navigationOptions = {
  tabBarLabel:<View/>,
  tabBarIcon:({ focused }) => (<TabBarIcon focused={focused} name='teach'/>),
};
LearnStack.path = '';

const AccountStack = createStackNavigator({Account:AccountScreen,Info:InfoScreen,Settings:SettingsScreen,RouteViewer:RouteViewerScreen,Winery:WineryScreen},config,{initialRouteName:'Account'});
AccountStack.navigationOptions = {
  tabBarLabel:<View/>,
  tabBarIcon:({ focused }) => (<TabBarIcon focused={focused} name='account'/>),
};
AccountStack.path = '';

var tabs={MapStack,WineriesStack,RoutesStack,AccountStack,LearnStack}
const tabNavigator = createBottomTabNavigator(tabs,{tabBarOptions:{style:{height:55,backgroundColor:'#6e465c'}}});
tabNavigator.path = '';

export default tabNavigator;