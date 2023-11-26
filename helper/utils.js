/**
 * 您可以将常用的方法、或系统 API，统一封装，暴露全局，以便各页面、组件调用，而无需 require / import.
 */
//const prompt = require('@system.prompt')
// const router = require('@system.router')
//import storage from '@system.storage'
//import device from '@system.device'
const $e18n = require('./e18n').default;
// import alipay from '@service.alipay';
// import wxpay from '@service.wxpay'
// import shortcut from '@system.shortcut' ;
import $apis from '@/helper/apis/api.js';
import EventBus from '@/helper/EventBus.js';
import config from '../config.js';



/**
 * 拼接 url 和参数
 */
const DEBUG=config.debug;
// #ifdef MP-WEIXIN
	const PRE_LOGIN_MODE=0;
// #endif
// #ifndef MP-WEIXIN 
	const PRE_LOGIN_MODE=config.pre_login_mode;
// #endif
const PASSING_LEVEL= config.passing_level;

var storage_obj={}
var $global={};
const zid= (Math.random()+'d');
const _dic={}; // Event dic 
const  _ut = {
  init_lize(){
	  $apis.setUtil(this);
  },
  init_ready(){
		console.log('util init ready')
	   // #ifdef MP-WEIXIN
			this.login(suc=>{ console.log('auto login sucess')},err=>{console.log('auto login faile')});
	   // #endif
	   // #ifdef H5
			console.log('util init ready H5')
			if(this.isInWx()){
				console.log('util init ready H5 in weinx')
				this.wx_login(true);
				this.wx_share();
			}
	   // #endif  
  },
  
  keeptabBarTxt(){
	   this.getInitDataCb(()=>{
		   uni.setTabBarItem({index:0,text:this.e18n('menu_1')})
		   uni.setTabBarItem({index:1,text:this.e18n('menu_2')})
		   uni.setTabBarItem({index:2,text:this.e18n('menu_3')})
		   uni.setTabBarItem({index:3,text:this.e18n('menu_4')})
	   });
  },
  app_exit(){
	  // #ifdef MP-WEIXIN
	  				uni.exitMiniProgram();
	  // #endif
	  // #ifdef APP
	  				try{
						if (uni.getSystemInfoSync().platform == 'ios'){
						    plus.ios.import("UIApplication").sharedApplication().performSelector("exit")
						} else if (uni.getSystemInfoSync().platform == 'android'){
						    plus.runtime.quit();
						}
					}catch(e){
						this.log('exit error');
					}
	  // #endif
  },
  firstHandle(pagename){
	  console.log('firstHandle 1',this.getLaunch());
	  if(this.util_stroage_breakget('isnew',false)){
		 this.getInitDataCb((res)=>{
			  this.log('firstHandle 3',res);
			  let title= this.e18n('redbag.first_title');
			  let sub_title=this.e18n('redbag.first_sub_title');
			  let tip_title= this.e18n('redbag.first_tip_title');
			  let btn_ok= this.e18n('redbag.first_ok');
			  let content = res.system.givegold || 0;
			  this.openRedWindow({title:title,sub_title:sub_title,tip_title:tip_title,content:content,ok:btn_ok,msk:true,pagename:pagename});
			  this.util_stroage_breaksave({isnew:false});
		 })
	  }
  },
  formatBookHots(num){
      let hots=num||135000;
      if(hots>10000) {
		  hots=(Math.ceil(hots/100)/100).toFixed(2)+'万';
	  }
      return hots;
    },
  formatTime(sec_num){
	  sec_num=Math.floor(sec_num);
	  let minites=Math.floor(sec_num/60);
	  let  seconds = sec_num-(minites*60);
	  let time_str=(minites<10?('0'+minites):minites)+':'+(seconds<10?('0'+seconds):seconds);
	  return time_str
  },
   filterHTMLTag (msg) {
	    var msg = msg.replace(/<\/?[^>]*>/g, ''); //去除HTML Tag
	    msg = msg.replace(/[|]*\n/, '') //去除行尾空格
	    msg = msg.replace(/&npsp;/ig, ''); //去掉npsp
	    return msg;
	},

  api(){
	  return $apis;
  },
  isdebug(){
    return DEBUG;
  },
  isPreLoginMode(){
		let ret=false;
        switch(PRE_LOGIN_MODE){
          case 0:
             ret =  false;
            break;
           case 1:
             ret =  this.isInPassing()?false:true;
             break;
           case 2:
             ret =  true;
             break;
        }
        return ret;
  },
  isUnloginAble(){
    return this.isPreLoginMode() || this.isLogin();
  },
  isNeedLogin(){
    return !this.isPreLoginMode() && !this.isLogin();
  },
  
  deep_copy(obj){
    return JSON.parse(JSON.stringify(obj));
  },
  hlighTxt (key,place){
    let content=this.e18n(key.txt) || key.txt;
    return content.split(/[{}]/g,).filter(str=>str).map(str=>{ return place[str] || {...key,txt:str};})
  },
  e18n(key,arg=''){
	return   $e18n(this.getLanguage(),key,arg)
  },
  
   queryString(url, query){
    let str = []
    for (let key in query) {
      str.push(key + '=' + query[key])
    }
    let paramStr = str.join('&')
    return paramStr ? `${url}?${paramStr}` : url
  },
  getDeviceInfo(cb){
	  
   // device.getInfo({success:cb})
  },
  getWindowInfo(cb){
	 cb(uni.getWindowInfo());
  },
  
  util_toast(message = '', duration = 0,pagename='') {
    if (!message) return
	 duration = duration||2500;
	if(message.length>7 ){
		this.dispatchEvent(EventBus.EVE_TOAST_SHOW,{message:message,delay:duration,pagename:pagename});
	}else{
		uni.showToast({
			title: message,
			duration:duration,
		});
	}
  },
  log(...arg){
	  console.log(arg);
  },
  util_dialog(obj) {
    if (!obj) return
	 console.log('util_dialog 1',obj.pagename);
	if(!!obj.pagename){  //自定义模态弹框
		let dali_data={title:obj['title']||'',content:obj['message']||'',sub_title:obj['sub_title']||'',pagename:obj.pagename};
		if(obj.buttons) {
			if(obj.buttons[0]){
				dali_data.ok=obj.buttons[0].text;
			}
			if(obj.buttons[1]){
				dali_data.cancel=obj.buttons[1].text;
			}
		}
		if(!dali_data.ok) dali_data.ok=this.e18n('sure');
		dali_data.suc=obj.success||null;
		dali_data.fail=obj.cancel||null;
		return this.openDailog(dali_data);
	}
	
	
	if(obj.message) obj.content=obj.message;
	obj.showCancel=false;
	 console.log('util_dialog 2');
	if(obj.buttons) {
		if(obj.buttons[0]){
			obj.confirmText=obj.buttons[0].text;
		}
		if(obj.buttons[1]){
			obj.cancelText=obj.buttons[1].text;
			obj.showCancel=true;
		}
	}
	 console.log('util_dialog 3');
	if(obj.cancel){
		obj.fail=obj.cancel;
	}
	 console.log('util_dialog 4',obj);
	uni.showModal(obj);
    //prompt.showDialog(obj)
  },
  parse_uri_params(params){
	  if(params){
		  let _str_params="?";
		  for(var key in params){
			  _str_params+=(key+'='+params[key]+'&');
		  }
		  return _str_params;
	  }
	  return '';
  },
  
  util_router_push(uri,params=null){
	  console.log('util_router_push',uri)
    if(!uri) return ;
	let path = uri+'/index'+this.parse_uri_params(params)
	if(path.indexOf('/')!=0) path = '/'+path;
	let obj={animationType: 'none',url:path};
	let  is_main=(path.indexOf('video_case')>0 ||path.indexOf('video_lib')>0 ||path.indexOf('video_recomend')>0 ||path.indexOf('video_mine')>0  )
	 return is_main?uni.switchTab(obj):uni.navigateTo(obj);
  },
  util_router_replace(uri,params=null){
    if(!uri) return ;
	let path = '/'+uri+'/index'+this.parse_uri_params(params)
	uni.redirectTo({
		animationType: 'none',
		url:path
	});
    // router.replace({uri:uri,params:params});
  },
  goHome(){
	 return   uni.reLaunch({
		 animationType: 'none',
	  	url:"/"
	  })
  },
  util_router_back(){
	  uni.navigateBack({animationType: 'none'});
    // router.back();
  },
  util_router_state(){
   // return router.getState();
  },
  util_storage_get(key,def='',cb=null,ca=null){
	  uni.getStorage({key:key,success:(data)=>{cb(data||def)},fail:ca})
  },
  util_storage_set(key,val,cb=null,ca=null){
    uni.setStorage({key:key,data:val,success:cb||((data)=>{
      console.log('util_storage_set suc:',data)
    }),fail:ca||((data,code)=>{
      console.log('util_storage_set fail:',data,code)
    })});
  },
  util_storage_del(key,cb=null,ca=null){
	uni.removeStorage({key:key,success:cb,fail:ca});
    //storage.delete({key:key,success:cb,fail:ca});
  },
  util_storage_clear_all(cb=null,ca=null){
	 try {
	 	uni.clearStorageSync();
		if(cb) cb();
	 } catch (e) {
		if(ca) ca();
	 }
   // storage.clear({success:cb,fail:ca});
  },

  util_stroage_breakup(cb=null,ca=null){
   this.util_storage_get('www_kiseng_vip',null,(v)=>{
      storage_obj =v.data;
      cb(storage_obj);
       console.log('util_stroage_breakup',storage_obj)
    },(data,code)=>{
		//storage_obj =(v?JSON.parse(v):storage_obj);
		cb(storage_obj);
        console.log('util_stroage_breakup error',data,code)
    })
   
  },
  util_stroage_breakget(key,def=null){
    return storage_obj.hasOwnProperty(key)?storage_obj[key]:def;
  },

  util_stroage_breaksave(obj=null){
    if(storage_obj){
        console.log('util_stroage_breaksave 1 ',storage_obj,JSON.stringify(storage_obj))
        if(obj) storage_obj={...storage_obj,...obj};
        console.log('util_stroage_breaksave 2 ',storage_obj,JSON.stringify(storage_obj))
        this.util_storage_set('www_kiseng_vip',storage_obj,JSON.stringify(storage_obj));
        console.log('util_stroage_breaksave 3 ',storage_obj,JSON.stringify(storage_obj))
    }
  },

  getSmsType(){
    let appinitdata =$global.appinitdata;
    if(!appinitdata) return '';
    let type='sms';
	return type;
	
    switch (appinitdata.sms.plame_type){
        case '1':
            type='sms';
            break;
        case '2':
            type='sms';
            break;
        case '3':
            type='email'
            break;
        default :
            type='sms';
            break;
    }
    return type;
  },
  
  getClipBoard(cb,err){
	  uni.getClipboardData({
	  	success:cb,
		fail:err,
	  })
  },
  setClipBoard(str,cb){
	uni.setClipboardData({
		data: str,
		success: cb})  
  },
  openRedWindow(data){
	  this.openWindow(EventBus.EVE_REDBAG,data)  
  },
  openDailog(data){
	  console.log('openDailog',data);
	  this.openWindow(EventBus.EVE_DIALOG,data)  
  },
  openWindow(type,data){
	  if(!type || !data) return ;
	  data['type']=type;
	  this.dispatchEvent(EventBus.EVE_WIND_OPEN,data);
  },
  getShareUrl(){
	  let share_url='';
	  // #ifdef APP
			share_url= $global.appinitdata.share;
	  // #endif
	  // #ifdef H5
			share_url=this.getBaseUrl();
	  // #endif
	   share_url+=(share_url.indexOf('?')>-1)?'&':'?';
	   share_url+="share_id="+(this.getUid()||0);
	  return share_url;
  },
  getLanguage(){
	  let language='zh-CN';
	  if($global.appinitdata) return $global.appinitdata.laguage_type || language;
	  return language;
  },
  isChinese(){
	  return this.getLanguage() =='zh-CN';
  },
  coinName(){
    let coin='看点';
    if($global.appinitdata) return $global.appinitdata.coin_name || coin;
    return coin;
  },
  
  getInitDataCb(cb){
    if($global.appinitdata){
      cb($global.appinitdata);
    }else{
		 let eve_key="init_data_event";
		 if(!this.hasEvent(eve_key)){
			 $apis.appInit(res=>{
			       $global.appinitdata =res;
				   this.dispatchEvent(eve_key,res);
				   this.removeEventListener(eve_key);
			   },err=>{
			   });
		 }
		 this.addEventListener(eve_key,cb);
    }
  },
  getInitData(){
	  return $global.appinitdata || "";
  },
  getPrivacyUri(){ return $global.appinitdata && $global.appinitdata && $global.appinitdata.user_agreement},
  getAgreementUri(){ return $global.appinitdata && $global.appinitdata && $global.appinitdata.user_terms },
  
  
  checkMail(mailStr){
    let emailPat=/^(.+)@(.+)$/;
    let matchArray=mailStr.match(emailPat);
    return matchArray!=null;
  },
  checkPhone(phoneStr){
    return /^1[1-9]\d{9}$/.test(phoneStr)
  },
  checkIDNum(idnum){
    var idreg=/^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}([0-9]|x|X)$/;
    return idreg.test(idnum)
  },
  setLoginData(res){
	console.log('login data is setted',zid);
    storage_obj.user_info={...storage_obj.user_info,...res,...this.defaultUsInfo()}; //cover it 
	console.log('login data is setted2 ',storage_obj.user_info)
	this.dispatchEvent(EventBus.EVE_LOGINED,res);
    this.util_stroage_breaksave();
  },
  loginOut(){
    if(this.isLogin()){
        storage_obj.user_info=this.defaultUsInfo();	
        this.util_stroage_breaksave();
    }
  },
   isInWx(){
	   console.log('isInWx 1')
		 console.log('isInWx 2')
		 // if(window && window.navigator && window.navigator.userAgent){
			//  return (/MicroMessenger/.test(window.navigator.userAgent))
		 // }
		  let agent=this._window_user_agent();
		   console.log('isInWx 2a',agent)
		  if(!!agent) return (/MicroMessenger/.test(agent))
		  console.log('isInWx 3')
         return false;
      },
  wx_login(istry=false){  // 仅h5 
		  console.log('wx_login 0')
		  if(!this.isInWx()) return ;
          if(this.isLogin()) return;
		  console.log('wx_login 1')
		  if(this.hasWxGzh()){
			  //注意事项：回调地址必须要在公众号里进行配置回调地址才会生效
			  
			  let  code = this.getUrlParam('code') // 截取路径中的code，如果没有就去微信授权，如果已经获取到了就直接传code给后台获取openId
			   console.log('wx_login 2',code)
			  if (!code || code=="invalid") {
				  console.log('wx_login 3')
			      this.re_plicy();
			  } else {
				  console.log('wx_login 4')
			  			  if(code =="kiseng") // 未配置公众号
			  			  {
							   console.log('wx_login 5')
			  				  if(!istry) this.util_router_push('pages/usr_login');
			  			  }else{
								console.log('wx_login 6')
							  this.setUrlParam('code','invalid');
			  				  this.getOpenId(code) //把code传给后台获取用户信息
			  			  }
			  }
		  }else{
			  console.log('wx_login 7')
			   if(!istry) this.util_router_push('pages/usr_login');
		  }
      },
	  wx_share(){
		   if(!this.isInWx()) return ;
		   if(!this.hasWxGzh()) return ;
		   $apis.wxjssdk(document.location.href,(res)=>{
			   let jwx =require('jweixin-module')
			   jwx.config(res.jssdk);
			   jwx.checkJsApi({
				   jsApiList: res.jssdk.jsApiList, // 需要检测的JS接口列表，所有JS接口列表见附录2,
				   success: function (res) {
					   console.log('wxjssdk chckJsapi',res);
					   // 以键值对的形式返回，可用的api值true，不可用为false
					   // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
				   }
			   });
			   jwx.ready(() => {   //需在用户可能点击分享按钮前就先调用
			    console.log('wxjssdk ready ok');
				   jwx.updateAppMessageShareData({
					   title: res.share.sharetitle, // 分享标题
					   desc: res.share.sharedescribe, // 分享描述
					   link: res.share.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
					   imgUrl: res.share.sharepic, // 分享图标
					   success: () => {
						   // 设置成功
						    console.log('wxjssdk updateAppMessageShareData ok');
					   }
				   })
				   jwx.updateTimelineShareData({
				   					   title: res.share.sharetitle, // 分享标题
				   					   link: res.share.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
				   					   imgUrl: res.share.sharepic, // 分享图标cnpm
				   					   success: () => {
				   						   // 设置成功
										   console.log('wxjssdk updateTimelineShareData ok');
				   					   }
				   })
			   });
			   
		   },(err)=>{
			   console.error('wx_share err',err);
		   })
		
	  },
	login(cb,ca){
		  console.log("mp weixin2 login ");
		   if(this.isLogin()) return;
		// #ifdef MP-WEIXIN
				console.log("mp weixin login ");
			return this.wxmp_login(cb,ca)
		// #endif	
		// #ifdef H5
			if(this.isInWx()){
					console.log("weixinh5  login ");
				return this.wx_login();
			}
		// #endif
			return this.util_router_push('pages/usr_login');
	  },
	  
	  wxmp_login(cb,ca){
		  console.log('wxmp_login')
		  wx.login({success:(res)=>{
				  if (res.code) {
					//发起网络请求
							this.getOpenId(res.code,cb);
				  } else {
					console.log('登录失败！' + res.errMsg)
							ca();
				  }
			}
		  })
	  },
	  makeLocalUrl(path){
		  return this.getBaseUrl()+"/#/"+path;
	  },
	  getBaseUrl(){
			return $apis.getBaseUrl()  
	  },
      re_plicy(){
		  // #ifndef H5
			 console.error('currnet sence is not h5 but re_plicy!')
			 return false;
		  // #endif
          var cur_local=window.location.href;
          window.location.href = $apis.getBaseUrl()+'/api/wechat_official' +
              '?redirect_uri=' + encodeURIComponent(cur_local) +
              '&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect'
      },
      getOpenId(code,cb=null) { // 通过code获取 openId等用户信息，/api/user/wechat/login 为后台接口
			let type=this.getSenceType();
          $apis.getOpenId({code:code,type:type},
		  res=>{ 
			  this.setLoginData(res)
			  cb && cb(res);
		  },
          res=>{
              console.log("b");
              console.log(res);
              this.re_plicy();
          })
      },
      getUrlParam(name) {//封装方法
		  if($global.urlParam && $global.urlParam[name]) return $global.urlParam[name];
		  return this.getUrlSearchParam(window.location.search,name)
      },
	  getUrlSearchParam(serach,name){
		  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		  var r = serach.substr(1).match(reg); //匹配目标参数
		  if (r != null) return unescape(r[2]);
		  return null; //返回参数值
	  },
	  setUrlParam(name,value) {
		  let obj = $global.urlParam ||{};
		  obj[name]=value;
		  $global.urlParam=obj;
	  },
	
  isLogin(){
	  console.log('is login: ',storage_obj.user_info && storage_obj.user_info.access_token)
      return !!(storage_obj.user_info && storage_obj.user_info.access_token) 
  },
  isVip(){
      return !!(storage_obj.user_info && (storage_obj.user_info.is_vip==1)) 
  },
    isInPassing(){
      let res = this.getInitData();
	  let _init=false;
  		if(res && res.options){
  			// #ifdef MP-WEIXIN
  				if(res.options.CHECKING_WXMP) _init=true;
  			// #endif
  			// #ifdef QUICKAPP-WEBVIEW
  				if(res.options.CHECKING_QUICK) _init=true;
  			// #endif
			// #ifdef APP
				if(res.options.CHECKING_APP) _init=true;
			// #endif
  		}
      return !!_init;
    },
    getRid(){
		if(storage_obj && storage_obj.user_info && storage_obj.user_info.rid) return storage_obj.user_info.rid;
		let  rid = uni.getLaunchOptionsSync().query.rid;
		// #ifdef H5
			console.log('Get rid:: ',rid,window,window.location,window.location.search)
		// #endif
		return rid || (Date.now()+''+Math.ceil(Math.random()*1000)).slice(2);
    },
	getLaunch(){
		return  (storage_obj && storage_obj.user_info && storage_obj.user_info.launch) || '';
	},
	getInitStaus(){
	       let ret=1;
		     return ret;
	      switch(PASSING_LEVEL){
	          case 0:
	            ret=1;
	            break;
	          case 1:
	          case 2:
	          default:
	            ret = this.isInPassing()? 2:1;
	            break;
	      }
	      console.log('getInitStaus',ret,this.isInPassing())
	      return ret;
	},
		
	getShareId(){
		return (this.getLaunch() && this.getLaunch().share_id)||"";
	},
	getGeneralize(){
		return (this.getLaunch() && this.getLaunch().generalize)||"";
	},
    getToken(){
      return  (storage_obj && storage_obj.user_info && storage_obj.user_info.access_token) || '';
    },
    getUid(){
      return  (storage_obj && storage_obj.user_info && storage_obj.user_info.id) || '';
    },
	getSiteName(){
		return ($global.appinitdata && $global.appinitdata.name )||""
	},
    getUserinfo(){
       return  (storage_obj && storage_obj.user_info) || this.defaultUsInfo();
    },
    defaultUsInfo(){
		return {rid:this.getRid(),launch:this.getLaunch()};
    },
	createfornew(){
		console.log('createfornew 1')
		let make_lanch=(cb)=>{
			// #ifdef H5
					cb(uni.getLaunchOptionsSync().query);
			// #endif
			// #ifdef APP
					  uni.getClipboardData({
						success: res=>{
							{
								if(!!res.data){
									let launch={};
									let items=res.data.substr(1).split('&');
									items.forEach(item=>{
										let kvs=item.split('=');
										launch[kvs[0]]=kvs[1];
									})
									cb(launch);
								}else{
										cb(null);
										console.log('getClipboardData null',res.data);
								}
							}
						},
						fail:()=>{
							cb(null);
							console.log('getClipboardData fail',res.data);
						}
					  });
			// #endif
		};
		make_lanch((launch)=>{
			storage_obj.user_info=this.defaultUsInfo();
			storage_obj.user_info.launch=launch||'';
			this.util_stroage_breaksave({isnew:true});
		})
	},
	
    updateUserinfo(cb=null){
        let retFc=(usinfo)=>{
            if(!this.isLogin()){
              delete(usinfo['access_token']) ;
              delete(usinfo['nickname']) ;
              delete(usinfo['avatar']) ;
            }
          if(usinfo) this.setLoginData(usinfo);
          if(cb) cb(usinfo)
        }
        (this.isUnloginAble())?$apis.userinfo(retFc):retFc(this.getUserinfo())
    },
	

  todayReadTime(){
      let baseinfo=storage_obj.user_info;
      if(baseinfo){
          baseinfo.read_time = baseinfo.read_time ||0;
          baseinfo.read_time_seconds=baseinfo.read_time_seconds||(baseinfo.read_time *60);
          return  baseinfo.read_time_seconds;
      }
      return 0;
  },
  addReadTime(seconds){
    let baseinfo=storage_obj.user_info;
    if(baseinfo){
        baseinfo.read_time_seconds+=seconds;
    }
  },
	
 hasRewardVideo(){
	 console.log('hasRewardVideo true')
	 return true;
 },
  hasVipOption(){
      let appinitdata=$global.appinitdata;
	  if(!appinitdata) {
		  return false;
	  }
      let vipOption=appinitdata.options['VIP'];
      return vipOption==1;
  },
  hasWXModelOption(){
      let appinitdata=$global.appinitdata;
  	   if(!appinitdata)  return false;
      let value=appinitdata.options['WX_MODEL'];
      return value==1;
  },
  hasWxGzh(){
	 let appinitdata=$global.appinitdata;
	 if(!appinitdata)  return false;
	 return !!appinitdata.wechat_official_appid && this.hasWXModelOption();
  },
  alipay(orderInfo,cb,ca){
	  // #ifdef APP
	  uni.requestPayment({
	      provider: 'alipay',
	      orderInfo: orderInfo, //微信、支付宝订单数据 【注意微信的订单信息，键值应该全部是小写，不能采用驼峰命名】
	      success: cb,
	      fail: ca,
	  });
	  // #endif
	  
	  // #ifdef H5
		  const div = document.createElement('div');
		  div.innerHTML =orderInfo
		  document.body.appendChild(div)
		  document.forms[0].submit()
	  // #endif
  },
  wxpay(obj,suc,fail){
		console.log('wxpay',obj,JSON.stringify(obj));
	  // #ifdef H5
			if(this.isInWx()){
				WeixinJSBridge.invoke(
				    'getBrandWCPayRequest', {
				        "appId": obj.appId,     //公众号名称，由商户传入
				        "timeStamp": obj.timestamp,         //时间戳，自1970年以来的秒数
				        "nonceStr": obj.nonceStr, //随机串
				        "package": obj.package,
				        "signType": obj.signType,         //微信签名方式：
				        "paySign": obj.paySign, //微信签名
				    }, res => {
				        if (res.err_msg == "get_brand_wcpay_request:ok") {
				            suc();
				        }else{
							fail();
						}
				    }
				);
			}else{
				window.location.href = obj.mweb_url
			}
	  // #endif
	  
	  // #ifdef MP
	  // 小程序 
			uni.requestPayment({
			    provider: 'wxpay',
				timeStamp: obj['timestamp'],
				nonceStr: obj['nonceStr'],
				package: obj['package'],
				signType: obj['signType'],
				paySign: obj['paySign'],
				success: suc,
				fail: fail
			});
	  // #endif
		// #ifdef APP
		//APP
			uni.requestPayment({
			    "provider": "wxpay", 
			    "orderInfo": obj,
			    success:suc,
			    fail:fail
			})
		// #endif
   // return wxpay.pay(obj);
  },
  getSenceType(){
	  /**
	   *     const SENCE_TYPE_H5="H5";       //H5支付
				const SENCE_TYPE_APP="APP";     //APP支付
				const SENCE_TYPE_GZH="GZH";     //公众号
				const SENCE_TYPE_WXMP="WX_MP";  //小程序
	   */
		// #ifdef H5
				console.log('getSenceType H5',this.isInWx());
				return (this.isInWx() && this.hasWxGzh())?"GZH":"H5";
		// #endif
		// #ifdef MP-WEIXIN
		// 小程序 
				console.log('getSenceType MP',this.isInWx());
				return "WX_MP";
		// #endif
		// #ifdef APP-PLUS
				//APP
				console.log('getSenceType APP',this.isInWx());
				return "APP";
		// #endif
		return "--"
  }
  ,
  isIOSH5(){
	 let agent=this._window_user_agent();
	 if(!!agent){
		 if(/iPhone|iPad|iPod/.test(agent)) {
			 console.log("isIOSH5:: ",agent)
			 return true;
		 }
	 }
	 return false;
  },
  _window_user_agent(){
	  // #ifdef H5
		  let userAgent= (window && window.navigator && window.navigator.userAgent) || (window && window.navigator && window.navigator.vendor) || (window && window.opera)
		  return userAgent;
	  // #endif
	  return null;
 },
  
  getCurPage(){
	  let pages = getCurrentPages();          // 获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面  
	  let page = pages[pages.length - 1];
	  console.log('getcurrentpages:: ',pages,page);
	  return page;
  },
  getCurRoute(){
	  return this.getCurPage() && this.getCurPage().route;
  },
  addStudyTime(seconds){
	  this.api().addStudyTime(seconds,()=>{},()=>{});
  },
  time(initsec=true){
	  let  timestamp = Math.round(new Date());
	  if(initsec) timestamp=Math.floor(timestamp/1000);
	  return timestamp;
  },
  addEventListener(type,listener){
  	 if(!_dic[type]) _dic[type]=new Array();
  	 if(_dic[type].indexOf(listener)<0)  _dic[type].push(listener);
  },
  removeEventListener(type,listener=null){
  	if(!!_dic[type]){
  		if(listener){
			let index=_dic[type].indexOf(listener);
			if(index>=0) _dic[type].splice(index,1);
		}else{
			_dic[type]=null;
		}
  	}
  },
  dispatchEvent(type,data=null){
  	console.log('dispatchEvent 1',type)
  	if(!!_dic[type]){
  		console.log('dispatchEvent 2',_dic[type])
  		_dic[type].forEach(item=>item(data));
  	}
  },
  hasEvent(type){
	  return !!_dic[type];
  }
}
export  default _ut;
