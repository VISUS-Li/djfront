import  zh from "./i18ndd/zh";
import en from "./i18ndd/en";


export default function(laguage,key,arg=''){
        let keys=key.split('.');
        let idx=0;
        let jsonData=''
		let lang = ({'zh-CN':zh,'en':en}[laguage]);
        while(idx<keys.length){
                jsonData=(jsonData?jsonData:lang)[keys[idx]];
                idx++;
        }
        if(arg){
                for(let  key in arg){
                        let value=arg[key];
                        jsonData = jsonData.replace('{'+key+'}',value); 
                }
        }
		let ret =  jsonData || key;
        return ret;
}