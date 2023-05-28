import {AppLoading} from 'expo';
import * as Permissions from 'expo-permissions';
import {Asset} from 'expo-asset';
import * as Font from 'expo-font';
import React, {useState} from 'react';
import {StatusBar,Text,StyleSheet,View,Vibration,Image,Dimensions,Platform,PixelRatio} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AppNavigator from './navigation/AppNavigator';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import {enableScreens} from 'react-native-screens';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import WineRoutesStore from './mobx/WineRoutesStore';
import {observer} from 'mobx-react';
import LottieView from 'lottie-react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import NetInfo from '@react-native-community/netinfo';

const {width: SCREEN_WIDTH,height: SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
}

@observer
export default class App extends React.Component {
  state = {isReady:false,isLoadingComplete:false,notification:null,locale:Localization.locale,messageText:'',};
    
  render() {
    const styles = StyleSheet.create({
      container: {flex: 1,},
    });
    const en = {
      language: 'Language',version:' Version',attributions:' Attributions',notifications:'Notifications',updatesettings:'Update settings',account:'Account',discover:'Discover',profile:'Profile',
      username:'User name',deleteaccount:'Delete account',updateaccount:'Update account',logout:'Log out',shortdescription:'Short description',rateapp:'Rate our app',viewmore: 'View more',
      settings:'Settings',about:'About',units:'Units',receivenotifications:'Receive notifications',routestab:'routes',reviews:'reviews',followers:'followers',likes:'likes',pickimage:'Pick an image',
      nogps: "No GPS",tryagain:"Try again",otherapps:"Other apps",wineroutes:"Discover new wineries and wines around the world and join winelovers' community",
      loginwith:"Login with..",select:"Select",close:'Close',privacy:' Privacy Policy',disclaimertitle:'Connecting with third party services',details:'Details',reviewstab:'Reviews',winestab:'Wines',
      disclaimertext:'The application is compatible with the GDPR Regulation, as no personal data is collected either directly or through third party services. The connection via auth0 service is only available for those who explicitly choose to connect in order to receive personalized notifications regardless of device.',
      routedesign:'Design route',recommended:'Recommended',wineries:'Wineries',search:'Search..',routename:'Route name',fillroutename:'Fill route name',routeviewer:'Route viewer',
      showroute:'Show route',saveroute:'Save route',glossary:'Glossary',seminars:'Seminars',error:'Error',notlogged:'You are not logged.',success:'Success',reviewsubmitted:'Review is submitted.',
      accountupdated:'Your account is updated.',transportation:'Transportation',car:'Driving car',heavygoodsvehicle:'Heavy Goods Vehicle',cyclingregular:'Cycling - Regular',cyclingroad:'Cycling - Road',
      cyclingsafe:'Cycling - Safe',cyclingmountain:'Cycling - Mountain',cyclingtour:'Cycling - Tour',cyclingelectric:'Cycling - Electric',hiking:'Hiking',walking:'Walking on foot',wheelchair:'Wheelchair',
      klm:'Kilometers',m:'Meters',mile:'Miles',typehere:'Type here ...',distancemeasure:'Distance measure',routeprofile:'Route profile',fastest:'Fastest route',shortest:'Shortest route',recommended:'Recommended route',
      mapstyle:'Map style',distance:'Distance',duration:'Duration',numberwineries:'Number of wineries',map:'Map',routes:'Routes',winery:'Winery',hour:' hour, ',hours:' hours, ',minute:' minute, ',minutes:' minutes, ',second:' second',seconds:' seconds',title:'Title',text:'Text',
      slide1title:'Wine and wineries globally',slide1text:'Browse among thousands of available wineries and discover new experiences.',follow:'Follow',edit:'Edit',
      slide2title:'A large community of winelovers',slide2text:'Share your experiences and opinions.',
      slide3title:'Wine routes for everyone',slide3text:'Design and share your favorite wine routes.',
      slide4title:'Learn and improve yourselves',slide4text:"Discover more about wine's world with seminars, events,maps and others.",areas:'Wine Areas',news:'News',shop:'Products',submit:'Submit',cancel:'Cancel',
      showdistance:'Distance from my position',showclosest:'Show closest',showprices:'Prices range',filters:'Filters',from:'Price from',to:'Price to',nogps:'Please check your Geolocation setings',
      errornumber:'You have to select two or more wineries.',wineslisted:'No wines listed',noreviews:'No reviews',nolikes:'No likes',noroutes:'No routes',nofollowers:'No followers'
    };
    const el = {
      language: 'Γλώσσα',version:' Έκδοση',attributions:' Αναφορές',notifications:'Ειδοποιήσεις',updatesettings:'Ενημέρωση ρυθμίσεων',account:'Λογαριασμός',discover:'Ανακαλύψτε',profile:'Προφίλ',
      username:'Όνομα χρήστη',deleteaccount:'Διαγραφή λογαριασμού',updateaccount:'Ενημέρωση λογαριασμού',logout:'Αποσύνδεση',shortdescription̈́:'Λίγα λόγια',rateapp:"Πείτε τη γνώμη σας",viewmore:'Περισσότερα',
      settings:'Ρυθμίσεις',about:'Σχετικά',units:'Μονάδα μέτρησης',receivenotifications:'Λήψη ειδοποιήσεων',routestab:'διαδρομές',reviews:'αξιολογήσεις',followers:'ακόλουθοι',likes:'αρέσει',pickimage:'Διαλέξτε φωτογραφία',
      nogps:"Δεν εντοπίστηκε GPS",tryagain:"Προσπαθήστε ξανά",otherapps:"Άλλες εφαρμογές",wineroutes:"Ανακαλύψτε νέα οινοποιεία & κρασιά παγκοσμίως και ενωθείτε με οινόφιλους",
      loginwith:"Σύνδεση μέσω..",select:"Επιλογή",close:'Κλείσιμο',privacy:' Πολιτική Απορρήτου',disclaimertitle:'Ενημέρωση για σύνδεση μέσω τρίτων υπηρεσιών',details:'Λεπτομέρειες',reviewstab:'Αξιολογήσεις',winestab:'Οίνοι',
      disclaimertext:'Η εφαρμογή είναι συμβατή με τον Κανονισμό GDPR, καθώς δε συγκεντρώνονται προσωπικά δεδομένα είτε απευθείας είτε μέσω υπηρεσιών τρίτων. Η σύνδεση μέσω υπηρεσίας auth0 προσφέρεται μόνο για όσους ρητά επιλέξουν να συνδεθούν ώστε να λαμβάνουν προσωποποιημένη ενημέρωση ανεξαρτήτως συσκευής.',
      routedesign:'Σχεδιάστε διαδρομή',recommended:'Προτεινόμενες',wineries:'Οινοποιεία',search:'Αναζήτηση',routename:'Ονομασία διαδρομής',fillroutename:'Συμπληρώστε ονομασία διαδρομής',routeviewer:'Διαδρομή',
      showroute:'Δείξε διαδρομή',saveroute:'Αποθήκευση διαδρομής',glossary:'Γλωσσάριο',seminars:'Σεμινάρια',error:'Σφάλμα',notlogged:'Δεν έχετε συνδεθεί.',success:'Επιτυχία',
      reviewsubmitted:'Η αξιολόγησή σας υποβλήθηκε.',accountupdated:'Ο λογαριασμός σας ενημερώθηκε.',transportation:'Μέσο μεταφοράς',car:'Αυτοκίνητο',heavygoodsvehicle:'Βαρύ όχημα',cyclingregular:'Ποδηλασία - κανονική',
      cyclingroad:'Ποδηλασία - Δρόμου',cyclingsafe:'Ποδηλασία - Ασφαλείας',cyclingmountain:'Ποδηλασία - Βουνό',cyclingtour:'Ποδηλασία - Περιήγηση',cyclingelectric:'Ποδηλασία - Ηλεκτρικό',
      hiking:'Πεζοπορία',walking:'Περπάτημα',wheelchair:'Αναπηρικό καροτσάκι',klm:'Χιλιόμετρα',m:'Μέτρα',mile:'Μίλια',typehere:'Γράψτε εδώ...',distancemeasure:'Μονάδα μέτρησης',routeprofile:'Προφίλ διαδρομής',
      fastest:'Μικρότερος χρόνος',shortest:'Μικρότερη απόσταση',recommended:'Προτεινόμενη',mapstyle:'Στυλ χάρτη',distance:'Απόσταση',duration:'Διάρκεια',numberwineries:'Αριθμός οινοποιείων',map:'Χάρτης',
      routes:'Διαδρομές',winery:'Οινοποιείο',hour:' ώρα, ',hours:' ώρες, ',minute:' λεπτό, ',minutes:' λεπτά, ',second:' δευτερόλεπτο',seconds:' δευτερόλεπτα',title:'Τίτλος',text:'Κυρίως κείμενο',
      slide1title:'Οίνος και οινοποιεία παγκοσμίως',slide1text:'Περιηγηθείτε στα χιλιάδες διαθέσιμα οινοποιεία και ανακαλύψτε νέες εμπειρίες.',follow:'Ακολουθείστε',edit:'Επεξεργασία',
      slide2title:'Μια μεγάλη κοινότητα οινόφιλων',slide2text:'Μοιραστείτε εμπειρίες και ανταλλάξτε απόψεις.',
      slide3title:'Δρόμοι του κρασιού για όλους',slide3text:'Σχεδιάστε και μοιραστείτε τις αγαπημένες σας διαδρομές.',
      slide4title:'Μάθετε και βελτιωθείτε',slide4text:'Ανακαλύψτε περισσότερα για τον κόσμο του κρασιού με σεμινάρια, εκδηλώσεις, χάρτες και άλλα',areas:'Οινικές Περιοχές',news:'Ειδήσεις',shop:'Προϊόντα',submit:'Υποβολή',cancel:'Ακύρωση',
      showdistance:'Απόσταση από θέση μου',showclosest:'Δείξε κοντινότερα',showprices:'Εύρος τιμών',filters:'Φίλτρα',from:'Τιμή από',to:'Τιμή έως',nogps:'Ελέγξτε τις ρυθμίσεις εύρεσης θέσης σας (GPS/GNSS).',
      errornumber:'Πρέπει να επιλέξετε δύο ή περισσότερα οινοποιεία.',wineslisted:'Δεν υπάρχουν σχετικά στοιχεία.',noreviews:'Δεν υπάρχουν αξιολογήσεις',nolikes:'Δεν υπάρχουν likes',noroutes:'Δεν υπάρχουν διαδρομές',nofollowers:'Δεν υπάρχουν ακόλουθοι'
    };
    handleUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Updates.reloadFromCache();
        } else {console.log("No updates.")}
      } catch (e) {console.log(e);}
    };
    i18n.fallbacks = true;
    i18n.translations = {el,en};
    setLocale = locale => {this.setState({locale});};
    t = (scope, options) => {return i18n.t(scope, {locale: this.state.locale, ...options});};
    const prefix = Linking.makeUrl('/');
    if (this.state.isLoadingComplete===false) {return (<AppLoading startAsync={this.loadResourcesAsync} onError={this.handleLoadingError} onFinish={() => this.handleFinishLoading()}/>);} 
    else {return (<AppNavigator uriPrefix="wineroutes://" screenProps={{t: t,locale: this.state.locale,setLocale: setLocale,}}/>);}
    /*if (this.state.isLoadingComplete===false) {return (<AppLoading startAsync={this.loadResourcesAsync} onError={this.handleLoadingError} onFinish={() => this.handleFinishLoading()}/>);} 
      else {return (<AppNavigator screenProps={{t: t,locale: this.state.locale,setLocale: setLocale,}}/>);}*/
  }

  pushLocalNotification = async () => {
    if (Constants.isDevice) {
      const {status:existingStatus} = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      let token = await Notifications.getExpoPushTokenAsync();
      WineRoutesStore.setExpoid(token);
      WineRoutesStore.deviceidsend(token.data,this.state.locale);
    } else {
      WineRoutesStore.setExpoid("ExponentPushToken[9dIf7bABO74TRVmmibmiRG]");
    }
    this._notificationSubscription = Notifications.addNotificationReceivedListener(this._handleNotification);
  }

  async loadResourcesAsync() {
      await Promise.all([
        Asset.loadAsync([
          require('./assets/images/icon.png'),
          require('./assets/images/agristats.png'),
          require('./assets/images/background.jpg'),
          require('./assets/images/grape.png'),
          require('./assets/images/greekgeography.png'),
          require('./assets/images/pin.png'),
          require('./assets/images/wineglass.png'),
        ]),
        Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
          'courgette': require('./assets/fonts/Courgette-Regular.ttf'),
        }),
      ]);
  }

  handleNotification = (notification) => {
    this.setState({notification});
  }

  handleLoadingError(error) {
    console.warn(error);
  }

  handleFinishLoading() {
    this.pushLocalNotification();
    const unsubscribe = NetInfo.addEventListener(state => {
      WineRoutesStore.changeConnected(state.isConnected);
    });
    SecureStore.getItemAsync("userid").then((userid)=>{
      if (userid){
        const url = "https://app.wineroutes.eu/createUser?userid="+userid+"&username="+WineRoutesStore.myusername+"&expoid="+WineRoutesStore.expoid+"&email="+WineRoutesStore.socialemail+"&avatar="+WineRoutesStore.socialphotoUrl;
        fetch(url).then(res => res.json())
        .then(res => {
          SecureStore.setItemAsync("sessionid",res.sessionid).then((result)=>{
            WineRoutesStore.storeLogin(WineRoutesStore.myusername,res.shortdescription,res.twitter,res.facebook,res.avatar);
          }).catch((error)=>{
            console.log(error)
          });
        }).catch(error => {console.log(error);});
      }
    }).catch((error)=>{
      console.log(error)
    });
    //WineRoutesStore.getLocation();
    this.setState({isLoadingComplete: true});
  }

}