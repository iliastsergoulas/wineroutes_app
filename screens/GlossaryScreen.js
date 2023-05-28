import React, { Component } from 'react';
import {ImageBackground,Image,View,Text,ActivityIndicator,Dimensions,Platform,PixelRatio,AsyncStorage,FlatList,Button,RefreshControl,TouchableOpacity} from 'react-native';
import TabBarIcon from '../components/TabBarIcon';
import * as Animatable from "react-native-animatable";
import {Card,ListItem,SearchBar} from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import Glossary from '../constants/glossary.json';

const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
}

class GlossaryScreen extends Component {
    constructor(props) {
      super(props);
      this.state = {loading: false,data: Glossary,error: null};
    }

    renderSeparator = () => {return (<View style={{height: 1,width: '100%',backgroundColor: '#CED0CE',}}/>);};

    searchFilterFunction = text => {
      this.setState({value: text,});
      const newData = Glossary.filter(item => {
          const itemData = `${item.term.toUpperCase()} ${item.meaning.toUpperCase()}`;
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
      });
      this.setState({data: newData,});
    };

    renderItem = ({ item }) => (<Animatable.View animation="fadeInLeft" duration={500} delay={500} useNativeDriver><ListItem title={item.term} subtitle={item.meaning} titleStyle={{color:'white'}} rightTitleStyle={{color:'white',fontSize:normalize(14)}} subtitleStyle={{color:'#d1d1d1'}} containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}/></Animatable.View>);

    renderHeader = () => {return (<SearchBar placeholder={t('typehere')} lightTheme round onChangeText={text => this.searchFilterFunction(text)} inputStyle={{backgroundColor:'transparent'}} containerStyle={{backgroundColor:'transparent'}} autoCorrect={false} value={this.state.value}/>);};

    render() {
      if (this.state.loading) {return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>);};
      return (
        <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex: 1,resizeMode: "cover",}}>
          <Card containerStyle={{height:SCREEN_HEIGHT/1.3,backgroundColor:'rgba(0, 0, 0, 0.5)',marginLeft:10,marginRight:10,padding:0}}>
           <FlatList
            data={this.state.data}
            renderItem={this.renderItem}
            keyExtractor={item => item.term}
            ItemSeparatorComponent={this.renderSeparator}
            ListHeaderComponent={this.renderHeader}
            removeClippedSubviews={true} // Unmount components when outside of window 
            initialNumToRender={10} // Reduce initial render amount
            maxToRenderPerBatch={2} // Reduce number in each render batch
            updateCellsBatchingPeriod={100} // Increase time between renders
            windowSize={10} // Reduce the window size
            extraData={this.state.isRefreshing}
            />
          </Card>
        </ImageBackground>
      );
    }
}

GlossaryScreen.navigationOptions = ({navigation}) => ({
  headerStyle:{backgroundColor:'#6e465c'},headerTintColor:'#ffffff',
  headerRight: () => (
    <View style={{flexDirection:'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('glossary'),gestureEnabled:true,
});

export default GlossaryScreen;