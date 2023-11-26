/**
 * @desc 在实际开发中，您可以将 baseUrl 替换为您的请求地址前缀；
 *
 * 已将 $apis 挂载在 global，您可以通过如下方式，进行调用：
 * $apis.example.getApi().then().catch().finally()
 *
 * 备注：如果您不需要发起请求，删除 apis 目录，以及 app.ux 中引用即可；
 */
import config from '../../config.js';
const baseUrl =config.url;
let util='';

	function 	getBaseUrl() {
		if ( util.isdebug()) {
			return baseUrl;
		}
		let _base_url = baseUrl;
		// #ifdef H5
			_base_url = 'http://' + window.location.host;
		// #endif
		return _base_url;
	}
	
	function responseHandle(res) {
		res = res.data;
		if (res.code != 200) {
			// wrong handle
			switch (res.code) {
				case 401: //未登录
					 util.login();
					break;
				default:
					 util.util_toast( (res.code + (res.message || res.msg)));
					console.log(res)
					break;
			}
		}
		return res.code != 200;
	}
	
	function request_err(err) {
		console.log(`🐛 request fail, err = ${err}`+JSON.stringify(err))
	}
	function  _post(url, data, cb = "", ca = "") {
		 console.log('api _post: ',url)
		let path =  getBaseUrl() + url;
		uni.request({
			url: path,
			method: 'POST',
			data: data,
			header:make_header(data),
			success: (res) => {
				 responseHandle(res) ? ca(res.data.message) : cb(res.data.data)
			},
			fail:  request_err
		});
	}
	 function make_header(data = null) {
		 
		if (!data) data = {};
		let header = data.header || {
			'Content-Type': 'application/json;charset=UTF-8'
		};
		let token =  util.getToken()
		let generalize =  util.getGeneralize()
		let share_id =  util.getShareId()
		let rid =  util.getRid();
		let source =  util.getSenceType();
		if(source) header.source = source;
		if (token) header.Authorization = 'Bearer ' + token; //请求头加上token // 判断是否存在token，如果存在的话，则每个http header都加上token
		if (generalize) header.Generalize = generalize;
		if(share_id) header.share_uid = share_id;
		if(rid &&  util.isPreLoginMode())header.meid = rid;
		// console.log("api isPreLoginMode: ",util.isPreLoginMode(),JSON.stringify(header))
		return header;
	}
	
	
	 function _get(url, data = '', cb = '', ca = '') {
		console.log('api _get: ',url)
		let path =  getBaseUrl() + url;
		uni.request({
			url: path,
			method: 'GET',
			data: data,
			header:  make_header(data),
			success: (res) => {
				 responseHandle(res) ? ca(res.data.message) : cb(res.data.data)
			},
			fail:  request_err
		});
	}
	 function _text(url, data = '', header = '', cb = '', ca = '') {
		let path = (url.indexOf('http') == 0) ? url :  getBaseUrl() + url;
		uni.request({
			url: path,
			method: 'GET',
			data: data,
			header: header,
			dataType: 'text',
			success: cb,
			fail:  request_err
		});
	}
	
export default {
	setUtil(ut){
		console.log('setUtil')
		util=ut;
	},
	getBaseUrl,
	
	/**
	 * 初始化
	 */
	appInit(cb = '', ca = '') {
		console.log('api appinit', util, util.isdebug);;
		 _post('/api/common/appinit', null, cb, ca);
	},
	
	/**
	 * 发送短信
	 */
	sendSms(mobile, type, cb, ca = '') {
		 _post("/api/common/sms_send", {
			mobile: mobile,
			type: type,
		}, cb, ca)
	},
	getOpenId(data, cb, ca) { // 通过code获取 openId等用户信息，/api/user/wechat/login 为后台接口
		 _post('/api/wechat_official_account_login', data, cb, ca)
	},
	upLoadFile(file, then, catche) {

	},
	userinfo(cb, ca) {
		 _get('/api/user_info', null, cb, ca);
	},
	
	
	customService(cb, ca) {
		 _get('/api/person/contact', null, cb, ca);
	},
	
	getHobby(cb, ca) {
		 _post('/api/user/hobby', null, cb, ca)
	},
	setHobby(issex, cids, cb, ca) {
		 _post('/api/user/save_hobby', {
			issex: issex,
			cids: cids,
		}, cb, ca);
	},

	wxjssdk(url, cb, ca) {
		 _post('/api/wechat/jssdk', {
			url: url
		}, cb, ca)
	},
	
	rechangeBaseInfo(cb, ca) {
		_get('/api/charge/base_info', null, cb, ca);
	},
	createPayOrder(charge_id, pay_type, scene, anime_id, chap, return_url, cb, ca) {
		this.createPayOrderWithData({
			charge_id: charge_id,
			pay_type: pay_type,
			scene: scene,
			anime_id: anime_id,
			chap: chap,
			return_url: return_url
		}, cb, ca);
	},
	createPayOrderWithData(params, cb, ca) {
		_post('/api/charge/create_order', params, cb, ca);
	},
	createVipPayOrderWithData(params, cb, ca) {
		 _post('/api/vip/create_order', params, cb, ca);
	},
	
	vipBaseinfo(cb, ca) {
		 _post('/api/vip/base_info', null, cb, ca)
	},
	financelist(page, pageSize, cb, ca) {
		 _get('/api/person/finace_list', {
			page: page,
			page_size: pageSize,
		}, cb, ca)
	},	
	
	uploadFile(filePath, data, cb, ca){
		uni.uploadFile({
			url:  getBaseUrl() + '/api/common/uploadFile',
			header:  make_header(data),
			filePath:filePath,
			name:'targetFile',
			success: (res) => {
				res.data=JSON.parse(res.data);
				cb(res.data)
			},
			fail: (err) => {
				console.log(`handling fail,` + JSON.stringify(err))
				ca(err);
			}
		})
	},
	
	pay_chapter(id, chaps, cb, ca) {
		 _post('/api/course/pay_chapter', {
			id: id,
			chap: chaps,
		}, cb, ca)
	},
	pay_chapter_by_reward(anime_id, chaps, cb, ca) {
		 _post('/api/bookstores/pay_chapter', {
			anime_id: anime_id,
			chaps: chaps,
			type:'reward',
		}, cb, ca)
	},
	
	/** 剧场主页接口
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	courseList(cb, ca){
		 _get('/api/home/course', null, cb, ca);
	},
	/**推荐页接口
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	recomends(cb, ca){
		 _get('/api/home/recomend', null, cb, ca);
	},
	/**
	 * 收藏追剧
	 * @param {Object} id
	 * @param {Object} stus
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	setCollects(id, stus,cb, ca) {
		 _post('/api/course/collect', {
			course_id: id,
			status:stus,
		}, cb, ca)
	},
	getCollects(page, page_size, cb, ca) {
		 _get('/api/course/collect_list', {
			page: page,
			page_size: page_size,
		}, cb, ca);
	},
	
	/**
	 * 搜索
	 * @param {Object} keyword
	 * @param {Object} page
	 * @param {Object} page_size
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	search(keyword, page, page_size, cb, ca) {
		 _get('/api/course/search', {
			keyword: keyword,
			page: page,
			page_size: page_size,
		}, cb, ca);
	},
	/**
	 * 换一换 推荐 
	 */
	changeGuess(cb = '', ca = '') {
		 _get('/api/course/guess', {
		}, cb, ca);
	},
	
	/**
	 * 看剧历史记录
	 * @param {Object} page
	 * @param {Object} pageSize
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	getHistory(page, pageSize, cb, ca) {
		 _get('/api/course/history_list', {
			page: page,
			page_size: pageSize
		}, cb, ca);
	},
	addHistory(id, chapter, cb, ca) {
		 _post('/api/course/history', {
			course_id: id,
			chap: chapter,
		},cb, ca);
	},
	
	/**选集接口
	 * @param {Object} id
	 * @param {Object} step
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	getSubsInfo(id,step,cb,ca){
		_get('/api/course/course_subs_info', {
			course_id: id,
			step: step,
		},cb, ca);
	},
	/**
	 * 看剧接口
	 * @param {Object} id
	 * @param {Object} chap
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	getCourseInfo(id,chap,cb,ca){
		_get('/api/course/info', {
			course_id: id,
			chap: chap,
		},cb, ca);
	},
	
	/**
	 * 用户基本信息更新接口
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	personal(cb,ca){
		_get('/api/person/base_info', {
		},cb, ca);
	},
	/**
	 * 充值页接口
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	rechangeBaseInfo(cb,ca){
		_get('/api/vip/charge_info', {
		},cb, ca);
	},
	/**
	 * 签到接口
	 * @param {Object} coin
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	welfareCheckin(coin, cb, ca) {
		 _post('/api/person/sign', {
			coin: coin
		}, cb, ca);
	},
	/**
	 * 签到页信息接口
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	welfareBaseInfo(cb, ca) {
		 _get('/api/person/welfare', null, cb, ca)
	},
	/**
	 * 邀请页接口
	 * @param {Object} user_id
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	getInviteRules(user_id, cb, ca) {
		 _get('/api/person/invitation', {
			user_id: user_id,
		}, cb, ca);
	},
	
	/**增加看剧时长   
	 * @param {Object} seconds 秒
	 * @param {Object} cb
	 * @param {Object} ca
	 */
	addStudyTime(seconds,cb, ca){
		 _post('/api/course/user_study_time', {time:seconds}, cb, ca);
	},

	//注销
	logOff(cb,ca=''){
	         _post('/api/logoff',null,cb,ca);
	    },
	/**
	 * 退出登录
	 */
	logout(cb, ca = '') {
		 _post('/api/logout', null, cb, ca);
	},
	
	//验证码登录
	quickLogin(data, cb, ca) {
		 _post("/api/quick_login", data, cb, ca);
	},
	text(url,cb,ca){
		return _text(url,{},{},cb,ca)
	},
	
	
	//
	is_subcribe_wechat_mp(cb, ca) {
		 _post('/api/user/is_subscribe_wechat_mp', null, cb, ca);
	},
	subcribe_wechat_mp(scene, scene_data, cb, ca) {
		 _post('/api/user/wechat_subscribe_qrcode', {
			scene: scene,
			scene_data: scene_data
		}, cb, ca);
	},
	freeBooks(page, pageSize, cb, ca = '') {
		 _get('/api/h5/free', {
			page: page,
			pageSize: pageSize
		}, cb, ca)
	},
	serailBooks(page, pageSize, cb, ca = '') {
		 _get('/api/h5/serial', {
			page: page,
			pageSize: pageSize
		}, cb, ca)
	},
	finishedBooks(page, pageSize, cb, ca = '') {
		 _get('/api/h5/finished', {
			page: page,
			pageSize: pageSize
		}, cb, ca);
	},
}
