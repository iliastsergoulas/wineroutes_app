import React from 'react';
import {Notifications} from 'expo';
import {ImageBackground,Image,ScrollView,SafeAreaView,Text,View,Switch,StyleSheet,Picker,TouchableOpacity,Dimensions,Platform,PixelRatio} from 'react-native';
import Colors from '../constants/Colors';
import TabBarIcon from '../components/TabBarIcon';
import * as Animatable from "react-native-animatable";
import {Card} from 'react-native-elements';
import WineRoutesStore from './../mobx/WineRoutesStore';
import {observer} from 'mobx-react';

// Create and export Settings screen component
@observer
export default class SettingsScreen extends React.Component {
    // Define default states for switch components
    state = {
      enableNotifs:WineRoutesStore.enableNotifs,
      weatherunits: WineRoutesStore.weatherunits,
      weatherlanguage: WineRoutesStore.weatherlanguage,
      newslanguage: WineRoutesStore.newslanguage
    }

    static navigationOptions = ({ screenProps: { t } }) => ({});

    onChangeText = (text) => {this.setState({text: text});}

    render() {
      let {t,locale} = this.props.screenProps;
      const {width:SCREEN_WIDTH,height:SCREEN_HEIGHT,} = Dimensions.get('window');
      const scale = SCREEN_WIDTH / 320;
      function normalize(size) {
        const newSize = size * scale;
        if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
        else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
      };
      return (
        <ImageBackground source={require('../assets/images/background.jpg')} imageStyle={{opacity:0.9}} style={{flex: 1,resizeMode: "cover",}}>
          <Card containerStyle={{height:SCREEN_HEIGHT/1.3,backgroundColor:'rgba(0, 0, 0, 0.5)',marginLeft:10,marginRight:10,padding:0}}>
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
              <View style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between',paddingHorizontal:25,flex:1,marginTop:10,marginBottom:10}}>
                <Text style={styles.switchLabel}>{t('receivenotifications')}</Text>
                  <View style={styles.switchContainer}>
                    <Switch trackColor={{true: Colors.tintColor}} onValueChange={() => WineRoutesStore.enablenotifications()} value={WineRoutesStore.enableNotifs} />
                  </View>
              </View>
              <View style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between',paddingHorizontal:25,flex:1,marginTop:10,marginBottom:10,}}>
                <Text style={styles.switchLabel}>{t('transportation')}</Text>
                <View style={styles.switchContainer}>
                  <Picker
                    selectedValue={WineRoutesStore.transporttype}
                    style={{height: 50, width: 150,fontSize:normalize(18),color:'white'}}
                    mode='dialog'
                    onValueChange={(itemValue) =>WineRoutesStore.changeTransportType(itemValue)}>
                    <Picker.Item label={t('car')} value="driving-car" />
                    <Picker.Item label={t('heavygoodsvehicle')} value="driving-hgv" />
                    <Picker.Item label={t('cyclingregular')} value="cycling-regular" />
                    <Picker.Item label={t('cyclingroad')} value="cycling-road" />
                    <Picker.Item label={t('cyclingsafe')} value="cycling-safe" />
                    <Picker.Item label={t('cyclingmountain')} value="cycling-mountain" />
                    <Picker.Item label={t('cyclingtour')} value="cycling-tour" />
                    <Picker.Item label={t('cyclingelectric')} value="cycling-electric" />
                    <Picker.Item label={t('hiking')} value="foot-hiking" />
                    <Picker.Item label={t('walking')} value="foot-walking" />
                    <Picker.Item label={t('wheelchair')} value="wheelchair" />
                  </Picker>
                </View>
              </View>
              <View style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between',paddingHorizontal:25,flex:1,marginTop:10,marginBottom:10,}}>
                <Text style={styles.switchLabel}>{t('distancemeasure')}</Text>
                <View style={styles.switchContainer}>
                  <Picker selectedValue={WineRoutesStore.distancemeasureValue} style={{height: 50, width: 150,fontSize:normalize(18),color:'white'}} mode='dialog'
                    onValueChange={(itemValue) =>WineRoutesStore.changeDistanceMeasure(WineRoutesStore.distancemeasureValue)}>
                    <Picker.Item label={t('klm')} value="km" />
                    <Picker.Item label={t('m')} value="m" />
                    <Picker.Item label={t('mile')} value="mi" />
                  </Picker>
                </View>
              </View>
              <View style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between',paddingHorizontal:25,flex:1,marginTop:10,marginBottom:10,}}>
                <Text style={styles.switchLabel}>{t('routeprofile')}</Text>
                <View style={styles.switchContainer}>
                  <Picker selectedValue={WineRoutesStore.routeprofile} style={{height: 50, width: 150,fontSize:normalize(18),color:'white'}} mode='dialog'
                    onValueChange={(itemValue) =>WineRoutesStore.changeRouteProfile(WineRoutesStore.routeprofile)}>
                    <Picker.Item label={t('fastest')} value="fastest" />
                    <Picker.Item label={t('shortest')} value="shortest" />
                    <Picker.Item label={t('recommended')} value="recommended" />
                  </Picker>
                </View>
              </View>
               <View style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between',paddingHorizontal:25,flex:1,marginTop:10,marginBottom:10}}>
                <Text style={styles.switchLabel}>{t('mapstyle')}</Text>
                <View style={styles.switchContainer}>
                  <Picker selectedValue={WineRoutesStore.mapstyleselect} style={{height: 50, width: 150,fontSize:normalize(18),color:'white'}} mode='dialog'
                    onValueChange={(itemValue) =>WineRoutesStore.changeMapStyle(itemValue)}>
                    <Picker.Item label="Wine" value="Wine" />
                    <Picker.Item label="Vintage" value="Vintage" />
                    <Picker.Item label="Industrial" value="Industrial" />
                    <Picker.Item label="Midnight" value="Midnight" />
                    <Picker.Item label="Cobalt" value="Cobalt" />
                    <Picker.Item label="Apple" value="Apple" />
                    <Picker.Item label="Hopper" value="Hopper" />
                  </Picker>
                </View>
              </View>
            </ScrollView>
          </Card>
        </ImageBackground>
      )
    }
}

SettingsScreen.navigationOptions = ({ navigation }) => ({
    headerStyle: {backgroundColor: '#6e465c'},headerTintColor: '#ffffff',headerTintColor: '#ffffff',gestureEnabled: true,
    headerTitleStyle: { fontSize:25, textAlign: 'left', alignSelf: 'center', color:'white', },
    title: t('settings'),
});

const styles = StyleSheet.create({
  switchrowContainer: {display: 'flex',alignItems: 'center',flexDirection: 'row',justifyContent: 'space-between',marginBottom: 15,paddingHorizontal: 25,flex:1},
  switchContainer: {display: 'flex',alignItems: 'center',flexDirection: 'row',justifyContent: 'space-around',flex:1},
  switchLabel: {flex: 1,fontSize:18,color:'white'}
});