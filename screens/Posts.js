import React,{Component} from 'react';
import {FlatList,StyleSheet,View,Text,Image,Dimensions,Platform,PixelRatio,Share,TouchableOpacity} from 'react-native';
import {ListItem,Rating,Badge} from 'react-native-elements';
import PropTypes from 'prop-types';
import {MaterialCommunityIcons,FontAwesome5} from '@expo/vector-icons';
import {datetime} from '../utilities';
import WineRoutesStore from './../mobx/WineRoutesStore';
import * as SecureStore from 'expo-secure-store';
import * as Animatable from "react-native-animatable";

const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
}

const styles = StyleSheet.create({
  container: {flexDirection:'column',alignItems:'center',},
  postContainer: {justifyContent:'space-between',marginBottom:0,marginLeft:12,marginRight:12,marginTop:0,padding:0,borderWidth:0,},
  post1container: {borderWidth:0,justifyContent:'space-between',marginBottom:0,marginLeft:12,marginRight:12,marginTop:0,padding:0,},
  date: {color:'gray',fontSize:normalize(12.5),},
  postRow: {alignItems:'center',flexDirection:'row',paddingBottom:0,paddingLeft:15,paddingRight:15,paddingTop:10,width:Dimensions.get('window').width * 1,},
  postImage: {backgroundColor:'rgba(0, 0, 0, 0.075)',height:200,},
  userImage: {marginRight:12,},
  wordRow: {marginBottom:0,paddingLeft:15,paddingRight:15,paddingTop:0,},
  wordText: {fontSize:normalize(14),fontWeight:'500',lineHeight:26,},
  wordTitle: {fontSize:normalize(24),fontWeight:'500',lineHeight:26,},
})

class Posts extends Component {

  constructor(props) {
    super(props);
    this.state = {loading:false,notlogged:false,data:props.posts};
  }

  static propTypes = {
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    posts: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.isRequired,
        title: PropTypes.string,
        text: PropTypes.string,
        name: PropTypes.string,
        username: PropTypes.string,
        image: PropTypes.string,
        vintage: PropTypes.string,
        region: PropTypes.string,
        appelation: PropTypes.string,
        likes: PropTypes.string,
        color: PropTypes.string,
        user: PropTypes.shape({
          name: PropTypes.string.isRequired,
          username: PropTypes.string.isRequired,
          avatar: PropTypes.string.isRequired,
          email: PropTypes.string.isRequired,
        }),
      })
    ).isRequired,
    type:PropTypes.string,
    screen:PropTypes.string
  }

  static defaultProps = {containerStyle:{},}

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

  myShare = async (id,title) => {
    try {
      const result = await Share.share({
        message:title+" from @winerouteseu",
        title:title,
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

  likepost = (id,liked) => {
    if (WineRoutesStore.logged===true){
      SecureStore.getItemAsync("sessionid").then((sessionid)=>{
        if (liked> 0){
          const myurl="https://app.wineroutes.eu/removereviewlikes?reviewid="+id+"&sessionid="+sessionid;
          fetch(myurl,{method: "POST"})
          .then(res => res.json())
          .then(res => {
            var tempData=this.state.data;
            tempData.forEach(item => {
              if (item.id === id) {
                item.liked=0;
                item.likes=item.likes-1;
              }
            })
            this.setState({data:tempData});
          })
          .catch(error => {
            console.log(error);
          });
        } else {
          const myurl="https://app.wineroutes.eu/addreviewlikes?reviewid="+id+"&sessionid="+sessionid;
          fetch(myurl,{method: "POST"})
          .then(res => res.json())
          .then(res => {
            var tempData=this.state.data;
            tempData.forEach(item => {
              console.log(item.likes,typeof(item.likes));
              if (item.id === id) { 
                item.liked=1;
                if (item.likes!=null && item.likes!='NaN'){item.likes=item.likes+1;}
                else {item.likes=1;}
              }
            })
            this.setState({data:tempData});
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
  }

  renderSeparator = () => {return (<View style={{height:1,width: '86%',backgroundColor:'black',marginLeft:'14%',}}/>);};

  renderUserItem = ({ item }) => (
    <ListItem
      leftAvatar={{ source: {uri:item.image },size:'large'}}
      containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}
      title={item.title} titleStyle={{color:'black'}} subtitle={item.shortdescription+'\n'+item.points+" Points - "+item.level} subtitleStyle={{color:'gray'}} 
      chevron={{ color: 'black' }}
      topDivider={true}
      onPress={() => this.props.navigation.navigate('Account', { userid:item.id })}
  />);

  renderWineryItem = ({ item }) => (
    <ListItem
      leftAvatar={{ source: {uri:item.image },size:'large'}}
      containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}
      title={item.title} titleStyle={{color:'black'}} 
      chevron={{ color:'black' }}
      topDivider={true}
      onPress={() => this.props.navigation.navigate('Winery', { wineryid:item.id })}
  />);

  renderRouteItem = ({ item }) => (
    <ListItem
      containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}
      title={item.title} titleStyle={{color:'black'}} subtitle={this.secondsToHms(JSON.parse(item.route).features[0].properties.myduration)}
      subtitle={t('distance')+': '+(JSON.parse(item.route).features[0].properties.myduration).toFixed(2)+' klm\n'+t('duration')+': '+this.secondsToHms(JSON.parse(item.route).features[0].properties.myduration)}
      chevron={{ color: 'black' }}
      topDivider={true}
      onPress={() => this.props.navigation.navigate('RouteViewer', {myroute:item.route,myroutename:item.title})}/>);

  renderWineItem = ({ item }) => (
    <ListItem
      containerStyle={{borderWidth: 0,elevation: 0,backgroundColor:'transparent'}}
      title={item.title} titleStyle={{color:'black'}} 
      subtitle={
        <View style={{paddingLeft:10,paddingTop:5}}>
          <Text style={{paddingLeft:10,color:'grey'}}>{item.vintage}, {item.color}, {item.appelation}, {item.region}</Text>
          <Text style={{paddingLeft:10,color:'grey'}}>{item.text}</Text>
        </View>
      } topDivider={true}/>);

  renderReviewItem = ({ item }) => (
    <View style={styles.post1container}>
      <View style={styles.postRow}>
        {item.user && <View style={styles.userImage}>
          <Avatar rounded size="medium" source={{uri: item.user.avatar,}}/>
        </View>}
        <View>
          <Text style={styles.wordTitle}>{item.title}</Text>
          {item.name && this.props.screen==='user' && <Text>{item.name}</Text>}
          {item.username && this.props.screen==='winery' && <Text>{item.username}</Text>}
          <View style={{flexDirection:'row',alignItems:'center',width:SCREEN_WIDTH-50,justifyContent:'space-between'}}>
            <Text style={styles.date}>{item.createddate.substring(6)}</Text> 
            {item.rating && <View style={{flexDirection:'row',paddingHorizontal:5,borderRadius:40,}}><FontAwesome5 name="trophy" size={normalize(20)} color={"#6e465c"}/><Text style={{fontSize:normalize(15),color:'#6e465c'}}> {item.rating}/5</Text></View>}
            <TouchableOpacity onPress={() => this.likepost(item.id,item.liked)} style={{flexDirection:'row'}}><FontAwesome5 name="glass-cheers" size={normalize(20)} color={item.liked>0 ? "#6e465c" : "gray"}/><Text style={{fontSize:normalize(15),color:'#6e465c'}}>{item.likes}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => this.myShare(item.id,item.title)}><MaterialCommunityIcons name="share-variant" size={normalize(20)} color="#6e465c"/></TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.wordRow}>
        <Text style={styles.wordText}>{item.text}</Text>
      </View>
      {item.image!==null && item.image!=="" && <Image style={styles.postImage} source={{uri:item.image}} />}
    </View>
  );

  render() {
    if (this.props.type==='reviews'){
      return (
        <FlatList
          ref="REF-FLATLIST"
          removeClippedSubviews={true}
          initialNumToRender={3}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={100}
          windowSize={3}
          contentContainerStyle={[styles.container, this.props.containerStyle]}
          data={this.state.data}
          renderItem={this.renderReviewItem}
          extraData={this.state.changed}
        />
      )
    } else if (this.props.type==='wineries'){
      return (
        <FlatList
          data={this.state.data}
          renderItem={this.renderWineryItem}
          keyExtractor={item => item.id.toString()}
          removeClippedSubviews={true}
          initialNumToRender={7}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={100}
          windowSize={7}
        />
      )
    } else if (this.props.type==='routes'){
      return (
        <FlatList
          data={this.state.data}
          renderItem={this.renderRouteItem}
          keyExtractor={item => item.id.toString()}
          removeClippedSubviews={true}
          initialNumToRender={7}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={100}
          windowSize={7}
        />
      )
    } else if (this.props.type==='users'){
      return (
        <FlatList
          data={this.state.data}
          renderItem={this.renderUserItem}
          keyExtractor={item => item.id}
          removeClippedSubviews={true}
          initialNumToRender={7}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={100}
          windowSize={7}
        />
      )
    } else if (this.props.type==='wines'){
      return (
        <FlatList
          data={this.state.data}
          renderItem={this.renderWineItem}
          keyExtractor={item => item.id}
          removeClippedSubviews={true}
          initialNumToRender={7}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={100}
          windowSize={7}
        />
      )
    }
  }
}

export default Posts