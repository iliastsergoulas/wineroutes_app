import React, { Component } from 'react';
import {Dimensions,View,Image,Text,ImageBackground,FlatList,ActivityIndicator,TouchableOpacity,PixelRatio,Linking,Platform} from 'react-native';
import {Card,ListItem,SearchBar} from 'react-native-elements';
import TabBarIcon from '../components/TabBarIcon';
import * as Animatable from "react-native-animatable";
import Collapsible from 'react-native-collapsible';
import Slider from '@react-native-community/slider';

const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
};

class ListingsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {loading:false,error:null,data:null,filtereddata:null,fromValue:0,toValue:1000,isCollapsed:true};
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
	
	componentDidMount() {
    const url = "https://app.wineroutes.eu/getlistings";
    fetch(url)
    .then(res => res.json())
    .then(res => {
      this.setState({data:this.shuffle(res),filtereddata:res});
    })
    .catch(error => {
      console.log(error);
    });
  }

  currencyFormat(num) {
    num=(num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')).toString();
    num = num.replace(/[,.]/g, m => (m === ',' ? '.' : ','))
    return num
  }

	renderSeparator = () => {return (<View style={{height: 1,width: '86%',backgroundColor: '#CED0CE',marginLeft: '14%',}}/>);};

  renderItem = ({ item }) => {return (<Animatable.View animation="fadeInLeft" duration={500} delay={500} useNativeDriver>
    <ListItem
      leftAvatar={{source:{uri:item.image},size:'large',}}
      containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}
      title={item.title}
      titleStyle={{color:'white'}}
      subtitle={`${this.currencyFormat(Number(item.price))} ${item.currency}`+'\n'+item.category}
      subtitleStyle={{color:'white'}}
      onPress={() => Linking.openURL(item.url)}
      chevron={{color:'white',size:26}}
    /></Animatable.View>)};
	
	searchFilterFunction = text => {
    this.setState({value: text,});
    const newData = this.state.data.filter(item => {
      const itemData = `${item.title.toUpperCase()}}`;
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({filtereddata:this.shuffle(newData)});
	};

  sliderChange(value,type){
    if (this.state.filtereddata!==null){
      if (type==="from"){
        this.setState({fromValue:value});
        const newData = this.state.data.filter(item => {
          return (Number(item.price)>value && Number(item.price)<this.state.toValue);
        });
        this.setState({filtereddata: newData,});
      } else{
        this.setState({toValue:value});
        const newData = this.state.data.filter(item => {
          return (Number(item.price)>this.state.fromValue && Number(item.price)<value);
        });
        this.setState({filtereddata: newData,});
      }
    }
  }

  renderHeader = () => {return (
    <View>
      <TouchableOpacity style={{width:'86%',marginLeft:'7%',marginRight:'7%',}} activeOpacity = { .5 } onPress={() => this.setState({isCollapsed:!this.state.isCollapsed})}>
        <Text style={{fontSize:normalize(16),textAlign:'center',color:'white',marginTop:10,marginBottom:10,backgroundColor:'#6e465c',borderRadius:12,borderWidth:1,padding:7,}}>{t('filters')}</Text>
      </TouchableOpacity>
      <Collapsible collapsed={this.state.isCollapsed}>
        <SearchBar placeholder={t('typehere')} lightTheme round onChangeText={text => this.searchFilterFunction(text)} inputStyle={{backgroundColor:'transparent'}} containerStyle={{backgroundColor:'transparent'}} autoCorrect={false} value={this.state.value}/>
        <View style={{width:'100%',alignItems:'center',justifyContent:'center'}}>
          <Text style={{flex:1,justifyContent:'flex-start',fontSize:normalize(16),color:'white'}}>{t('from')}: {this.state.fromValue}</Text>
          <Slider style={{width:'90%', height: 40}} step={50} value={0} minimumValue={0} maximumValue={1000} minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#000000" onSlidingComplete={value => this.sliderChange(value,"from")}/>
          <Text style={{flex:1,justifyContent:'flex-start',fontSize:normalize(16),color:'white'}}>{t('to')}: {this.state.toValue}</Text>
          <Slider style={{width:'90%', height: 40}} step={50} value={1000} minimumValue={0} maximumValue={1000} minimumTrackTintColor="#FFFFFF" maximumTrackTintColor="#000000" onSlidingComplete={value => this.sliderChange(value,"to")}/>
        </View>
      </Collapsible>
    </View>
  )};

	render() {
    if (this.state.loading) {return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>);};
    return (
    	<ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex: 1,resizeMode: "cover",}}>
        <Card containerStyle={{height:SCREEN_HEIGHT/1.3,backgroundColor:'rgba(0, 0, 0, 0.5)',marginLeft:10,marginRight:10,padding:0}}>
          <FlatList
          	data={this.state.filtereddata}
          	renderItem={this.renderItem}
          	keyExtractor={item => item.index}
          	ItemSeparatorComponent={this.renderSeparator}
            ListHeaderComponent={this.renderHeader}
          	removeClippedSubviews={true} // Unmount components when outside of window 
  		    	initialNumToRender={7} // Reduce initial render amount
  		    	maxToRenderPerBatch={7} // Reduce number in each render batch
  		    	updateCellsBatchingPeriod={100} // Increase time between renders
  		    	windowSize={7} // Reduce the window size
          />
      	</Card>
      </ImageBackground>
    );
	}
}

ListingsScreen.navigationOptions = ({ navigation }) => ({
  headerStyle:{backgroundColor:'#6e465c'},headerTintColor:'#ffffff',
  headerRight: () => (
    <View style={{flexDirection:'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('shop'),gestureEnabled:true
});

export default ListingsScreen;