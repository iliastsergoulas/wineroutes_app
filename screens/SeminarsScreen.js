import React, { Component } from 'react';
import {ImageBackground,Image,View,Text,ActivityIndicator,Linking,FlatList,AsyncStorage,Button,RefreshControl,Dimensions,Platform,PixelRatio,TouchableOpacity} from 'react-native';
import TabBarIcon from '../components/TabBarIcon';
import * as Animatable from "react-native-animatable";
import {Card,ListItem,SearchBar} from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import Seminars from '../constants/seminars.json';

const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
}

class SeminarsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: false,data: Seminars,isRefreshing: false,error: null};
  }

  renderSeparator = () => {return (<View style={{height: 1,width: '100%',backgroundColor: '#CED0CE',}}/>);};

  searchFilterFunction = text => {
    this.setState({value: text,});
    const newData = Seminars.filter(item => {
        const itemData = `${item.term.toUpperCase()} ${item.meaning.toUpperCase()}`;
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
    });
    this.setState({data: newData,});
  };

  onRefresh() {this.setState({ isRefreshing: true });}

  renderItem = ({ item }) => (<Animatable.View animation="fadeInLeft" duration={500} delay={500} useNativeDriver>
    <ListItem leftAvatar={{source:{uri:item.image},size:'large'}} chevron={{color:'white'}} titleStyle={{color:'white'}} subtitleStyle={{color:'#d1d1d1'}} title={item.linkname} onPress={() => Linking.openURL(item.url)} containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}/>
  </Animatable.View>);

  renderHeader = () => {return (<SearchBar placeholder={t('typehere')} lightTheme round onChangeText={text => this.searchFilterFunction(text)} inputStyle={{backgroundColor:'transparent'}} containerStyle={{backgroundColor:'transparent'}} autoCorrect={false} value={this.state.value}/>);};

  render() {
    if (this.state.loading) {return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>);};
    return (
      <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex: 1,resizeMode: "cover",}}>
        <View style={{ flex: 1 }}>
          <Card containerStyle={{height:SCREEN_HEIGHT/1.3,backgroundColor:'rgba(0, 0, 0, 0.5)',marginLeft:10,marginRight:10,padding:0}}>
            <FlatList
              data={this.state.data}
              renderItem={this.renderItem}
              keyExtractor={item => item.linkid.toString()}
              ItemSeparatorComponent={this.renderSeparator}
              ListHeaderComponent={this.renderHeader}
              removeClippedSubviews={true}
              initialNumToRender={7}
              maxToRenderPerBatch={2}
              updateCellsBatchingPeriod={100}
              windowSize={7}
              extraData={this.state.isRefreshing}
            />
          </Card>
        </View>
      </ImageBackground>
    );
  }
}

SeminarsScreen.navigationOptions = ({ navigation }) => ({
  headerStyle:{backgroundColor:'#6e465c'},headerTintColor:'#ffffff',
  headerRight: () => (
    <View style={{flexDirection:'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('seminars'),gestureEnabled:true,
});

export default SeminarsScreen;