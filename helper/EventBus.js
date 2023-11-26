
const _dic={};
const _evt = {
	EVE_BOOKSHELF:'book_shelf',
	EVE_LOGINED:'eve_logined',
	EVE_LOGOUT:"eve_logout",
	EVE_REDBAG:'eve_red_bag',
	EVE_DIALOG:'eve_dialog',
	EVE_WIND_OPEN:'eve_window_open',
	EVE_WIND_CLOSE:'eve_window_close',
	EVE_TOAST_SHOW:'eve_toast_show',
	
	
	addEventListener(type,listener){
		 if(!_dic[type]) _dic[type]=new Array();
		_dic[type].push(listener);
	},
	removeEventListener(type,listener){
		if(!!_dic[type]){
			let index=_dic[type].indexOf(listener);
			if(index>=0) _dic[type].splice(index,1);
		}
	},
	dispatchEvent(type,data=null){
		console.log('dispatchEvent 1',type)
		if(!!_dic[type]){
			console.log('dispatchEvent 2',_dic[type])
			_dic[type].forEach(item=>item(data));
		}
	}
	
}
export default _evt;