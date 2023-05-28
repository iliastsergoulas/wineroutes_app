import {create,persist} from "mobx-persist";
import {observable,action} from 'mobx';
import {PermissionsAndroid,AsyncStorage} from 'react-native';
import * as Permissions from 'expo-permissions';
import WineStyle from '../constants/WineStyle.json';
import AppleStyle from '../constants/AppleStyle.json';
import CobaltStyle from '../constants/CobaltStyle.json';
import HopperStyle from '../constants/HopperStyle.json';
import MidnightStyle from '../constants/MidnightStyle.json';
import IndustrialStyle from '../constants/IndustrialStyle.json';
import VintageStyle from '../constants/VintageStyle.json';
import * as SecureStore from 'expo-secure-store';

class WineRoutesStore {

	@persist @observable logged=false;
	@observable region={latitude: 52.5,longitude: 19.2,latitudeDelta: 8.5,longitudeDelta: 8.5};
	@persist @observable transporttype='driving-car';
	@persist @observable routeprofile='fastest';
	@persist @observable distancemeasure='km';
	@persist @observable mapstyleselect='Wine';
	@persist @observable showApp=false;
	@persist('list') @observable mapstyle=WineStyle;
	@persist @observable mywineries='';
	@persist @observable mywineriesgeo='';
	@observable expoid=null;
	@observable mylocation=null;
	@observable isConnected=null;
	@persist @observable myusername=null;
	@persist @observable shortdescription=null;
	@persist @observable twitter=null;
	@persist @observable facebook=null;
	@persist @observable avatar=null;
	@observable selectedwineries="[]";
	@persist @observable enableNotifs=true;

	@action changeMapStyle(style){
		this.mapstyleselect=style;
		if (style==='Wine'){this.mapstyle=WineStyle;}
		else if (style==='Vintage'){this.mapstyle=VintageStyle;}
		else if (style==='Industrial'){this.mapstyle=IndustrialStyle;}
		else if (style==='Midnight'){this.mapstyle=MidnightStyle;}
		else if (style==='Cobalt'){this.mapstyle=CobaltStyle;}
		else if (style==='Apple'){this.mapstyle=AppleStyle;}
		else if (style==='Hopper'){this.mapstyle=HopperStyle;}
	}
	
	@action changeTransportType(transporttype){
		this.transporttype=transporttype;
	}
	
	@action changeRouteProfile(routeprofile){
		this.routeprofile=routeprofile;
	}
	
	@action changeDistanceMeasure(distancemeasurevalue){
		this.distancemeasure=distancemeasurevalue;
	}

	@action storeWineries(data){
		this.mywineries=JSON.stringify(data);
	}

	@action storeLocation(data){
		this.mylocation=JSON.stringify(data);
	}

	@action storeLogin(name,shortdescription,twitter,facebook,avatar) {
		this.myusername=name;
		this.shortdescription=shortdescription;
		this.twitter=twitter;
		this.facebook=facebook;
		this.avatar=avatar;
		this.logged=true;
	}

	@action async getSocialDetails(userid,name,email,photoUrl){
		SecureStore.setItemAsync("userid",userid).then((result)=>{
			this.socialname=name;
			this.myusername=name;
			this.socialemail=email;
			this.socialphotoUrl=photoUrl;
		}).catch((error)=>{
	       console.log(error)
	    });
	}

	@action async logout(){
		this.logged=false;
		SecureStore.setItemAsync("userid","").then((result)=>{
			this.socialname=null;
			this.socialemail=null;
			this.socialphotoUrl=null;
			this.myusername='';
			this.shortdescription=null;
			this.twitter=null;
			this.facebook=null;
			this.avatar=null;
		}).catch((error)=>{
	       console.log(error)
	    });
	}

	@action async setExpoid(token){
		this.expoid=token;
	}
  	
	@action async deviceidsend(token,locale){
		const url = "https://app.wineroutes.eu/deviceidsend?token="+token+"&locale="+locale;
		fetch(url)
		.then(res => res.json())
		.then(res => {
			console.log("Sent",res);
		})
		.catch(error => {
			console.log(error);
		});
	}

	@action changeShowApp(){
		this.showApp=true;
	}

	@action changeConnected(value){
		this.isConnected=value;
	}

}

const hydrate = create({storage: AsyncStorage,jsonify: true })
const store = new WineRoutesStore()
export default store
hydrate('wineroutes', store).then(() => console.log('WineRoutesStore has been hydrated'))