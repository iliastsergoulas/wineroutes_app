import React, { Component } from 'react';
import TabBarIcon from '../components/TabBarIcon';
import MapView,{Marker,Callout,Geojson} from 'react-native-maps';
import {ImageBackground,StyleSheet,Text,FlatList,TextInput,SafeAreaView,ScrollView,View,Dimensions,Image,LinearGradient,ActivityIndicator,TouchableOpacity,Platform,PixelRatio} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WineRoutesStore from './../mobx/WineRoutesStore';
import {Card,ListItem} from 'react-native-elements';
import * as Animatable from "react-native-animatable";
import { observer } from 'mobx-react';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 80.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

@observer
class RouteViewerScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {loading:true,selectedwineries:null,myroute:null,region:{latitude:35.2114752,longitude:10.038045,latitudeDelta:LATITUDE_DELTA,longitudeDelta:LONGITUDE_DELTA}};
  }

  componentDidMount() {
    const {navigation} = this.props;
    const myroute=navigation.getParam('myroute',null);
    console.log(JSON.parse(myroute));
    this.setState({myroute:JSON.parse(myroute),myroutename:navigation.getParam('myroutename',null),loading:false});
    if(typeof(JSON.parse(myroute))=='string'){
      this.setState({
        region:{
          latitude:JSON.parse(JSON.parse(myroute)).features[0].geometry.coordinates[0,0][1],
          longitude:JSON.parse(JSON.parse(myroute)).features[0].geometry.coordinates[0,0][0],
          latitudeDelta:LATITUDE_DELTA/100,longitudeDelta:LONGITUDE_DELTA/100
        }
      });
      var selectedwineries=[];
      JSON.parse(JSON.parse(myroute)).features[0].properties.route_optimal.map( f => {
        var filtered=JSON.parse(WineRoutesStore.mywineries).filter(item => item.wineryid===f)
        selectedwineries.push({wineryid:filtered[0].wineryid,name:filtered[0].name,image:filtered[0].image,address:filtered[0].address});
      }) 
      this.setState({selectedwineries:selectedwineries});
    } else {
      this.setState({
        region:{
          latitude:JSON.parse(myroute).features[1].geometry.coordinates[1],
          longitude:JSON.parse(myroute).features[1].geometry.coordinates[0],
          latitudeDelta:LATITUDE_DELTA/100,longitudeDelta:LONGITUDE_DELTA/100
        }
      });
      var selectedwineries=[];
      JSON.parse(JSON.parse(myroute).features[0].properties.route_optimal).map( f => {
        var filtered=JSON.parse(WineRoutesStore.mywineries).filter(item => item.wineryid===f)
        selectedwineries.push({wineryid:filtered[0].wineryid,name:filtered[0].name,image:filtered[0].image,address:filtered[0].address});
      }) 
      this.setState({selectedwineries:selectedwineries});
    }
  };

  secondsToHms(seconds) {
    seconds = Number(seconds);
    var h = Math.floor(seconds / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 3600 % 60);
    var hDisplay = h > 0 ? h + (h == 1 ? t('hour') : t('hours')) : "";
    var mDisplay = m > 0 ? m + (m == 1 ? t('minute') : t('minutes')) : "";
    var sDisplay = s > 0 ? s + (s == 1 ? t('second') : t('seconds')) : "";
    return hDisplay + mDisplay + sDisplay;
  }

  renderItem = ({ item }) => (<Animatable.View animation="fadeInLeft" duration={500} delay={500} useNativeDriver>
    <ListItem
      leftAvatar={{ source: {uri:item.image },size:'large'}}
      containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}
      title={item.name} titleStyle={{color:'white'}} subtitleStyle={{color:'#d1d1d1'}} rightTitleStyle={{color:'white'}}
      subtitle={item.address}
      chevron={{ color: 'white' }}
      topDivider={true}
      onPress={() => this.props.navigation.navigate('Winery', { wineryid:item.wineryid })}
  /></Animatable.View>);

  render() {
    if (this.state.loading) {return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>);};
    const {width:SCREEN_WIDTH,height:SCREEN_HEIGHT,} = Dimensions.get('window');
    const scale = SCREEN_WIDTH / 320;
    function normalize(size) {
      const newSize = size * scale;
      if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
      else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
    };
    const styles = StyleSheet.create({
      container:{flex:1},
      mapStyle:{marginTop:0,height:(SCREEN_HEIGHT-200)/2,},
      circle:{flex:1,flexDirection:'column',width:30,height:30,borderRadius:30/2,backgroundColor:'#6e465c',justifyContent:'center'},
      pinText:{color:'white',fontWeight:'bold',textAlign:'center',fontSize:normalize(10),marginBottom:20,},
    });
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex:1,resizeMode:"cover",}}>
          {this.state.myroute!==null && <Card containerStyle={{height:SCREEN_HEIGHT/1.3,backgroundColor:'rgba(0,0,0,0.5)',marginLeft:10,marginRight:10,padding:0}}>
          <ScrollView>
            <MapView initialRegion={this.state.region} style={styles.mapStyle} loadingEnabled={true} customMapStyle={WineRoutesStore.mapstyle} ref={map => {this.mapView=map}} radius={100} zoomEnabled={true}
                enableZoomControl={true} zoomTapEnabled={true} onMapReady={() => {this.mapView.map.setNativeProps({ style: {...styles.mapStyle,marginLeft:0} })
              }}>
              {typeof(this.state.myroute)!='string' && <Geojson geojson={this.state.myroute} strokeColor="green" fillColor="green" strokeWidth={6}/>}
              {typeof(this.state.myroute)=='string' && <Geojson geojson={JSON.parse(this.state.myroute)} strokeColor="green" fillColor="green" strokeWidth={6}/>}
            </MapView>
            {typeof(this.state.myroute)!='string' && 
              <View><View style={{alignItems:'center'}}><Text style={{color:'white',fontSize:normalize(24),textAlign:'center'}}> {this.state.myroute.features[0].properties.routename}</Text></View><View style={{height:1,width:'72%',backgroundColor: '#CED0CE',marginLeft:'14%',marginRight:'14%'}}/>
              <View style={{flexDirection:'row'}}><MaterialCommunityIcons name="road-variant" size={40} color="#e13741"/><Text style={{fontSize:normalize(16),color:'white'}}>  {((this.state.myroute.features[0].properties.mydistance)/1000).toFixed(2)} klm</Text></View>
              <View style={{flexDirection:'row',marginTop:10}}><MaterialCommunityIcons name="clock" size={40} color="#e13741"/><Text style={{fontSize:normalize(16),color:'white'}}>  {this.secondsToHms(this.state.myroute.features[0].properties.myduration)}</Text></View>
              <FlatList
                data={this.state.selectedwineries}
                renderItem={this.renderItem}
                keyExtractor={item => item.wineryid.toString()}
                ListHeaderComponent={this.renderHeader}
                removeClippedSubviews={true}
                initialNumToRender={7}
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={100}
                windowSize={7}
              /></View>}
            {typeof(this.state.myroute)=='string' && 
              <View><View style={{alignItems:'center'}}><Text style={{color:'white',fontSize:normalize(24),textAlign:'center'}}> {JSON.parse(this.state.myroute).features[0].properties.routename}</Text></View><View style={{height:1,width:'72%',backgroundColor: '#CED0CE',marginLeft:'14%',marginRight:'14%'}}/>
              <View style={{flexDirection:'row'}}><MaterialCommunityIcons name="road-variant" size={40} color="#e13741"/><Text style={{fontSize:normalize(16),color:'white'}}>  {(JSON.parse(this.state.myroute).features[0].properties.mydistance).toFixed(2)} klm</Text></View>
              <View style={{flexDirection:'row',marginTop:10}}><MaterialCommunityIcons name="clock" size={40} color="#e13741"/><Text style={{fontSize:normalize(16),color:'white'}}>  {this.secondsToHms(JSON.parse(this.state.myroute).features[0].properties.myduration)}</Text></View>
              <FlatList
                data={this.state.selectedwineries}
                renderItem={this.renderItem}
                keyExtractor={item => item.wineryid.toString()}
                ListHeaderComponent={this.renderHeader}
                removeClippedSubviews={true}
                initialNumToRender={7}
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={100}
                windowSize={7}
              /></View>}
          </ScrollView></Card>}
        </ImageBackground>
      </SafeAreaView>
    );
  }
}

RouteViewerScreen.navigationOptions = ({navigation}) => ({
  headerStyle:{backgroundColor:'#6e465c'},headerTintColor:'#ffffff',
  headerRight: () => (
    <View style={{flexDirection:'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('routeviewer'),gestureEnabled:true
});

export default RouteViewerScreen;