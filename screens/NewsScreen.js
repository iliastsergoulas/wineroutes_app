import React, {Component} from 'react';
import {Image,View,Text,FlatList,ActivityIndicator,Linking,ScrollView,ImageBackground,TouchableOpacity,Dimensions,Platform,PixelRatio} from 'react-native';
import {Card,SearchBar} from 'react-native-elements';
import TabBarIcon from '../components/TabBarIcon';
import * as Animatable from "react-native-animatable";
import {observer} from 'mobx-react';
import * as rssParser from 'react-native-rss-parser';

const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
    const newSize = size * scale;
    if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
    else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
}

@observer
class NewsScreen extends Component {
  	constructor(props) {
	    super(props);
	    this.state = {loading:false,news:[],filterednews:[],isRefreshing: false,};
  	}

  	getNewsData = () => {
		const url = "https://app.wineroutes.eu/getwinenews";
		fetch(url)
		.then(res => res.json())
		.then(res => {
		  this.setState({news:res,filterednews:res});
		})
		.catch(error => {
		  console.log(error);
		});
	};

  	static navigationOptions = ({ screenProps: { t } }) => ({});

  	componentDidMount() {
  		this.getNewsData();
  	};

  	renderSeparator = () => {return (<View style={{height: 1,width: '86%',backgroundColor: '#CED0CE',marginLeft: '14%',}}/>);};

  	searchFilterFunction = text => {
	    this.setState({value: text,});
	    const newData = this.state.news.filter(item => {
	      	const itemData = `${item.title.toUpperCase()} ${item.description.toUpperCase()}`;
	      	const textData = text.toUpperCase();
	      	return itemData.indexOf(textData) > -1;
	    });
	    this.setState({filterednews:newData,});
	};

  	renderItem = ({item}) => (<View style={{flex:1,flexDirection:'column',}}>
      	<TouchableOpacity style={{justifyContent:'center'}} onPress={() => Linking.openURL(item.url)}>
        	<Card
		        title={item.title}
		        titleStyle={{fontSize:normalize(12),color:'white'}}
		        titleNumberOfLines={3}
		        image={{uri:item.urltoimage}}
		        containerStyle={{padding:0,elevation:0,borderWidth:0,backgroundColor:'transparent'}}
		    ></Card>
		    <Text style={{textAlign:'center',fontSize:normalize(12),color:'white'}}>{item.author}</Text>
		</TouchableOpacity>
	</View>);

  	renderHeader = () => {return (<SearchBar placeholder={t('typehere')} lightTheme round onChangeText={text => this.searchFilterFunction(text)} inputStyle={{backgroundColor:'transparent'}} containerStyle={{backgroundColor:'transparent'}} autoCorrect={false} value={this.state.value}/>);};

  	render() {
  		let { t, locale } = this.props.screenProps;
	    const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
		const scale = SCREEN_WIDTH / 320;
		function normalize(size) {
		  	const newSize = size * scale 
		  	if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
		  	else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
		}
	    return (
	    	<ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex: 1,resizeMode: "cover",}}>
	    		<Card containerStyle={{height:SCREEN_HEIGHT/1.3,backgroundColor:'rgba(0, 0, 0, 0.5)',marginLeft:10,marginRight:10,padding:0}}>
		      		<Animatable.View animation="fadeInLeft" duration={500} delay={500} useNativeDriver>
				        <FlatList
				          	data={this.state.filterednews}
				          	renderItem={this.renderItem}
				          	numColumns={2}
				          	keyExtractor={item => item.url}
				          	ListHeaderComponent={this.renderHeader}
				          	removeClippedSubviews={true} // Unmount components when outside of window 
					    	initialNumToRender={4} // Reduce initial render amount
					    	maxToRenderPerBatch={2} // Reduce number in each render batch
					    	updateCellsBatchingPeriod={100} // Increase time between renders
					    	windowSize={4} // Reduce the window size
				        />
				    </Animatable.View>
				   </Card>
			</ImageBackground>
	    );
  	}
}

NewsScreen.navigationOptions = ({ navigation }) => ({
  headerStyle: {backgroundColor: '#6e465c'},headerTintColor: '#ffffff',
  headerRight: () => (
    <View style={{flexDirection: 'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('news'),gestureEnabled:true
});

export default NewsScreen;
