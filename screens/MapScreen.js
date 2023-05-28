import React, {Component,useState,useEffect} from 'react';
import TabBarIcon from '../components/TabBarIcon';
import MapView,{Marker,Geojson} from 'react-native-maps';
import {FlatList,ScrollView,StyleSheet,Text,TextInput,SafeAreaView,View,Dimensions,Image,ImageBackground,ActivityIndicator,TouchableOpacity,Platform,PixelRatio} from 'react-native';
import LottieView from 'lottie-react-native';
import Wineries from '../constants/mywineries.json';
import WineRoutesStore from './../mobx/WineRoutesStore';
import {MaterialIcons} from '@expo/vector-icons';
import {ListItem,SearchBar} from 'react-native-elements';
import {observer} from 'mobx-react';
import * as Location from 'expo-location';
import ClusterMarker from "../components/ClusterMarker";
import {getCluster} from "../utilities/MapUtils";
import * as SplashScreen from 'expo-splash-screen';
import * as Permissions from 'expo-permissions';
import * as SecureStore from 'expo-secure-store';
import Areas from "../constants/areas";
import * as Linking from 'expo-linking';
import Modal from 'react-native-modal';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 60.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

@observer
class MapScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {loading:true,searchAreasVisible:false,geojsonon:false,url:'',bbox:[],mywineries:[],mywineriesgeo:[],query:'',zoom:5,
    region:{latitude:35.2114752,longitude:10.038045,latitudeDelta:LATITUDE_DELTA,longitudeDelta:LONGITUDE_DELTA},iconColor:'white',
    searchVisible:false,myareas:Areas};
  }

  getArea = async (id,country) => {
    if (WineRoutesStore.isConnected===true){
      if (country==='USA'){
        var myurl='http://46.101.117.105:8080/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&outputFormat=application/json&typeName=agriculture:avas_view&viewparams=myselection:'+id;
        fetch(myurl)
        .then(res => res.json())
        .then(res => {
          this.setState({url:res,searchAreasVisible:false,geojsonon:true});
          this.mapView.animateToRegion({latitude:res.features[0].geometry.coordinates[0][0][0][1],longitude:res.features[0].geometry.coordinates[0][0][0][0],latitudeDelta:LATITUDE_DELTA/6,longitudeDelta:LONGITUDE_DELTA/6},1000);
        })
        .catch(error => {error})
      } else {
        var myurl='http://46.101.117.105:8080/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&outputFormat=application/json&typeName=agriculture:french_view&viewparams=myselection:'+id;
        fetch(myurl)
        .then(res => res.json())
        .then(res => {
          this.setState({url:res,searchAreasVisible:false,geojsonon:true});
          this.mapView.animateToRegion({latitude:res.features[0].geometry.coordinates[0][0][0][1],longitude:res.features[0].geometry.coordinates[0][0][0][0],latitudeDelta:LATITUDE_DELTA/6,longitudeDelta:LONGITUDE_DELTA/6},1000);
        })
        .catch(error => {error})
      }
    }
    else {
      this.setState({notconnectedVisible:true});
      setTimeout(function(){
        this.setState({notconnectedVisible:false});
      }.bind(this),2000);
    }
  };

  redirectUrl(url){
    let { path, queryParams } = Linking.parse(url);
    if (path==='wineries'){this.props.navigation.navigate('Winery', queryParams)};
  }

  async componentDidMount() {
    try {
      await SplashScreen.preventAutoHideAsync();
    } catch (e) {
      console.warn(e);
    };
    var url = Linking.getInitialURL().then((url) => {
      if (url) {
        this.redirectUrl(url);
      }
    }).catch(err => console.error('An error occurred', err));
    //Linking.addEventListener('url', this.redirectUrl(url))
    SecureStore.getItemAsync("edition").then((edition)=>{
      if(!edition || !WineRoutesStore.mywineries){edition=0};
      const url = "https://app.wineroutes.eu/getwineries?edition="+edition;
      fetch(url)
      .then(res => res.json())
      .then(res => {
        if(res.data){
          WineRoutesStore.storeWineries(res.data);
          this.setState({loading:false,
            mywineries:res.data,
            mywineriesgeo:res.data.map((item) => {
              return {wineryid:item.wineryid,latitude:item.latitude,longitude:item.longitude}
            })}, async () => {
              await SplashScreen.hideAsync();
          });
        } else {
          this.setState({loading:false,
            mywineries:JSON.parse(WineRoutesStore.mywineries),
            mywineriesgeo:JSON.parse(WineRoutesStore.mywineries).map((item) => {
              return {wineryid:item.wineryid,latitude:item.latitude,longitude:item.longitude}
            })}, async () => {
              await SplashScreen.hideAsync();
            });
        };
        SecureStore.setItemAsync("edition",res.edition.toString());
      })
      .catch(error => {
        console.log(error);
        this.setState({loading:false,
          mywineries:JSON.parse(WineRoutesStore.mywineries),
          mywineriesgeo:JSON.parse(WineRoutesStore.mywineries).map((item) => {
            return {wineryid:item.wineryid,latitude:item.latitude,longitude:item.longitude}
          })}, async () => {
            await SplashScreen.hideAsync();
        });
      })
    })
    .catch((error)=>{console.log(error)});
  };

  _getLocationPermissionAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION)
    if (status !== 'granted') {
      // display an error
    }
    let location = await Location.getCurrentPositionAsync({accuracy:6});
    WineRoutesStore.storeLocation(location);
    this.mapView.animateToRegion({latitude:location.coords.latitude,longitude:location.coords.longitude,latitudeDelta:LATITUDE_DELTA/10,longitudeDelta:LONGITUDE_DELTA/10},1000);
    alert(JSON.stringify(location));
  }

  onRegionChangeComplete(region) {
    const getBoundByRegion = (region, scale = 1) => {
      const calcMinLatByOffset = (lng, offset) => {
        const factValue = lng - offset;
        if (factValue < -90) {return (90 + offset) * -1;}
        return factValue;
      };
      const calcMaxLatByOffset = (lng, offset) => {
        const factValue = lng + offset;
        if (90 < factValue) {return (90 - offset) * -1;}
        return factValue;
      };
      const calcMinLngByOffset = (lng, offset) => {
        const factValue = lng - offset;
        if (factValue < -180) {return (180 + offset) * -1;}
        return factValue;
      };
      const calcMaxLngByOffset = (lng, offset) => {
        const factValue = lng + offset;
        if (180 < factValue) {eturn (180 - offset) * -1;}
        return factValue;
      };
      const latOffset = region.latitudeDelta / 2 * scale;
      const lngD = (region.longitudeDelta < -180) ? 360 + region.longitudeDelta : region.longitudeDelta;
      const lngOffset = lngD / 2 * scale;
      return {
        minLng: calcMinLngByOffset(region.longitude, lngOffset), // westLng - min lng
        minLat: calcMinLatByOffset(region.latitude, latOffset), // southLat - min lat
        maxLng: calcMaxLngByOffset(region.longitude, lngOffset), // eastLng - max lng
        maxLat: calcMaxLatByOffset(region.latitude, latOffset),// northLat - max lat
      }
    }
    const myzoom=Math.log2(360 * ((Dimensions.get('window').width/256) / region.longitudeDelta)) + 1 ;
    this.setState({zoom:myzoom,region:region,bbox:[getBoundByRegion(region).minLng,getBoundByRegion(region).minLat,getBoundByRegion(region).maxLng,getBoundByRegion(region).maxLat]});
  }

  goToWinery(lat,long,latD,longD){
    this.mapView.animateToRegion({latitude:lat,longitude:long,latitudeDelta:latD/10,longitudeDelta:longD/10},1000);
    this.setState({ searchVisible: false });
  }

  searchFilterFunction = text => {
    this.setState({value: text,});
    const newData = JSON.parse(WineRoutesStore.mywineries).filter(item => {
      const itemData = `${item.country.toUpperCase()} ${item.name.toUpperCase()} ${item.address.toUpperCase()}`;
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({mywineries: newData,});
  };

  searchAreaFunction = text => {
    this.setState({value: text,});
    const newData = Areas.filter(item => {
      const itemData = `${item.country.toUpperCase()} ${item.name.toUpperCase()}`;
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({myareas: newData,});
  };

  renderItem = ({ item }) => (<ListItem title={item.name} chevron={{ color: 'white' }} topDivider={true} onPress={() => this.goToWinery(item.latitude,item.longitude,this.state.region.latitudeDelta,this.state.region.longitudeDelta)}/>);
  renderArea = ({ item }) => (<ListItem containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}} title={item.name} titleStyle={{color:'black'}} subtitle={item.country} chevron={{ color: 'black' }}topDivider={true} onPress={() => this.getArea(item.id,item.country)}/>);

  renderHeader = () => {return (<SearchBar placeholder={t('typehere')} lightTheme round onChangeText={text => this.searchFilterFunction(text)} inputStyle={{backgroundColor:'transparent'}} containerStyle={{backgroundColor:'transparent'}} autoCorrect={false} value={this.state.value}/>)};
  renderAreaHeader = () => {return (<SearchBar placeholder={t('typehere')} lightTheme round onChangeText={text => this.searchAreaFunction(text)} inputStyle={{backgroundColor:'transparent'}} containerStyle={{backgroundColor:'transparent'}} autoCorrect={false} value={this.state.value}/>)};

  navigateToWinery(wineryid){
    if (WineRoutesStore.isConnected===true){this.props.navigation.navigate('Winery', { wineryid:wineryid })}
    else {
      this.setState({notconnectedVisible:true});
      setTimeout(function(){
        this.setState({notconnectedVisible:false});
      }.bind(this),2000);
    }
  }

  renderMarker = (marker,style,index) => {
    const key = index + marker.geometry.coordinates[0];
    const {navigation} = this.props;
    if (marker.properties) {
      if (style==='Vintage' || style==='Industrial'){
        return (
          <MapView.Marker key={key} coordinate={{latitude: marker.geometry.coordinates[1],longitude: marker.geometry.coordinates[0]}} onPress={() => this.goToWinery(marker.geometry.coordinates[1],marker.geometry.coordinates[0],this.state.region.latitudeDelta,this.state.region.longitudeDelta)}>
            <ClusterMarker count={marker.properties.point_count} fontColor='black'/>
          </MapView.Marker>
        );
      } else {
        return (
          <MapView.Marker key={key} coordinate={{latitude: marker.geometry.coordinates[1],longitude: marker.geometry.coordinates[0]}} onPress={() => this.goToWinery(marker.geometry.coordinates[1],marker.geometry.coordinates[0],this.state.region.latitudeDelta,this.state.region.longitudeDelta)}>
            <ClusterMarker count={marker.properties.point_count} fontColor='white'/>
          </MapView.Marker>
        );
      }
    }
    return (
      <MapView.Marker key={key} coordinate={{latitude: marker.geometry.coordinates[1],longitude: marker.geometry.coordinates[0]}} pinColor='tan' onPress={() => this.navigateToWinery(marker.wineryid)}/>
    );
  };


  render() {
		//if (this.state.loading) {return <LottieView source={require('../assets/images/wine.json')} autoPlay loop />};
		const {navigation} = this.props;
		const {width:SCREEN_WIDTH,height:SCREEN_HEIGHT,} = Dimensions.get('window');
		const scale = SCREEN_WIDTH / 320;
		function normalize(size) {
		  const newSize = size * scale;
		  if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
		  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
		};
		const styles = StyleSheet.create({
		  container:{flex:1},
		  mapStyle:{flex:1,marginLeft: 1},
		  circle:{flex:1,flexDirection:'column',width:40,height:40,borderRadius:40/2,backgroundColor:'#6e465c',justifyContent:'center',alignItems:'center',padding:0},
		  pinText:{color:'white',fontWeight:'bold',textAlign:'center',fontSize:normalize(13),},
		});
    const allCoords = this.state.mywineriesgeo.map(c => ({
      geometry: {coordinates: [c.longitude,c.latitude]},
      wineryid:c.wineryid
    }));
    const cluster = getCluster(allCoords, this.state.region);
		return (
		  <SafeAreaView style={styles.container}>
        <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex: 1,justifyContent: 'center',resizeMode: "cover",}}>
    			<MapView initialRegion={this.state.region} style={styles.mapStyle} loadingEnabled={true} onRegionChangeComplete={this.onRegionChangeComplete.bind(this)} 
            customMapStyle={WineRoutesStore.mapstyle} ref={map => {this.mapView = map}} zoomControlEnabled={true} radius={100} showsUserLocation showsMyLocationButton={false}
            onMapReady={() => {this.mapView.map.setNativeProps({ style: {...styles.mapStyle, marginLeft: 0} })}}>
            {cluster.markers.map((marker, index) => this.renderMarker(marker,WineRoutesStore.mapstyleselect,index))}
            {this.state.url !='' && <Geojson geojson={this.state.url} strokeColor="red" fillColor="rgba(109, 70, 91, 0.7)" strokeWidth={2}/>}
          </MapView>
    			<View style={{flexDirection:'column',position:'absolute',left:'2%',top:'2%',alignSelf:'flex-start'}}>
    			  <TouchableOpacity style={{backgroundColor:'rgba(255,255,255, 0.6)',borderColor:'gray',borderWidth:0.7}} onPress={() => this.setState({searchVisible:true})}><MaterialIcons name="search" size={40} color='gray'/></TouchableOpacity>
            <TouchableOpacity style={{backgroundColor:'rgba(255,255,255, 0.6)',borderColor:'gray',borderWidth:0.7}} onPress={() => this._getLocationPermissionAsync()}><MaterialIcons name="gps-fixed" size={40} color='gray'/></TouchableOpacity>
            <TouchableOpacity style={{backgroundColor:'rgba(255,255,255, 0.6)',borderColor:'gray',borderWidth:0.7}} onPress={() => this.setState({searchAreasVisible:true})}><MaterialIcons name="layers" size={40} color='gray'/></TouchableOpacity>
            {this.state.geojsonon && <TouchableOpacity style={{backgroundColor:'rgba(255,255,255, 0.6)',borderColor:'gray',borderWidth:0.7}} onPress={() => this.setState({url:'',geojsonon:false})}><MaterialIcons name="delete-forever" size={40} color='gray'/></TouchableOpacity>}
    			</View>
    			<Modal
    			  animationType="slide"
    			  transparent={false}
    			  visible={this.state.searchVisible}
    			  onRequestClose={() => {this.setState({searchVisible:false});}}>
    			  <View style={{ marginTop: 22,}}>
              <TouchableOpacity onPress={() => this.setState({searchVisible:false})}>
                <Text style={{fontSize:normalize(16),color:'black',textAlign:'center'}}>{t('close')}</Text>
              </TouchableOpacity>
              <Text style={{marginTop:20,fontSize:normalize(18),color:'black',textAlign:'center'}}>{t('wineries')}</Text>
      				<FlatList
      				  data={this.state.mywineries}
      				  renderItem={this.renderItem}
      				  keyExtractor={item => item.wineryid.toString()}
      				  ListHeaderComponent={this.renderHeader}
      				  removeClippedSubviews={true}
      				  initialNumToRender={20}
      				  maxToRenderPerBatch={2}
      				  updateCellsBatchingPeriod={100}
      				  windowSize={7}
      				/>
    			  </View>
    			</Modal>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.searchAreasVisible}
            onRequestClose={() => {this.setState({searchAreasVisible:false});}}>
            <View style={{ marginTop: 22,}}>
              <TouchableOpacity onPress={() => this.setState({searchAreasVisible:false})}>
                <Text style={{fontSize:normalize(16),color:'black',textAlign:'center'}}>{t('close')}</Text>
              </TouchableOpacity>
              <Text style={{marginTop:20,fontSize:normalize(18),color:'black',textAlign:'center'}}>{t('areas')}</Text>
              <FlatList
                data={this.state.myareas}
                renderItem={this.renderArea}
                keyExtractor={item => item.id}
                ListHeaderComponent={this.renderAreaHeader}
                removeClippedSubviews={true}
                initialNumToRender={20}
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={100}
                windowSize={7}
              />
            </View>
          </Modal>
          <Modal
            isVisible={this.state.notconnectedVisible} coverScreen={false} style={{justifyContent: 'center',margin: 0,}}
            onRequestClose={() => {this.setState({notconnectedVisible:false});}}>
            <View style={{height:SCREEN_HEIGHT/3,alignItems:'center'}}>
              <LottieView source={require('../assets/images/error.json')} autoPlay duration={2000}/>
              <View><Text style={{color:'white',fontSize:normalize(20)}}>{t('notlogged')}</Text></View>
            </View>
          </Modal>
        </ImageBackground>
		  </SafeAreaView>
		);
	}
}

MapScreen.navigationOptions = ({ navigation }) => ({
  headerStyle:{backgroundColor:'#6e465c'},headerTintColor:'#ffffff',headerLeft: () => (<Image source={require('../assets/images/icon.png')} style={{marginLeft:5,width:50,height:50}}/>),
  headerRight: () => (
    <View style={{flexDirection:'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('map'),gestureEnabled: true
});

export default MapScreen;