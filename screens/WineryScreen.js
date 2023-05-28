import React,{Component} from 'react';
import {Animated,Alert,Image,View,ScrollView,Text,FlatList,Picker,Share,TextInput,ImageBackground,ActivityIndicator,Button,RefreshControl,StyleSheet,Dimensions,Platform,PixelRatio,TouchableOpacity} from 'react-native';
import {SocialIcon,Rating} from 'react-native-elements';
import TabBarIcon from '../components/TabBarIcon';
import {TabView,TabBar,TabViewPagerScroll,TabViewPagerPan,} from 'react-native-tab-view';
import PropTypes from 'prop-types';
import * as Animatable from "react-native-animatable";
import {Card,ListItem,SearchBar,Avatar} from 'react-native-elements';
import {LinearGradient} from 'expo-linear-gradient';
import Glossary from '../constants/glossary.json';
import * as AuthSession from 'expo-auth-session';
import jwtDecode from 'jwt-decode';
import WineRoutesStore from './../mobx/WineRoutesStore';
import {observer} from 'mobx-react';
import * as SecureStore from 'expo-secure-store';
import {Entypo,MaterialCommunityIcons} from '@expo/vector-icons';
import { SliderBox } from "react-native-image-slider-box";
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import Posts from './Posts';
import LottieView from 'lottie-react-native';
import Modal from 'react-native-modal';
import * as Linking from 'expo-linking';

const {width:SCREEN_WIDTH,height:SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS==='ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
};

const styles = StyleSheet.create({
  cardContainer:{flex:1,margin:0,backgroundColor:'rgba(0,0,0,0.5)',width:'100%',},
  headerContainer:{alignItems:'center',backgroundColor:'rgba(0,0,0,0)',marginBottom:10,marginTop:5,},
  indicatorTab:{backgroundColor:'transparent',},
  sceneContainer:{marginBottom:0,backgroundColor:'#FFF',minHeight:SCREEN_HEIGHT/2},
  socialIcon:{marginLeft:14,marginRight:14,},
  socialRow:{flexDirection:'row',},
  tabBar:{backgroundColor:'#875f75',},
  tabContainer:{marginBottom:0,backgroundColor:'#FFF',height:SCREEN_HEIGHT,},
  tabLabelNumber:{color:'gray',fontSize:normalize(14),textAlign:'center',},
  tabLabelText:{color:'black',fontSize:normalize(16),fontWeight:'600',textAlign:'center',},
  userBioRow:{marginLeft:40,marginRight:40,},
  userBioText:{color:'white',fontSize:normalize(13.5),textAlign:'center',},
  userImage:{borderRadius:60,width:SCREEN_WIDTH/3.5,height:SCREEN_WIDTH/3.5,marginBottom:10,},
  userNameRow:{marginBottom:10,},
  userNameText:{color:'#FFF',fontSize:normalize(18),fontWeight:'bold',textAlign:'center',},
  userRow:{alignItems:'center',flexDirection:'column',justifyContent:'center',marginBottom:12,},
  buttonText: {fontSize: normalize(13),color: '#fff',textAlign:'center'},
  inputView:{width:"80%",backgroundColor:"#c8cac8",borderRadius:25,marginBottom:20,justifyContent:"center",padding:20},
  inputText:{color:"white"},
  pickBtn:{width:"80%",backgroundColor:"#6e465c",borderRadius:25,height:50,alignItems:"center",justifyContent:"center",marginTop:40,marginBottom:10,marginHorizontal:10},
  submitBtn:{width:"40%",backgroundColor:"#6e465c",borderRadius:25,height:50,alignItems:"center",justifyContent:"center",marginTop:40,marginBottom:10,marginHorizontal:10},
  submitText:{color:"black",fontSize:normalize(16)}
})

class WineryScreen extends Component {
  handleTextRef = ref => this.text = ref;

  constructor(props) {
    super(props);
    this.state = {loading: false,infoVisible:true,winesVisible:false,reviewVisible:false,submitreviewVisible:false,starCount:null,image:null,submittedVisible:false,notloggedVisible:false,scrollOffset: null,
      scanned:false,setScanned:false,hasPermission:null,setHasPermission:null,liked:0,myanimation:false,notconnectedVisible:false,data: {
        images:null,len_reviews:null,len_wines:null,likes:null,reviews:{reviews:[],},views:null,wines:{wines:[],},
        winery_data:{winery_data:[{address:null,email:null,episkepsimo:null,image:null,name:null,phone:null,website:null,winerydescription:null,wineryid:null,wineryrating:null}]},
      },
      images: [require('../assets/images/wineglass.png'),],
      tabs: {index:0,routes: [{key:'1',title:t('details'),count:0},{key:'2',title:t('reviewstab'),count:0},{key:'3',title:t('winestab'),count:0},],},};
  }

  handleOnScroll = event => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y,
    });
  };
  handleScrollTo = p => {
    if (this.scrollViewRef.current) {
      this.scrollViewRef.current.scrollTo(p);
    }
  };

  componentDidMount() {
    this.makeRemoteRequest();
  };

  makeRemoteRequest = () => {
    const { navigation } = this.props;
    this.setState({loading:true});
    SecureStore.getItemAsync("sessionid").then((sessionid)=>{
      const url = "https://app.wineroutes.eu/winerypage?wineryid="+navigation.getParam('wineryid', 1)+"&sessionid="+sessionid;
      fetch(url)
      .then(res => res.json())
      .then(async res => {
        this.setState({data:res,loading:false,liked:res.liked});
        if(res.images.images.length>0){
          var myimages=[];
          for (var i=0; i<res.images.images.length; i++) {
            myimages.push("https://www.wineroutes.eu/images/w"+res.winery_data.winery_data['0'].wineryid+"/"+res.images.images[i].filename);
          };
          this.setState({images:myimages});
        };
        const myurl="https://app.wineroutes.eu/addview?wineryid="+navigation.getParam('wineryid',1)+"&sessionid="+sessionid;
        fetch(myurl)
        .then(res => res.json())
        .then(res => {console.log("Success");})
        .catch(error => {console.log(error);});
        this.setState({loading:false});
        })
      .catch(error => {
        this.setState({loading:false});
      });
    }).catch((error)=>{
     console.log(error)
    })
  };

  handleIndexChange = index => {
    this.setState({tabs: {...this.state.tabs,index,},})
  }

  onStarRatingPress(rating) {
    this.setState({starCount: rating});
  }

  getPermissionAsync = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  };

  myShare = async (id) => {
    try {
      const result = await Share.share({
        message:this.state.data.winery_data.winery_data[0].name+" from @winerouteseu",
        title:this.state.data.winery_data.winery_data[0].name,
        url:"https://wineroutes.eu/wineries?wineryid="+id.toString()
      });
      if (result.action === Share.sharedAction) {
        alert("Post Shared")
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        alert("Post cancelled")
      }
    } catch (error) {
      alert(error.message);
    }
  };

   _pickImage = async () => {
    this.getPermissionAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    });
    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }
  };

  _submitReview = async () => {
    if (WineRoutesStore.isConnected===true){
      let uploadResponse, uploadResult;
      const { navigation } = this.props;
      try {
        this.setState({uploading: true});
        if (this.state.image){
          if (!this.state.image.cancelled) {
            let fileType = this.state.image.substring(this.state.image.lastIndexOf(".") + 1);
            SecureStore.getItemAsync("sessionid").then((sessionid)=>{
              let formData = new FormData();
              formData.append('title',this.state.title);
              formData.append('review',this.state.review);
              formData.append('rating',this.state.starCount); 
              formData.append('sessionid',sessionid); 
              formData.append('wineryid',navigation.getParam('wineryid', 1));
              formData.append('filetype',fileType);
              formData.append('file', {uri:this.state.image,name: `photo.${fileType}`,type: `image/${fileType}`});
              fetch('https://app.wineroutes.eu/reviewwinery',{method: "POST",body: formData,headers: {'Accept': 'application/json','content-type':'multipart/form-data'}})
              .then(res => res.json())
              .then(res => {
                this.setState({submitteddVisible:true});
                setTimeout(function(){
                  this.setState({submittedVisible:false});
                }.bind(this),2000);})
              .catch(error => {"ee",console.log(error);});
            }).catch((error)=>{
              console.log("aa",error)
            });
          }
        } else {
          SecureStore.getItemAsync("sessionid").then((sessionid)=>{
            var urlnoimage="https://app.wineroutes.eu/reviewwinery?title="+this.state.title+"&review="+this.state.review+"&rating="+this.state.starCount+"&wineryid="+navigation.getParam('wineryid',1)+"&sessionid="+sessionid+"&filetype=&file=";
            fetch(urlnoimage,{method:'POST'}).then(res => res.json())
            .then(res => {console.log(res);})
            .catch(error => {console.log(error);});
          }).catch((error)=>{
            console.log(error)
          });
        };
        this.setState({submitreviewVisible:false});
        alert("success")
      } catch (e) {
        console.log({e});
        alert('Upload failed, sorry :(');
      } finally {
        this.setState({uploading:false});
      }
    }
    else {
      this.setState({notconnectedVisible:true});
      setTimeout(function(){
        this.setState({notconnectedVisible:false});
      }.bind(this),2000);
    }
  };

  addwebsiteclick = () => {
    if (WineRoutesStore.isConnected===true){
      Linking.openURL();
      SecureStore.getItemAsync("sessionid").then((result)=>{
        const sessionid = (JSON.stringify(result)).substring(1, (JSON.stringify(result)).length-1);``
        const myurl="https://app.wineroutes.eu/addwebsiteclick?wineryid="+navigation.getParam('wineryid', 1)+"&sessionid="+sessionid;
        fetch(myurl)
      }).catch((error)=>{
       console.log(error)
      })
    } else {
      this.setState({notconnectedVisible:true});
      setTimeout(function(){
        this.setState({notconnectedVisible:false});
      }.bind(this),2000);
    }
  }

  openReview = () => {
    if (WineRoutesStore.logged===true){
      this.setState({submitreviewVisible:true});
    } else{
      this.setState({notloggedVisible:true});
      setTimeout(function(){
        this.setState({notloggedVisible:false});
      }.bind(this),2000);
    }
  }

  changeLike = () => {
    if (WineRoutesStore.isConnected===true){
      if (WineRoutesStore.logged===true){
        SecureStore.getItemAsync("sessionid").then((sessionid)=>{
          const { navigation } = this.props;
          if (this.state.liked> 0){
            const myurl="https://app.wineroutes.eu/removelikes?wineryid="+navigation.getParam('wineryid', 1)+"&sessionid="+sessionid;
            fetch(myurl,{method: "POST"})
            .then(res => res.json())
            .then(res => {
              this.refs.view.tada(800);
              this.setState({liked:0});
            })
            .catch(error => {
              console.log(error);
            });
          } else {
            const myurl="https://app.wineroutes.eu/addlikes?wineryid="+navigation.getParam('wineryid', 1)+"&sessionid="+sessionid;
            fetch(myurl,{method: "POST"})
            .then(res => res.json())
            .then(res => {
              this.setState({liked:1});
              this.refs.view.tada(800);
            })
            .catch(error => {
              console.log(error);
            });
          };
        }).catch((error)=>{
         console.log(error)
        })
      } else {
        this.setState({notloggedVisible:true});
        setTimeout(function(){
          this.setState({notloggedVisible:false});
        }.bind(this),2000);
      }
    } else {
      this.setState({notconnectedVisible:true});
      setTimeout(function(){
        this.setState({notconnectedVisible:false});
      }.bind(this),2000);
    }
    
  }

  renderTabBar = props => {
    return <TabBar
      indicatorStyle={styles.indicatorTab}
      renderLabel={this.renderLabel(props)}
      pressOpacity={0.8}
      style={styles.tabBar}
      {...props}
    />
  };

  renderLabel = props => ({route}) => {
    const routes = props.navigationState.routes;
    let labels = [];
    routes.forEach((e,index) => {
      labels.push(index === props.navigationState.index?'white':'#b6b2b4')
    });
    const currentIndex = parseInt(route.key) - 1;
    const color = labels[currentIndex];
    return (
      <View>
        <Animated.Text style={[styles.tabLabelNumber,{color}]}>{route.title}</Animated.Text>
      </View>
    )
  }

  renderScene = ({ route: { key } }) => {
    switch (key) {
      case '1':
        return (
          <View><View style={{flexDirection:'row',alignItems:'center'}}><MaterialCommunityIcons name="map-marker" size={normalize(30)} color="#6e465c"/><Text style={{marginLeft:20,fontSize:normalize(16),color:'black',width:SCREEN_WIDTH*0.8}}>{this.state.data.winery_data.winery_data[0].address}</Text></View>
          <View style={{height:1,width:'86%',backgroundColor: '#CED0CE',marginLeft: '14%',}}/>
          <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} onPress={() => this.addwebsiteclick()}><MaterialCommunityIcons name="web" size={normalize(30)} color="#6e465c"/><Text style={{marginLeft:20,fontSize:normalize(16),color:'black',width:SCREEN_WIDTH*0.8}}>{this.state.data.winery_data.winery_data[0].website}</Text></TouchableOpacity>
          <View style={{height:1,width:'86%',backgroundColor: '#CED0CE',marginLeft: '14%',}}/>
          <View style={{flexDirection:'row',alignItems:'center'}}><MaterialCommunityIcons name="email" size={normalize(30)} color="#6e465c"/><Text style={{marginLeft:20,fontSize:normalize(16),color:'black',width:SCREEN_WIDTH*0.8}}>{this.state.data.winery_data.winery_data[0].email}</Text></View>
          <View style={{height:1,width:'86%',backgroundColor: '#CED0CE',marginLeft: '14%',}}/>
          <View style={{flexDirection:'row',alignItems:'center'}}><MaterialCommunityIcons name="phone" size={normalize(30)} color="#6e465c"/><Text style={{marginLeft:20,fontSize:normalize(16),color:'black',width:SCREEN_WIDTH*0.8}}>{this.state.data.winery_data.winery_data[0].phone}</Text></View>
          <View style={{height:1,width:'86%',backgroundColor: '#CED0CE',marginLeft: '14%',}}/>
          <View style={{flexDirection:'row',alignItems:'center'}}><MaterialCommunityIcons name="clock" size={normalize(30)} color="#6e465c"/><Text style={{marginLeft:20,fontSize:normalize(16),color:'black',width:SCREEN_WIDTH*0.8}}>{this.state.data.winery_data.winery_data[0].episkepsimo}</Text></View>
          <View style={{height:1,width:'86%',backgroundColor: '#CED0CE',marginLeft: '14%',}}/>
          <Text style={{fontSize:normalize(18),textAlign:'justify',marginTop:15,color:'black'}}>{this.state.data.winery_data.winery_data[0].winerydescription}</Text></View>)
      case '2':
        if(this.state.data.len_reviews>0){
          return (
            <View>
              <View style={{flexDirection:'row',alignItems:'center',width:SCREEN_WIDTH-50}}>
                <TouchableOpacity onPress={() => this.openReview()}><MaterialCommunityIcons name="plus-circle" size={normalize(40)} color="#6e465c" /></TouchableOpacity>
                <Text style={{fontSize:normalize(16),color:'black'}}>Γράψτε την αξιολόγησή σας</Text>
              </View>
              <Posts containerStyle={styles.sceneContainer} posts={this.state.data.reviews.reviews} type="reviews" screen="winery"/>
            </View>
          )
        } else{
          return (
            <View>
              <View style={{flexDirection:'row',alignItems:'center',width:SCREEN_WIDTH-50}}>
                <TouchableOpacity onPress={() => this.openReview()}><MaterialCommunityIcons name="plus-circle" size={normalize(40)} color="#6e465c" /></TouchableOpacity>
                <Text style={{fontSize:normalize(16),color:'black'}}>Γράψτε την πρώτη αξιολόγηση</Text>
              </View>
            </View>
          )
        }
      case '3':
        if(this.state.data.len_wines>0){
          return <Posts containerStyle={styles.sceneContainer} posts={this.state.data.wines.wines} type="wines" screen="winery"/>
        } else{
          return <Text style={{fontSize:normalize(16),color:'black',textAlign:'center'}}>{t('wineslisted')}</Text>
        }
      default:
        return <View />
    }
  }

  render() {
    const {navigation} = this.props;
    let { image } = this.state;
    if (this.state.loading) {return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>);};
    return (
      <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex:1,alignItems:'center',justifyContent:'center',resizeMode:"cover",}}>
        <View style={styles.cardContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.userRow}>
              <View style={{flexDirection:'row',alignItems:'center',width:SCREEN_WIDTH,justifyContent:'space-between'}}>
                <Text style={{fontSize:normalize(24),flex:1,flexWrap:'wrap',color:'white'}}>{this.state.data.winery_data.winery_data[0].name}</Text>
                <TouchableOpacity onPress={() => this.changeLike()}>
                  <Animatable.View ref="view" style={{textAlign:'center'}}>
                    <MaterialCommunityIcons name="heart" size={normalize(24)} color={this.state.liked> 0 ? 'red': 'grey'}/>
                  </Animatable.View>
                </TouchableOpacity>
                <Text>    </Text>
                <TouchableOpacity onPress={() => this.myShare(navigation.getParam('wineryid', 1))}><MaterialCommunityIcons name="share-variant" size={normalize(24)} color="white"/></TouchableOpacity>
              </View>
              <View style={{flexDirection:'row',alignItems:'center',width:SCREEN_WIDTH,justifyContent:'space-between'}}><SliderBox images={this.state.images} parentWidth={SCREEN_WIDTH} resizeMethod={'resize'} resizeMode={'contain'}/></View>
              <View style={{flexDirection:'row',alignItems:'center',width:SCREEN_WIDTH,justifyContent:'space-around',marginLeft:10,marginRight:10}}>
                <View style={{flexDirection:'row',paddingHorizontal:5,borderRadius:40,backgroundColor:'#6e465c'}}><MaterialCommunityIcons name="trophy" size={normalize(20)} color={"white"}/><Text style={{fontSize:normalize(15),color:'white'}}> {this.state.data.winery_data.winery_data[0].wineryrating}/5</Text></View>
                <View style={{flexDirection:'row',paddingHorizontal:5,borderRadius:40,backgroundColor:'#6e465c'}}><MaterialCommunityIcons name="heart" size={normalize(20)} color={"white"}/><Text style={{fontSize:normalize(15),color:'white'}}> {this.state.data.likes}</Text></View>
                <View style={{flexDirection:'row',paddingHorizontal:5,borderRadius:40,backgroundColor:'#6e465c'}}><MaterialCommunityIcons name="eye" size={normalize(20)} color={"white"}/><Text style={{fontSize:normalize(15),color:'white'}}> {this.state.data.views}</Text></View>
                <SocialIcon iconSize={normalize(20)} iconType='fontawesome' type='facebook' onPress={() => Linking.openURL(this.state.data.facebook)}/>
                <SocialIcon iconSize={normalize(20)} iconType='fontawesome' type='twitter' onPress={() => Linking.openURL(this.state.data.twitter)}/>
              </View>
            </View>
            <View style={styles.socialRow}>            
            </View>
          </View>
          <TabView
            style={styles.tabContainer}
            navigationState={this.state.tabs}
            renderScene={this.renderScene}
            renderTabBar={this.renderTabBar}
            onIndexChange={this.handleIndexChange}
          />
          <Modal
            coverScreen={false} style={{justifyContent: 'center',margin: 0,}} propagateSwipe={true} scrollTo={this.handleScrollTo} scrollOffset={this.state.scrollOffset} 
            scrollOffsetMax={400 - 300} isVisible={this.state.submitreviewVisible}
            onRequestClose={() => {this.setState({ submitreviewVisible: false });}}>
            <View style={{ marginTop: 22,alignItems:'center' }}>
              <ScrollView
                ref={this.scrollViewRef}
                onScroll={this.handleOnScroll}
                scrollEventThrottle={16} contentContainerStyle={{alignItems:'center' }}>
                <View style={{display:'flex',alignItems: 'center',flexDirection: 'column',justifyContent: 'space-between',paddingHorizontal: 25,flex:1,}}>
                  <Text style={{flex: 1,fontSize:normalize(18),color:'white'}}>{t('text')}</Text>
                  <View style={{width:"100%",backgroundColor:"#c8cac8",borderRadius:25,marginBottom:20,display: 'flex',alignItems: 'center',flexDirection: 'row',}}>
                    <Picker style={{width:"90%",fontSize:normalize(18),}} selectedValue={this.state.starCount} mode='dialog' onValueChange={(itemValue, itemIndex) => this.onStarRatingPress(itemValue)}>
                      <Picker.Item label="5" value="5" />
                      <Picker.Item label="4" value="4" />
                      <Picker.Item label="3" value="3" />
                      <Picker.Item label="2" value="2" />
                      <Picker.Item label="1" value="1" />
                    </Picker>
                  </View>
                </View>
                <View style={styles.inputView} >
                  <TextInput  
                    style={styles.inputText}
                    placeholder={t('title')} 
                    placeholderTextColor="#003f5c"
                    maxLength={100}
                    onChangeText={text => this.setState({title:text})}/>
                </View>
                <View style={styles.inputView} >
                  <TextInput  
                    style={styles.inputText}
                    placeholder={t('text')}
                    multiline={true}
                    numberOfLines={5}
                    placeholderTextColor="#003f5c"
                    maxLength={1000}
                    onChangeText={text => this.setState({review:text})}/>
                </View>
                <View style={{alignItems:'center',justifyContent:'center',width:'100%'}}>
                  {this.state.image && <Image source={{uri:this.state.image}} style={{width:SCREEN_WIDTH/2,height:SCREEN_WIDTH/2}} />}
                  <TouchableOpacity style={styles.pickBtn} onPress={() => this._pickImage()}>
                    <Text style={{fontSize: normalize(14),color: '#fff',textAlign:'center'}}>{t('pickimage')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                  <TouchableOpacity style={styles.submitBtn} onPress={() => this._submitReview()}>
                    <Text style={{fontSize: normalize(14),color: '#fff',textAlign:'center'}}>{t('submit')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.submitBtn} onPress={() => this.setState({ submitreviewVisible: false })}>
                    <Text style={{fontSize: normalize(14),color: '#fff',textAlign:'center'}}>{t('cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal>
          <Modal
            isVisible={this.state.submittedVisible} coverScreen={true} style={{justifyContent: 'center',margin: 0,}}
            onRequestClose={() => {this.setState({submittedVisible:false});}}>
            <View style={{height:SCREEN_HEIGHT/3,alignItems:'center'}}>
              <LottieView source={require('../assets/images/submit.json')} autoPlay duration={2000}/>
              <View><Text style={{color:'white',fontSize:normalize(20),textAlign: 'center'}}>{t('notlogged')}</Text></View>
            </View>
          </Modal>
          <Modal
            isVisible={this.state.notloggedVisible} coverScreen={true} style={{justifyContent: 'center',margin: 0,}}
            onRequestClose={() => {this.setState({notloggedVisible:false});}}>
            <View style={{height:SCREEN_HEIGHT/3,alignItems:'center'}}>
              <LottieView source={require('../assets/images/error.json')} autoPlay duration={2000}/>
              <View><Text style={{color:'white',fontSize:normalize(20),textAlign: 'center'}}>{t('notlogged')}</Text></View>
            </View>
          </Modal>
          <Modal
            isVisible={this.state.notconnectedVisible} coverScreen={true} style={{justifyContent: 'center',margin: 0,}}
            onRequestClose={() => {this.setState({notconnectedVisible:false});}}>
            <View style={{height:SCREEN_HEIGHT/3,alignItems:'center'}}>
              <LottieView source={require('../assets/images/error.json')} autoPlay duration={2000}/>
              <View><Text style={{color:'white',fontSize:normalize(20),textAlign: 'center'}}>{t('notlogged')}</Text></View>
            </View>
          </Modal>
        </View>
      </ImageBackground>
    )
  }
}

function toQueryString(params) {
  return '?' + Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

WineryScreen.navigationOptions = ({ navigation }) => ({
  headerStyle: {backgroundColor: '#6e465c'},headerTintColor: '#ffffff',
  headerRight: () => (
    <View style={{flexDirection: 'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('winery'),gestureEnabled:true
});

export default WineryScreen