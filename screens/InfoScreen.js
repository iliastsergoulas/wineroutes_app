import React, {Component} from 'react';
import {ImageBackground,Text,FlatList,Modal,View,StyleSheet,Image,Linking,TouchableOpacity,Dimensions,Platform,PixelRatio} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Card,ListItem} from 'react-native-elements';
import * as StoreReview from 'expo-store-review';
import * as Animatable from "react-native-animatable";

const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
}

class Info extends Component {
  constructor(props) {super(props);this.state = {data: [],error: null,otherappsVisible:false};}

  handleReview = () => {if (StoreReview.isAvailableAsync()) {StoreReview.requestReview();}};

  static navigationOptions = ({ screenProps: { t } }) => ({});

  renderItem = ({ item }) => (
    <Animatable.View animation="fadeInLeft" duration={500} delay={500} useNativeDriver>
      <ListItem
        leftIcon={{name:item.icon,type:'font-awesome',color:'white'}}
        containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}
        title={item.title} titleStyle={{fontSize:normalize(18),color:'white'}} 
        onPress={() => Linking.openURL(item.url)}
        chevron={{ color:'white',size:normalize(24) }}
      />
    </Animatable.View>
  );

  render() {
    let { t, locale } = this.props.screenProps;
    const mysites = [
      {title: ' Website',icon:'globe', url: "https://wineroutes.eu"},
      {title: ' E-mail',icon:'envelope-o', url: "http://wineroutes.eu"},
      {title: ' Twitter',icon:'twitter', url: "https://twitter.com/winerouteseu"},
      {title: ' Facebook page',icon:'facebook', url: "https://www.facebook.com/winerouteseu/"},
      {title: ' Pinterest boards',icon:'pinterest', url: "https://gr.pinterest.com/agristatseu/wine-routes/"},
      {title: ' Tumblr blog',icon:'tumblr', url: "https://winerouteseu.tumblr.com/"},
      {title: t('privacy'),icon:'file-o', url: "http://agristats.eu/data/privacypolicy.pdf"},
    ];
    return (
      <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex: 1,resizeMode: "cover",}}>
        <View>
          <Animatable.View animation="flipInX" duration={100} delay={100} useNativeDriver style={{flexDirection:'row'}}>
            <TouchableOpacity style={{width: '46%',marginLeft: '2%',marginRight: '2%',}} activeOpacity = { .5 } onPress={this.handleReview}>
              <Text style={{fontSize: normalize(16),textAlign: 'center', color:'white', marginTop:20, marginBottom:20, backgroundColor: '#6e465c',borderRadius: 2,borderWidth: 1,padding: 7,}}>{t('rateapp')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{width: '46%',marginLeft: '2%',marginRight: '2%',}} activeOpacity = { .5 } onPress={() => this.setState({ otherappsVisible: true })}>
              <Text style={{fontSize: normalize(16),textAlign: 'center', color:'white', marginTop:20, marginBottom:20, backgroundColor: '#6e465c',borderRadius: 2,borderWidth: 1,padding: 7,}}>{t('otherapps')}</Text>
            </TouchableOpacity>
          </Animatable.View>
          <Card containerStyle={{height:SCREEN_HEIGHT/1.5,backgroundColor:'rgba(0, 0, 0, 0.5)',marginLeft:10,marginRight:10,padding:0}}>
            <FlatList
              data={mysites}
              renderItem={this.renderItem}
              keyExtractor={item => item.title}
              ItemSeparatorComponent={this.renderSeparator}
              removeClippedSubviews={true}
              initialNumToRender={7}
              maxToRenderPerBatch={7}
              updateCellsBatchingPeriod={100}
              windowSize={7}
            />
          </Card>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.otherappsVisible}
            onRequestClose={() => {
              alert('Modal has been closed.');
            }}>
            <View style={{ marginTop: 22 }}>
              <View>
                <TouchableOpacity style={{flexDirection:'row',width:SCREEN_WIDTH,marginBottom:20}} onPress={() => Linking.openURL("https://play.google.com/store/apps/details?id=com.phonegap.wineroutes")}>
                  <Image source={require('../assets/images/agristats.png')} style={{marginLeft:5,width:100,height:100}}/>
                  <View><Text style={{fontSize:normalize(16),fontWeight:'bold'}}>Wine Routes</Text><Text style={{fontSize:normalize(14),flexShrink:1,width:SCREEN_WIDTH-120}}>AgriStats</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={{flexDirection:'row',width:SCREEN_WIDTH,marginBottom:20}} onPress={() => Linking.openURL("https://play.google.com/store/apps/details?id=com.agristats.greekgeography")}>
                  <Image source={require('../assets/images/greekgeography.png')} style={{ marginLeft:5, width: 100, height: 100 }}/>
                  <View><Text style={{fontSize:normalize(16),fontWeight:'bold'}}>Κουίζ Γεωγραφίας</Text><Text style={{fontSize:normalize(14),flexShrink:1,width:SCREEN_WIDTH-120}}>Ένα πλήρες παιχνίδι γεωγραφίας για μικρούς και μεγάλους</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={{width: '86%',marginLeft: '7%',marginRight: '7%',}} activeOpacity = { .5 } onPress={() => this.setState({otherappsVisible:false})}>
                  <Text style={{fontSize:normalize(16),textAlign:'center',color:'white',marginTop:20,marginBottom:20,backgroundColor:'#6e465c',borderRadius:2,borderWidth:1,padding:7,}}>{t('close')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {flex: 1,justifyContent: "center",alignItems: "center",marginTop: 22},
  modalText: {marginBottom: 15,textAlign:'justify'}
});

Info.navigationOptions = ({ navigation }) => ({
  headerStyle: {backgroundColor: '#6e465c'},headerTintColor: '#ffffff',headerTintColor: '#ffffff',gestureEnabled: true,
  headerTitleStyle: { fontSize:25, textAlign: 'left', alignSelf: 'center', color:'white', },title: t('about'),
});

export default Info