import React from "react";
import {StyleSheet,View,Text,Dimensions,Platform,PixelRatio,Image} from "react-native";

const {width:SCREEN_WIDTH,height:SCREEN_HEIGHT,} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {return Math.round(PixelRatio.roundToNearestPixel(newSize))} 
  else {return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2}
};

const Style = StyleSheet.create({
    container: {flexDirection: "column",alignSelf: "flex-start"},
    count: {color: "#fff",fontSize: 18}
});

const ClusterMarker = ({ count, fontColor }) => (
  <View><Text style={{color:fontColor,fontWeight:'bold',textAlign:'center',fontSize:normalize(13),}}>{count}</Text><Image source={require('../assets/images/grape.png')} style={{ marginLeft:5, width: 30, height: 30 }}/></View>
);

export default ClusterMarker;