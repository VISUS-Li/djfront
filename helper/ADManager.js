
const _df ={
	rewardAdContent:null,
	rewardAdID:'adunit-f4689f9e594ecd21',
	init(){
		
	},
	reward_init(){
		this.rewardAdContent=null;
		if (wx.createRewardedVideoAd ) {
		  this.rewardAdContent = wx.createRewardedVideoAd({
		    adUnitId: this.rewardAdID
		  })
		}
	},
	showReward(completed,cancel){
		if(!this.rewardAdContent) this.reward_init();
		this.rewardAdContent.onLoad(() => { console.log('rewarAd Loaded Sucess!')})
		this.rewardAdContent.onError((err) => { 
			console.log('rewardAd Load Err',err,JSON.stringify(err))
			this.clear()
			});
		 this.rewardAdContent.onClose((res) => {
			res.isEnded?(completed && completed()):(cancel && cancel())
			this.clear()
		})
		this.rewardAdContent.show().catch(() => {
		    // 失败重试
		    this.rewardAdContent.load()
		      .then(() => this.rewardAdContent.show())
		      .catch(err => {
		        console.log('激励视频 广告显示失败')
				this.clear()
		      })
		  })
	},
	clear(){
		if(!!this.rewardAdContent){
			this.rewardAdContent.offClose()
			this.rewardAdContent.offError()
			this.rewardAdContent.offLoad()
		}
		this.rewardAdContent=null;
	}
};

export default _df;