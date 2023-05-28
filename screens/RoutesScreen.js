import React, { Component } from 'react';
import {ImageBackground,StyleSheet,Image,ScrollView,View,Text,FlatList,ActivityIndicator,Dimensions,Platform,PixelRatio,TouchableOpacity} from 'react-native';
import TabBarIcon from '../components/TabBarIcon';
import * as Animatable from "react-native-animatable";
import {Card,ListItem,SearchBar} from 'react-native-elements';
import {LinearGradient} from 'expo-linear-gradient';
import MultiSelect from 'react-native-multiple-select';
import WineRoutesStore from './../mobx/WineRoutesStore';
import DialogInput from 'react-native-dialog-input';
import * as SecureStore from 'expo-secure-store';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';

const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
}

class RoutesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {loading:false,data:[],isRefreshing:false,showRecommended:false,wineries:[{name:"none"}],selectedWineries:[],isDialogVisible:false,notloggedVisible:false};
    this.arrayholder = [];
  }

  componentDidMount() {
    const data = require('../constants/recommended.json');
    this.setState({data: data,wineries:JSON.parse(WineRoutesStore.mywineries)});
    this.arrayholder = data;
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

  onSelectedWineriesChange = selectedWineries => {
    this.setState({selectedWineries:selectedWineries,});
  };

  renderSeparator = () => {return (<View style={{height:1,width: '86%',backgroundColor:'#CED0CE',marginLeft:'14%',}}/>);};

  searchFilterFunction = text => {
    this.setState({value: text,});
    const newData = this.arrayholder.filter(item => {
      const itemData = `${item.routetitle.toUpperCase()}`;
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({data: newData,});
  };

  getRoute = () => {
    if(this.state.selectedWineries<2){
      this.setState({errorVisible:true});
      setTimeout(function(){
        this.setState({errorVisible:false});
      }.bind(this),2000); 
    } else {
      if (WineRoutesStore.logged===true){
        const selectedwineries=(JSON.stringify(this.state.selectedWineries)).split(",").join("|").substring(1, (JSON.stringify(this.state.selectedWineries)).length-1);
        var myurl="https://app.wineroutes.eu/getroute?mypreference="+WineRoutesStore.routeprofile+"&myprofile="+WineRoutesStore.transporttype+"&mydistancemeasure="+WineRoutesStore.distancemeasure+
        "&mygpslat=&mygpslon=&data="+selectedwineries+"&userid=&sessionid=&routename=&mode=get";
        fetch(myurl)
          .then(res => res.json())
          .then(res => {this.props.navigation.navigate('RouteViewer',{myroute:JSON.stringify(res.route),myroutename:"Route"});})
          .catch(error => {console.log("Error11",error);});
      } else{
        this.setState({notloggedVisible:true});
        setTimeout(function(){
          this.setState({notloggedVisible:false});
        }.bind(this),2000);
      }
    }
  }

  getRecommended = (routenick) => {
    const url = "https://app.wineroutes.eu/getmyrecommended?route="+routenick;
    fetch(url)
    .then(res => res.json())
    .then(res => {
      this.props.navigation.navigate('RouteViewer', {myroute:JSON.stringify(res.route),myroutename:JSON.stringify(res.routename_en)});
    })
    .catch(error => {console.log(error)});
  }
	
	showDialog(isShow){
    if(this.state.selectedWineries<2){
      this.setState({errorVisible:true});
      setTimeout(function(){
        this.setState({errorVisible:false});
      }.bind(this),2000); 
    } else {
      if (WineRoutesStore.logged===true){
  		  this.setState({isDialogVisible: isShow});
      } else{
        this.setState({notloggedVisible:true});
        setTimeout(function(){
          this.setState({notloggedVisible:false});
        }.bind(this),2000);
      }
    }
	}
	
	inputName(name){
		const {route,navigation} = this.props;
		if (name.length>5){
			this.showDialog(false);
			this.saveRoute(name);
		} else {
			alert("Πολύ μικρό όνομα");
		}
	}
	
	saveRoute = (name) => {
    const selectedwineries=(JSON.stringify(this.state.selectedWineries)).replace(",", "|").substring(1, (JSON.stringify(this.state.selectedWineries)).length-1);
		SecureStore.getItemAsync("userid").then((userid)=>{
			SecureStore.getItemAsync("sessionid").then((sessionid)=>{
				var mysaverouteurl="https://app.wineroutes.eu/getroute?mypreference="+WineRoutesStore.routeprofile+"&myprofile="+WineRoutesStore.transporttype+"&mydistancemeasure="+WineRoutesStore.distancemeasure+
				"&mygpslat=&mygpslon=&data="+selectedwineries+"&userid="+userid+"&sessionid="+sessionid+"&routename="+name+"&mode=save";
				fetch(mysaverouteurl)
				.then(res => res.json())
				.then(res => {console.log("OK success");})
				.catch(error => {console.log(error)});
			})
		})
	}

  renderItem = ({ item }) => (<Animatable.View animation="fadeInLeft" duration={500} delay={500} useNativeDriver>
    <ListItem
      leftAvatar={{source:{uri:'https://www.wineroutes.eu/images/routesimages/'+item.routenick+'.png'},size:'large'}}
      containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}
      title={item.routetitle}
      titleStyle={{color:'white'}} subtitleStyle={{color:'#d1d1d1'}}
      subtitle={t('distance')+': '+(item.distance).toFixed(2)+' klm\n'+t('duration')+': '+this.secondsToHms(item.duration)+'\n'+t('numberwineries')+': '+item.number}
      onPress={() => this.getRecommended(item.routenick)}
  /></Animatable.View>);

  renderHeader = () => {return (<SearchBar placeholder={t('typehere')} lightTheme round onChangeText={text => this.searchFilterFunction(text)} inputStyle={{backgroundColor:'transparent'}} containerStyle={{backgroundColor:'transparent'}} autoCorrect={false} value={this.state.value}/>);};

  render() {
    if (this.state.loading) {return (<View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator /></View>);};
    const styles = StyleSheet.create({
      activebuttonTab: {backgroundColor:'#6e465c',borderRadius:5,padding:5,width:SCREEN_WIDTH/2-2},
      buttonTab: {backgroundColor:'#a38897',borderRadius:5,padding:5,width:SCREEN_WIDTH/2-2},
      buttonText: {fontSize: normalize(15),color: '#fff',textAlign:'center'},
    });
    return (
      <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex: 1,resizeMode: "cover",}}>
        <View style={{flexDirection:'row',marginTop:20}}>
          <Animatable.View animation="fadeIn"><TouchableOpacity style={this.state.showRecommended===false ? styles.activebuttonTab : styles.buttonTab } onPress={() => this.setState({showRecommended:false})}><Text style={styles.buttonText}>{t('routedesign')}</Text></TouchableOpacity></Animatable.View>
          <Animatable.View animation="fadeIn"><TouchableOpacity style={this.state.showRecommended===true ? styles.activebuttonTab : styles.buttonTab } onPress={() => this.setState({showRecommended:true})}><Text style={styles.buttonText}>{t('recommended')}</Text></TouchableOpacity></Animatable.View>
        </View>
        {this.state.showRecommended===true && <Card containerStyle={{height:SCREEN_HEIGHT/1.3,backgroundColor:'rgba(0, 0, 0, 0.5)',marginLeft:10,marginRight:10,padding:0}}>
          <FlatList
          data={this.state.data}
          renderItem={this.renderItem}
          keyExtractor={item => item.routeid}
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}
          removeClippedSubviews={true}
          initialNumToRender={7}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={100}
          windowSize={7}
          />
        </Card>}
        {this.state.showRecommended===false && <Card containerStyle={{height:SCREEN_HEIGHT/1.5,backgroundColor:'rgba(0, 0, 0, 0.5)',marginLeft:10,marginRight:10,padding:0}}>
          <ScrollView style={{ marginTop: 22 }}>
            <MultiSelect
              items={this.state.wineries} fontSize={normalize(16)} 
              uniqueKey="wineryid"
              ref={(component) => { this.multiSelect = component }}
              onSelectedItemsChange={this.onSelectedWineriesChange}
              selectedItems={this.state.selectedWineries}
              selectText={t('wineries')}
              searchInputPlaceholderText={t('search')}
              onChangeInput={ (text)=> console.log(text)}
              tagRemoveIconColor="white"
              tagBorderColor="white"
              tagTextColor="white"
              selectedItemTextColor="#6e465c"
              selectedItemIconColor="#6e465c"
              styleMainWrapper={{paddingHorizontal: 25}}
              styleTextDropdown={{color:'black'}}
              itemTextColor="#000"
              displayKey="name"
              searchInputStyle={{ color: 'black' }}
              submitButtonColor="#6e465c"
              submitButtonText={t('select')}
            />
            <TouchableOpacity style={{width: '86%',marginLeft: '7%',marginRight: '7%',}} activeOpacity = { .5 } onPress={() => this.getRoute()}>
              <Text style={{fontSize: normalize(16),textAlign: 'center', color:'white', marginTop:20, marginBottom:20, backgroundColor: '#6e465c',borderRadius: 12,borderWidth: 1,padding: 7,}}>{t('showroute')}</Text>
            </TouchableOpacity>
		        <TouchableOpacity style={{width: '86%',marginLeft: '7%',marginRight: '7%',}} activeOpacity = { .5 } onPress={() => this.showDialog(true)}>
              <Text style={{fontSize: normalize(16),textAlign: 'center', color:'white', marginTop:20, marginBottom:20, backgroundColor: '#6e465c',borderRadius: 12,borderWidth: 1,padding: 7,}}>{t('saveroute')}</Text>
            </TouchableOpacity>
      		  <DialogInput isDialogVisible={this.state.isDialogVisible}
      			title={t('routename')}
      			message={t('fillroutename')}
      			submitInput={ (inputText) => {this.inputName(inputText)}}
      			closeDialog={ () => {this.showDialog(false)}}>
      		  </DialogInput>
          </ScrollView>
        </Card>}
        <Modal
          isVisible={this.state.notloggedVisible} coverScreen={true} style={{justifyContent: 'center',margin: 0,}}
          onRequestClose={() => {this.setState({notloggedVisible:false});}}>
          <View style={{height:SCREEN_HEIGHT/3,alignItems:'center'}}>
            <LottieView source={require('../assets/images/error.json')} autoPlay duration={2000}/>
            <View><Text style={{color:'white',fontSize:normalize(20),textAlign: 'center'}}>{t('notlogged')}</Text></View>
          </View>
        </Modal>
        <Modal
          isVisible={this.state.errorVisible} coverScreen={true} style={{justifyContent: 'center',margin: 0,}}
          onRequestClose={() => {this.setState({errorVisible:false});}}>
          <View style={{height:SCREEN_HEIGHT/3,alignItems:'center'}}>
            <LottieView source={require('../assets/images/error.json')} autoPlay duration={2000}/>
            <View><Text style={{color:'white',fontSize:normalize(20),textAlign: 'center'}}>{t('errornumber')}</Text></View>
          </View>
        </Modal>
      </ImageBackground>
    );
  }
}

RoutesScreen.navigationOptions = ({ navigation }) => ({
  headerStyle:{backgroundColor:'#6e465c'},headerTintColor:'#ffffff',headerLeft: () => (<Image source={require('../assets/images/icon.png')} style={{marginLeft:5,width:50,height:50}}/>),
  headerRight: () => (
    <View style={{flexDirection:'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('routes'),gestureEnabled:true
});

export default RoutesScreen;