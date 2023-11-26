
import EventBus from '@/helper/EventBus.js';
const _dic={};
var utils=null;
const _evt = {
	init(ut){
		utils=ut;
		
		console.log(' APP show',getApp().globalData.isnew,getApp().globalData.text);
	},
}
export default _evt;