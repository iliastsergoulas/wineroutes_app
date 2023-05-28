import React, { Component } from 'react';
import {ImageBackground,Image,View,Text,FlatList,ActivityIndicator,AsyncStorage,Dimensions,Platform,PixelRatio,TouchableOpacity} from 'react-native';
import TabBarIcon from '../components/TabBarIcon';
import * as Animatable from "react-native-animatable";
import { ListItem, SearchBar, Card } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import {MaterialCommunityIcons} from '@expo/vector-icons';

class LearnScreen extends Component {
    constructor(props) {
      super(props);
      this.state = {loading: false,error: null};
    }

    render() {
      const { navigation } = this.props;
      if (this.state.loading) {return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>);};
      const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
      const scale = SCREEN_WIDTH / 320;
      function normalize(size) {
        const newSize = size * scale;
        if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
        else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
      }
      return (
        <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex: 1,justifyContent:'center',resizeMode: "cover",}}>
          <View style={{flexDirection:'row',width:SCREEN_WIDTH,justifyContent:'space-around',alignItems:'center'}}>
            <TouchableOpacity style={{justifyContent: 'center'}} onPress={() => navigation.navigate('Listings')}>
              <Card containerStyle={{width:(SCREEN_WIDTH-80)/2,height:SCREEN_HEIGHT/5,justifyContent:'center',backgroundColor:'#6e465c'}}>
                <View style={{alignItems:'center',justifyContent:'space-between'}}>
                  <MaterialCommunityIcons name="shopping" size={normalize(40)} color="white"/>
                  <Text style={{fontSize:normalize(20),color:'white'}}>{t('shop')}</Text>
                </View>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity style={{justifyContent: 'center'}} onPress={() => navigation.navigate('News')}>
              <Card containerStyle={{width:(SCREEN_WIDTH-80)/2,height:SCREEN_HEIGHT/5,justifyContent:'center',backgroundColor:'#6e465c'}}>
                <View style={{alignItems:'center',justifyContent:'space-between'}}>
                  <MaterialCommunityIcons name="newspaper" size={normalize(40)} color="white"/>
                  <Text style={{fontSize:normalize(20),color:'white'}}>{t('news')}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection:'row',width:SCREEN_WIDTH,justifyContent:'space-around',alignItems:'center'}}>
            <TouchableOpacity style={{justifyContent: 'center'}} onPress={() => navigation.navigate('Seminars')}>
              <Card containerStyle={{width:(SCREEN_WIDTH-80)/2,height:SCREEN_HEIGHT/5,justifyContent:'center',backgroundColor:'#6e465c'}}>
                <View style={{alignItems:'center',justifyContent:'space-between'}}>
                  <MaterialCommunityIcons name="school" size={normalize(40)} color="white"/>
                  <Text style={{fontSize:normalize(20),color:'white'}}>{t('seminars')}</Text>
                </View>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity style={{justifyContent: 'center'}} onPress={() => navigation.navigate('Glossary')}>
              <Card containerStyle={{width:(SCREEN_WIDTH-80)/2,height:SCREEN_HEIGHT/5,justifyContent:'center',backgroundColor:'#6e465c'}}>
                <View style={{alignItems:'center',justifyContent:'space-between'}}>
                  <MaterialCommunityIcons name="dictionary" size={normalize(40)} color="white"/>
                  <Text style={{fontSize:normalize(20),color:'white'}}>{t('glossary')}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      );
    }
}

LearnScreen.navigationOptions = ({navigation}) => ({
  headerStyle:{backgroundColor:'#6e465c'},headerTintColor:'#ffffff',headerLeft: () => (<Image source={require('../assets/images/icon.png')} style={{marginLeft:5,width:50,height:50}}/>),
  headerRight: () => (
    <View style={{flexDirection:'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('discover'),gestureEnabled:true,
});

export default LearnScreen;