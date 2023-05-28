import React, { Component } from 'react';
import {ImageBackground,Image,View,Switch,Text,FlatList,StyleSheet,ActivityIndicator,Dimensions,Platform,PixelRatio,TouchableOpacity} from 'react-native';
import TabBarIcon from '../components/TabBarIcon';
import Colors from '../constants/Colors';
import * as Animatable from "react-native-animatable";
import {Card,ListItem, SearchBar} from 'react-native-elements';
import {LinearGradient} from 'expo-linear-gradient';
import WineRoutesStore from './../mobx/WineRoutesStore';
import * as geolib from 'geolib';
import Collapsible from 'react-native-collapsible';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import Slider from '@react-native-community/slider';

const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
}

class WineriesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {loading:false,data:[],radius:0,showClosest:false,isCollapsed:true,notconnectedVisible:false,nogpsVisible:false};
  }

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  getClosest() {
    if (!this.state.showClosest){
      if (!WineRoutesStore.mylocation || WineRoutesStore.mylocation==''){
        this.setState({nogpsVisible:true});
        setTimeout(function(){
          this.setState({nogpsVisible:false});
        }.bind(this),2000);
      } else {
        const newData = JSON.parse(WineRoutesStore.mywineries).filter(item => {
          return geolib.isPointWithinRadius(
            {latitude:item.latitude,longitude:item.longitude},
            {latitude:JSON.parse(WineRoutesStore.mylocation).coords.latitude,longitude:JSON.parse(WineRoutesStore.mylocation).coords.longitude},
            this.state.radius
          );
        });
        this.setState({data: newData,showClosest:true});
      }
    } else{
      this.setState({data:this.shuffle(JSON.parse(WineRoutesStore.mywineries)),value:'',showClosest:false});
    }
  }

  componentDidMount() {
    this.setState({data:this.shuffle(JSON.parse(WineRoutesStore.mywineries)),});
  };

  searchFilterFunction = text => {
    this.setState({value: text,});
    const newData = JSON.parse(WineRoutesStore.mywineries).filter(item => {
      const itemData = `${item.country.toUpperCase()} ${item.name.toUpperCase()} ${item.address.toUpperCase()}`;
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({data: newData,});
  };

  onRefresh() { 
    this.setState({isRefreshing:true,});
    this.setState({data:JSON.parse(WineRoutesStore.mywineries),});
    this.setState({isRefreshing:false,});
  };

  sliderChange(value){
    this.setState({radius:value});
    if (this.state.showClosest){
      if (!WineRoutesStore.mylocation || WineRoutesStore.mylocation==''){
        this.setState({nogpsVisible:true});
        setTimeout(function(){
          this.setState({nogpsVisible:false});
        }.bind(this),2000);
      } else {
        const newData = JSON.parse(WineRoutesStore.mywineries).filter(item => {
          return geolib.isPointWithinRadius(
            {latitude:item.latitude,longitude:item.longitude},
            {latitude:JSON.parse(WineRoutesStore.mylocation).coords.latitude,longitude:JSON.parse(WineRoutesStore.mylocation).coords.longitude},
            value
          );
        });
        this.setState({data: newData,});
      }
    }
  }

  navigateToWinery(wineryid){
    if (WineRoutesStore.isConnected===true){this.props.navigation.navigate('Winery', { wineryid:wineryid })}
    else {
      this.setState({notconnectedVisible:true});
      setTimeout(function(){
        this.setState({notconnectedVisible:false});
      }.bind(this),2000);
    }
  }

  renderItem = ({ item }) => (<Animatable.View animation="fadeInLeft" duration={500} delay={500} useNativeDriver>
    <ListItem
      leftAvatar={{ source: {uri:item.image },size:'large'}}
      containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}
      title={item.name} titleStyle={{color:'white'}} subtitleStyle={{color:'#d1d1d1'}} rightTitleStyle={{color:'white'}}
      subtitle={item.address}
      chevron={{ color: 'white' }}
      topDivider={true}
      onPress={() => this.navigateToWinery(item.wineryid)}
  /></Animatable.View>);

  renderHeader = () => {
    return (
      <View>
        <TouchableOpacity style={{width:'86%',marginLeft:'7%',marginRight:'7%',}} activeOpacity = { .5 } onPress={() => this.setState({isCollapsed:!this.state.isCollapsed})}>
          <Text style={{fontSize: normalize(16),textAlign: 'center', color:'white', marginTop:10, marginBottom:10, backgroundColor:'#6e465c',borderRadius: 12,borderWidth: 1,padding: 7,}}>Φίλτρα</Text>
        </TouchableOpacity>
        <Collapsible collapsed={this.state.isCollapsed}>
          <SearchBar placeholder={t('typehere')} lightTheme round onChangeText={text => this.searchFilterFunction(text)} inputStyle={{backgroundColor:'transparent'}} containerStyle={{backgroundColor:'transparent'}} autoCorrect={false} value={this.state.value}/>
          <View style={{alignItems:'center'}}>
            <View style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between',marginTop:10,marginBottom:10,width:'90%'}}>
              <Text style={styles.switchLabel}>{t('showclosest')}</Text>
              <View style={styles.switchContainer}>
                <Switch trackColor={{true: Colors.tintColor}} onValueChange={() => this.getClosest()} value={this.state.showClosest} />
              </View>
            </View>
            <View style={{width:'90%',}}>
              <Text style={{fontSize:normalize(16),color:'white'}}>{t('showdistance')}: {this.state.radius} {t('m')}</Text>
              <Slider style={{width:'90%', height: 40}} step={500} value={0} minimumValue={0} maximumValue={10000} minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#000000" onSlidingComplete={value => this.sliderChange(value)}/>
            </View>
          </View>
        </Collapsible>
      </View>
    )
  };

  render() {
    if (this.state.loading) {return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>);};
    const { navigation } = this.props;
    return (
      <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex:1,resizeMode:"cover",}}>
        <Card containerStyle={{height:SCREEN_HEIGHT/1.3,backgroundColor:'rgba(0, 0, 0, 0.5)',marginLeft:10,marginRight:10,padding:0}}>
          <FlatList
            data={this.state.data}
            renderItem={this.renderItem}
            keyExtractor={item => item.wineryid.toString()}
            ListHeaderComponent={this.renderHeader}
            removeClippedSubviews={true}
            initialNumToRender={7}
            maxToRenderPerBatch={2}
            updateCellsBatchingPeriod={100}
            windowSize={7}
          />
        </Card>
        <Modal
          isVisible={this.state.notconnectedVisible} coverScreen={true} style={{justifyContent:'center',margin:0,}}
          onRequestClose={() => {this.setState({notconnectedVisible:false});}}>
          <View style={{height:SCREEN_HEIGHT/3,alignItems:'center'}}>
            <LottieView source={require('../assets/images/error.json')} autoPlay duration={2000}/>
            <View><Text style={{color:'white',fontSize:normalize(20),textAlign: 'center'}}>{t('notlogged')}</Text></View>
          </View>
        </Modal>
        <Modal
          isVisible={this.state.nogpsVisible} coverScreen={true} style={{justifyContent:'center',margin:0,}}
          onRequestClose={() => {this.setState({nogpsVisible:false});}}>
          <View style={{height:SCREEN_HEIGHT/3,alignItems:'center'}}>
            <LottieView source={require('../assets/images/error.json')} autoPlay duration={2000}/>
            <View><Text style={{color:'white',fontSize:normalize(20),textAlign: 'center'}}>{t('nogps')}</Text></View>
          </View>
        </Modal>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  switchrowContainer: {display: 'flex',alignItems:'center',flexDirection:'row',justifyContent:'space-between',marginBottom:15,},
  switchContainer: {display:'flex',alignItems:'center',flexDirection:'row',justifyContent:'space-around',flex:1},
  switchLabel: {flex:1,fontSize:normalize(16),color:'white'}
});

WineriesScreen.navigationOptions = ({navigation}) => ({
  headerStyle: {backgroundColor:'#6e465c'},headerTintColor: '#ffffff',headerLeft: () => (<Image source={require('../assets/images/icon.png')} style={{marginLeft:5,width:50,height:50}}/>),
  headerRight: () => (
    <View style={{flexDirection:'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('wineries'),gestureEnabled:true
});

export default WineriesScreen;