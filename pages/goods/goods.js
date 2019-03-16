var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var WxAutoImage = require('../../WxAutoImage/WxAutoImage.js');
Page({
  data:{
    indicatorDots: true,
    autoplay: true,
    interval: 1000,
    duration: 1000,
    loaded: false,
    "imageWidth" : 0 ,
    "imageheight" : 0
  },
  onLoad:function(options){
     this.goods_id = options.goods_id;
    //  wx.showNavigationBarLoading();
     this.baseApiUrl = util.config('baseApiUrl'); 
     this.goodsDetail(options.goods_id);
     //this.doneOrderBanner();
      //console.log(options);
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
   //监听用户下拉动作
  onPullDownRefresh:function() {
    this.goodsDetail(this.goods_id);
  },
  goodsDetail:function(goods_id){

     this.loadding();
     var url = this.baseApiUrl + "?g=Api&m=Goods&a=detail&goods_id=" + goods_id;
     var self = this;
     util.ajax({
        url : url,
        success : function(data){
            self.loaded();
            if(data.result == 'ok') {
              self.setData({
                goods : data.goods,
                gallery : data.gallery,
                wxParseData : WxParse.wxParse('goods_desc', 'html', data.goods.goods_desc, self, 5)//WxParse('html',data.goods.goods_desc)
              });
              self.setData({loaded:true});
            } else {
               self.error(data);
            }
        }
     });
  },

 loadding:function() {
    this.setData({loaded:false});
 },
 loaded : function() {
    this.setData({loaded:true});
 },
 error:function(data) {
    data.url = '../index/index';
    if(data['result'] == 'fail') {
      this.setData({
        error : data
      });
    } else {
       //console.log('接口获取数据错误！！！');
    }
  },
  cusImageLoad: function (e){
    var that = this;
    that.setData(WxAutoImage.wxAutoImageCal(e));
  },
  onShareAppMessage: function () {
    return getApp().share({title : this.data.goods.goods_name,desc : this.data.goods.goods_name,path : "pages/goods/goods?goods_id=" + this.goods_id});
  }
})