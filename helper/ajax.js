/**
 * 封装了一些网络请求方法，方便通过 Promise 的形式请求接口
 */
import $fetch from '@system.fetch'
// import $utils from './utils'

const TIMEOUT = 20000

Promise.prototype.finally = function(callback) {
  const P = this.constructor
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason =>
      P.resolve(callback()).then(() => {
        throw reason
      })
  )
}
		
function headerHandle(params){
          if(params){
              let _params={
                url: params.url,
                method: params.method,
                data: {...params.data,...{'client_type':'quickapp'}},
                header:params.header||{ 'Content-Type': 'application/json;charset=UTF-8'},
              }
              let  token =$utils.getToken()
              let  generalize =''// uni.getStorageSync('generalize')
              if (token) { // 判断是否存在token，如果存在的话，则每个http header都加上token
                  _params.header.Authorization = 'Bearer ' + token;  //请求头加上token
              }
              if (generalize) {
                _params.header.Generalize = generalize;
              }
              params=_params;
			  console.log('header params:',params);
          }
          return params;
}

/**
 * 调用快应用 fetch 接口做网络请求
 * @param params
 */
function fetchPromise(params) {
  return new Promise((resolve, reject) => {
	  console.log('header paramss1:',params);
    let fetch_data= headerHandle(params);
    $fetch
      .fetch(fetch_data)
      .then(response => {
        const result = response.data
        const content_type=result.headers['Content-Type'];
        console.log(content_type)
        //application/json
        //text/html; charset=UTF-8
        let content =result.data;
        if(content_type.indexOf('application/json')>-1){
           content =JSON.parse(result.data)
        }
        //(response.header['Content-Type'].indexOf('json')>-1)?JSON.parse(result.data):JSON.parse(result.data);
        /* @desc: 可跟具体不同业务接口数据，返回你所需要的部分，使得使用尽可能便捷 */
        resolve(content);
      })
      .catch((error, code) => {
        console.log(`🐛 request fail, code = ${code}`)
        reject(error)
      })
      .finally(() => {
        console.log(`✔️ request @${params.url} has been completed.`)
        resolve()
      })
  })
}

/**
 * 处理网络请求，timeout 是网络请求超时之后返回，默认 20s 可自行修改
 * @param params
 */
function requestHandle(params, timeout = TIMEOUT) {
  try {
    return Promise.race([
      fetchPromise(params),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('网络状况不太好，再刷新一次？'))
        }, timeout)
      })
    ])
  } catch (error) {
    console.log(error)
  }
}

export default {
  post:  function(url, params,header='') {
    return requestHandle({
      method: 'post',
      url: url,
      data: params,
      header:header
    })
  },
  get: function(url, params,header='') {

    return requestHandle({
      method: 'get',
      url: $utils.queryString(url, params),
      header:header
    })
  },
  put: function(url, params,header='') {
    return requestHandle({
      method: 'put',
      url: url,
      data: params,
      header:header
    })
  }
  // 如果，method 您需要更多类型，可自行添加更多方法；
}
