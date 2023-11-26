<script>
	import Main from '@/helper/Main.js'
	import $utils from '@/helper/utils.js';
	export default {
		globalData: {  
		            util:$utils,
					isnew:false,
					text:'kiseng',
					muted:false, // video muted play 
		        },
		onLaunch: function() {
			// #ifdef H5
				this.globalData.muted=true;  
			// #endif
			 $utils.init_lize();
			 $utils.util_stroage_breakup((obj)=>{
						console.log('app create 2',obj,JSON.stringify(obj));
					    let isnew= this.globalData.isnew = !obj.user_info;
			            if(isnew){
							$utils.createfornew();
							//--
			            }
						$utils.getInitDataCb((initdata)=>{
							$utils.init_ready();
							//--
						})
			      })
				  console.log('app onLaunch 3');
		},
		onShow: function() {
			console.log('app show 1')
			$utils.getInitDataCb((initdata)=>{
				$utils.keeptabBarTxt()
				console.log('app show 2')
			})
		},
		onHide: function() {
			console.log('App Hide')
		},
		beforeCreate() {
			// #ifdef APP
				const domModule = uni.requireNativePlugin('dom')
				domModule.addRule('fontFace', {
					'fontFamily': "mysiconfont",
					//at.alicdn.com/t/c/font_3763261_lgl530nyjua.ttf?t=1688547288330
					'src': "url('http://at.alicdn.com/t/c/font_3763261_r0g98ouybji.ttf?t=1689221202968')"
				});
			// #endif
		}
	}
</script>

<style lang="less" scoped>
	page{
		background-color:#1a1a1a;
	}
	/* .my-iconfont {
			font-family:appiconfont;
			font-size:60rpx;
			color: #00AAFF;
		}
		 */

	/*每个页面公共css */
	  /* #ifdef H5 */ 
	    /* uni-page-head { display: none; } */
	    /* #endif */
</style>
