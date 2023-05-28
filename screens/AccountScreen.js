import React,{Component} from 'react';
import {Animated,Alert,Image,View,Modal,ScrollView,Text,TextInput,ImageBackground,ActivityIndicator,AsyncStorage,Button,RefreshControl,StyleSheet,Dimensions,Platform,PixelRatio,TouchableOpacity} from 'react-native';
import {SocialIcon} from 'react-native-elements';
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
import {Entypo} from '@expo/vector-icons';
import Posts from './Posts';
import LottieView from 'lottie-react-native';
import * as Linking from 'expo-linking';

const auth0ClientId = 'nzpN7E5zvklS4XEq6kY2B2i0iPxOG7nJ';
const auth0Domain = 'https://wineroutes.eu.auth0.com';

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
  tabLabelNumber:{color:'gray',fontSize:normalize(11),textAlign:'center',},
  tabLabelText:{color:'black',fontSize:normalize(17),fontWeight:'600',textAlign:'center',},
  userBioRow:{marginLeft:40,marginRight:40,},
  userBioText:{color:'white',fontSize:normalize(12),textAlign:'center',},
  userImage:{borderRadius:60,width:SCREEN_WIDTH/3.5,height:SCREEN_WIDTH/3.5,marginBottom:10,},
  userNameRow:{marginBottom:10,},
  userNameText:{color:'#FFF',fontSize:normalize(18),fontWeight:'bold',textAlign:'center',},
  userRow:{alignItems:'center',flexDirection:'column',justifyContent:'center',marginBottom:12,},
})

class AccountScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {loading:false,account:false,updatedVisible:false,liked: false,
      data:{username:null,shortdescription:null,twitter:null,facebook:null,avatar:null,routes:{routes:[]},
        len_reviews:0,len_routes:0,len_likes:0,len_followers:0,reviews:{reviews:[]},likes:{likes:[]},followers:{followers:[]}},
      IsUser:false,followColor:'transparent',
      tabs: {index:0,routes: [{key:'1',title:'reviews',count:0},{key:'2',title:'likes',count:0},{key:'3',title:'routes',count:0},{key:'4',title:'followers',count:0},],},
      username:WineRoutesStore.myusername,shortdescription:WineRoutesStore.shortdescription,twitter:WineRoutesStore.twitter,facebook:WineRoutesStore.facebook,avatar:WineRoutesStore.avatar};
  }

  componentDidMount() {
    const {navigation} = this.props;
    if (navigation.getParam('userid',null)!=null){
      this.getUserData(navigation.getParam('userid',null));
    } else if (WineRoutesStore.logged===true){
      SecureStore.getItemAsync("userid").then((result)=>{
        const {navigation} = this.props;
        if (result==navigation.getParam('userid',null) || navigation.getParam('userid',null)==null){
          this.setState({IsUser:true});
        }
        this.getUserData(result);
      }).catch((error)=>{console.log(error)});
    } else{
      this.setState({account:true});
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

  getUserData(userid){
    const url = "https://app.wineroutes.eu/getuser?userid="+userid;
    this.setState({loading: true});
    fetch(url)
    .then(res => res.json())
    .then(res => {
      this.setState({
        data:res,
        loading:false,
        tabs:{index:0,routes:[{key:'1',title:t('reviews'),count:res.len_reviews},{key:'2',title:t('likes'),count:res.len_likes},{key:'3',title:t('routestab'),count:res.len_routes},{key:'4',title:t('followers'),count:res.len_followers},],},
      });
    })
    .catch(error => {
      this.setState({loading: false});
    });
  }

  socialLogin = async () => {
    const redirectUrl = AuthSession.getRedirectUrl();
    const queryParams = toQueryString({
      client_id: auth0ClientId,
      redirect_uri: redirectUrl,
      response_type: 'id_token',
      scope: 'openid profile email',
      nonce: 'nonce',
    });
    const authUrl = `${auth0Domain}/authorize` + queryParams;
    const response = await AuthSession.startAsync({ authUrl });
    if (response.type === 'success') {
      this.handleResponse(response.params);
    }
  };

  socialLogout = async () => {
      const redirectUrl = AuthSession.getRedirectUrl();
      const queryParams = toQueryString({
        client_id: auth0ClientId,
        returnTo: AuthSession.getRedirectUrl()
      });
      const authUrl = `${auth0Domain}/v2/logout` + queryParams;
      const response = await AuthSession.startAsync({ authUrl });
      if (response.type === 'success') {
        WineRoutesStore.logout();
        console.log("Logging out..");
        this.setState({username:null,shortdescription:null,twitter:null,facebook:null,avatar:null});
      }
  };

  deleteUser = async () => {
    alert('Are you sure you want to delete your account?');
    SecureStore.getItemAsync("userid").then((userid)=>{
      const url = "https://app.wineroutes.eu/deleteUser?userid="+userid;
      fetch(url).then(res => res.json())
      .then(res => {
        this.socialLogout();
      }).catch(error => {console.log(error);});
    });
  }

  updateUser = () => {
    SecureStore.getItemAsync("userid").then((userid)=>{
      SecureStore.getItemAsync("sessionid").then((sessionid)=>{
        const url = "https://app.wineroutes.eu/updateUser?userid="+userid+"&username="+this.state.username+"&shortdescription="+this.state.shortdescription+"&twitter="+this.state.twitter+"&facebook="+this.state.facebook+"&avatar="+this.state.avatar+"&sessionid="+sessionid;
        fetch(url).then(res => res.json())
        .then(res => {
          this.setState({updatedVisible:true});
          setTimeout(function(){
            this.setState({updatedVisible:false});
          }.bind(this),2000); 
        })
      .catch(error => {console.log(error);});})
    .catch(error => {console.log(error);});
    });
  }

  askLogin = () => {
    Alert.alert(
      t('disclaimertitle'),t('disclaimertext'),[{text: 'ΑΚΥΡΟ',style: 'cancel',},{text: 'OK', onPress: () => this.socialLogin()},],{cancelable: false}
    );
  }

  askDelete = () => {
    Alert.alert(
      t('disclaimertitle'),t('disclaimertext'),[{text: 'ΑΚΥΡΟ',style: 'cancel',},{text: 'OK', onPress: () => this.deleteUser()},],{cancelable: false}
    );
  }

  handleResponse = (response) => {
    if (response.error) {
      alert('Authentication error', response.error_description || 'something went wrong');
      return;
    }
    const jwtToken = response.id_token;
    const decoded = jwtDecode(jwtToken);
    const {name,picture,email,sub} = decoded;
    WineRoutesStore.getSocialDetails(sub,name,email,picture);
    const url = "https://app.wineroutes.eu/createUser?userid="+sub+"&username="+name+"&expoid="+WineRoutesStore.expoid+"&email="+email+"&avatar="+picture;
    fetch(url).then(res => res.json())
    .then(res => {
      SecureStore.setItemAsync("sessionid",res.sessionid).then((result)=>{
        WineRoutesStore.storeLogin(name,res.shortdescription,res.twitter,res.facebook,res.avatar);
        this.getUserData(sub);
        this.setState({username:name,shortdescription:res.shortdescription,twitter:res.twitter,facebook:res.facebook,avatar:res.avatar,account:false});
      }).catch((error)=>{
        console.log(error)
      });
    }).catch(error => {console.log(error);});
  }

  changeToUser = () => {
    if (this.state.account===true){
      SecureStore.getItemAsync("userid").then((result)=>{
        const {navigation} = this.props;
        if (result==navigation.getParam('userid',null) || navigation.getParam('userid',null)==null){
          this.setState({IsUser:true});
        }
        this.getUserData(result);
      }).catch((error)=>{console.log(error)});
    };
    this.setState({account:!this.state.account});
  }

  followUser = () => {
    if (WineRoutesStore.logged===true){
      SecureStore.getItemAsync("userid").then((result)=>{
        const {navigation} = this.props;
        if (result==navigation.getParam('userid',null) || navigation.getParam('userid',null)==null){this.setState({IsUser:true});}
        this.setState({followColor:'#6e465c'});
      }).catch((error)=>{console.log(error)});
      this.setState({account:!this.state.account});
    } else{
      alert("Not logged");
    }
  }

  handleIndexChange = index => {
    this.setState({tabs: {...this.state.tabs,index,},})
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
        <Animated.Text style={[styles.tabLabelText,{color}]}>{route.count}</Animated.Text>
        <Animated.Text style={[styles.tabLabelNumber,{color}]}>{route.title}</Animated.Text>
      </View>
    )
  }

  renderScene = ({ route: { key } }) => {
    switch (key) {
      case '1':
        if(this.state.data.len_reviews>0 && this.state.data.reviews.reviews){
          return <Posts containerStyle={styles.sceneContainer} posts={this.state.data.reviews.reviews} navigation={this.props.navigation} type="reviews" screen="user"/>
        } else{
          return <Text style={{fontSize:normalize(16),color:'black',textAlign:'center'}}>No reviews</Text>
        }
      case '2':
        if(this.state.data.len_likes>0){
          return <Posts containerStyle={styles.sceneContainer} posts={this.state.data.likes.likes} navigation={this.props.navigation} type="wineries" screen="user"/>
        } else{
          return <Text style={{fontSize:normalize(16),color:'black',textAlign:'center'}}>No likes</Text>
        }
      case '3':
        if(this.state.data.len_routes>0){
          return <Posts containerStyle={styles.sceneContainer} posts={this.state.data.routes.routes} navigation={this.props.navigation} type="routes" screen="user"/>
        } else{
          return <Text style={{fontSize:normalize(16),color:'black',textAlign:'center'}}>No routes</Text>
        }
      case '4':
        if(this.state.data.len_followers>0){
          return <Posts containerStyle={styles.sceneContainer} posts={this.state.data.followers.followers} navigation={this.props.navigation} type="users" screen="user"/>
        } else{
          return <Text style={{fontSize:normalize(16),color:'black',textAlign:'center'}}>No followers</Text>
        }
      default:
        return <View />
    }
  }

  render() {
    const {navigation} = this.props;
    const editstyles = StyleSheet.create({
      loginBtn:{width:"80%",backgroundColor:"#6e465c",borderRadius:25,height:50,alignItems:"center",justifyContent:"center",marginTop:40,marginBottom:10},
      loginText:{color:"white",fontSize:normalize(15),},
      textInput:{marginLeft:15,marginRight:15,color:'white',fontSize:normalize(14)},
      loginFormTextInput:{minHeight:35,fontSize:normalize(12),borderRadius:10,borderWidth:1,borderColor:'#eaeaea',backgroundColor:'#fafafa',color:'black',paddingLeft:10,marginLeft:15,marginRight:15,marginTop:5,marginBottom:5,},
    });
    let { image } = this.state;
    if (this.state.loading) {return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>);};
    if (WineRoutesStore.logged===false) {
      return (
        <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex:1,justifyContent:'center',resizeMode:"cover",}}>
          <Card containerStyle={{height:SCREEN_HEIGHT/1.3,backgroundColor:'rgba(0,0,0,0.5)',marginLeft:5,marginRight:5}}>
            <View style={{alignItems: 'center',justifyContent:'center'}}>
              <View style={{flexDirection:'row'}}>
                <TouchableOpacity onPress={this.askLogin} style={editstyles.loginBtn}>
                  <Text style={{fontSize: normalize(14),color: '#fff',textAlign:'center'}}>Σύνδεση μέσω Social Media</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </ImageBackground>
      )
    }
    if (this.state.account===true){
      return (
        <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex:1,justifyContent:'center',resizeMode:"cover",}}>
          <Card containerStyle={{height:SCREEN_HEIGHT/1.3,backgroundColor:'rgba(0,0,0,0.5)',marginLeft:5,marginRight:5}}>
            <ScrollView contentContainerStyle={{justifyContent:'space-between'}}>
              <Text style={editstyles.textInput}>{t('username')}</Text>
              <TextInput onChangeText={text => this.setState({username:text})} placeholder="Username" placeholderColor="black" value={this.state.username} style={editstyles.loginFormTextInput}/>
              <Text style={editstyles.textInput}>Twitter</Text>
              <TextInput onChangeText={text => this.setState({twitter:text})} placeholder="Twitter" placeholderColor="black" value={this.state.twitter} style={editstyles.loginFormTextInput} multiline={true} numberOfLines={3}/>
              <Text style={editstyles.textInput}>Facebook</Text>
              <TextInput onChangeText={text => this.setState({facebook:text})} placeholder="Facebook" placeholderColor="black" value={this.state.facebook} style={editstyles.loginFormTextInput} multiline={true} numberOfLines={3}/>
              <Text style={editstyles.textInput}>{t('shortdescription')}</Text>
              <TextInput onChangeText={text => this.setState({shortdescription:text})} placeholder="Short description" placeholderColor="black" value={this.state.shortdescription} style={editstyles.loginFormTextInput} multiline={true} numberOfLines={3}/>
              <View style={{flexDirection:'row',marginTop:20,justifyContent:'space-around'}}>
                <TouchableOpacity onPress={() => this.updateUser()} style={{width:SCREEN_WIDTH/2 -40,backgroundColor:"#6e465c",borderRadius:25,height:SCREEN_HEIGHT/13,alignItems:"center",justifyContent:"center",}}>
                  <Text style={{fontSize:normalize(14),color:'#fff',textAlign:'center'}}>{t('updateaccount')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.changeToUser()} style={{width:SCREEN_WIDTH/2 -40,backgroundColor:"#6e465c",borderRadius:25,height:SCREEN_HEIGHT/13,alignItems:"center",justifyContent:"center",}}>
                  <Text style={{fontSize: normalize(14),color:'#fff',textAlign:'center'}}>{t('profile')}</Text>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection:'row',marginTop:20,justifyContent:'space-around'}}>
                <TouchableOpacity onPress={() => this.askDelete()} style={{width:SCREEN_WIDTH/2 -40,backgroundColor:'rgba(219,68,55,1)',borderRadius:25,height:SCREEN_HEIGHT/13,alignItems:"center",justifyContent:"center",}}>
                  <Text style={{fontSize:normalize(14),color:'#fff',textAlign:'center'}}>{t('deleteaccount')}</Text>
                </TouchableOpacity>
                 <TouchableOpacity onPress={this.socialLogout} style={{width:SCREEN_WIDTH/2 -40,backgroundColor:'rgba(219,68,55,1)',borderRadius:25,height:SCREEN_HEIGHT/13,alignItems:"center",justifyContent:"center",}}>
                  <Text style={{fontSize:normalize(14),color:'#fff',textAlign:'center'}}>{t('logout')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Card>
          <Modal
            animationType="fade"
            transparent={true} style={{flex:0,height:200}}
            visible={this.state.updatedVisible}
            onRequestClose={() => {this.setState({updatedVisible:false});}}>
            <View style={{marginTop:22,height:200,justifyContent:'center',alignItems:'center'}}>
              <LottieView source={require('../assets/images/submit.json')} autoPlay duration={2000}/>
            </View>
          </Modal>
        </ImageBackground>
      );
    } else {
      return (
        <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex:1,alignItems:'center',justifyContent:'center',resizeMode:"cover",}}>
          <View style={styles.cardContainer}>
            <View style={styles.headerContainer}>
              <View style={styles.userRow}>
                <View style={{flexDirection:'row',}}>
                  <View style={{flex:1}}></View>
                  <View style={{flex:1}}><Image style={styles.userImage} source={{uri: this.state.data.avatar}}/></View>
                  {this.state.IsUser==true && <View style={{flex:1}}>
                    <TouchableOpacity style={{alignItems:'center'}} onPress={() => this.changeToUser()}>
                      <Text style={{borderColor:'white',borderWidth:1,fontSize:normalize(15),color:'white',backgroundColor:this.state.followColor,borderRadius:10,}}> Επεξεργασία </Text>
                    </TouchableOpacity>
                  </View>}
                  {this.state.IsUser==false && <View style={{flex:1}}>
                    <TouchableOpacity style={{alignItems:'center'}} onPress={() => this.followUser()}>
                      <Text style={{borderColor:'white',borderWidth:1,fontSize:normalize(15),color:'white',borderRadius:10,}}> Ακολουθείστε </Text>
                    </TouchableOpacity>
                  </View>}
                </View>
                <View style={styles.userNameRow}><Text style={styles.userNameText}>{this.state.data.username}</Text></View>
                <View style={styles.userBioRow}><Text style={styles.userBioText}>{this.state.data.points} Points - {this.state.data.level}</Text></View>
              </View>
              <View style={styles.socialRow}>
                <SocialIcon iconSize={normalize(20)} iconType='fontawesome' type='facebook' onPress={() => Linking.openURL(this.state.data.facebook)}/>
                <SocialIcon iconSize={normalize(20)} iconType='fontawesome' type='twitter' onPress={() => Linking.openURL(this.state.data.twitter)}/>
              </View>
              <View style={styles.userBioRow}><Text style={styles.userBioText}>{this.state.data.shortdescription}</Text></View>
            </View>
            <TabView
              style={styles.tabContainer}
              navigationState={this.state.tabs}
              renderScene={this.renderScene}
              renderTabBar={this.renderTabBar}
              onIndexChange={this.handleIndexChange}
            />
          </View>
        </ImageBackground>
      )
    }
  }
}

function toQueryString(params) {
  return '?' + Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

AccountScreen.navigationOptions = ({navigation}) => ({
  headerStyle:{backgroundColor:'#6e465c'},headerTintColor:'#ffffff',headerLeft: () => (<Image source={require('../assets/images/icon.png')} style={{marginLeft:5,width:50,height:50}}/>),
  headerRight: () => (
    <View style={{flexDirection:'row'}}>
    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{marginRight:15}}><TabBarIcon name='settings'/></TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Info')} style={{marginRight:15}}><TabBarIcon name='information-outline'/></TouchableOpacity>
    </View>
  ),headerTitleStyle:{fontSize:25,textAlign:'left',alignSelf:'center',color:'white',},title:t('account'),gestureEnabled:true
});

export default AccountScreen