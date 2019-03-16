var util = require('../../utils/util.js');
var WxAutoImage = require('../../WxAutoImage/WxAutoImage.js');
Page({
  data:{
      "URL" : 1,
      indicatorDots: false,
      autoplay: true,
      interval: 2500,
      duration: 1000,
      loaded: false,
      "is_over" : false,
      "no_data" : false,
      "goods_img" : {
        "imageWidth" : 0,
        "imageheight" : 0
      },
      "banner_img" : {
        "imageWidth" : 0,
        "imageheight" : 0
      },
      "nav_scroll_left" : 0
  },
  onLoad:function(options){
     //console.log(3);
     //wx.showNavigationBarLoading();
     this.getConfig();
     this.getMap();
     this.goodsCate();
     this.bannerList();
    // 页面初始化 options为页面跳转所带来的参数
  },
    //配置方法
  getConfig:function() {
     this.baseApiUrl = util.config('baseApiUrl'); 
     this.size = util.config('page_size');
     this.offset = util.config('page_offset');
     this.page = 1;
  },
  //获取地区
  getMap:function() {
    var userMap = wx.getStorageSync('userMap');
     if(userMap &&　userMap != undefined) {
        this.setData({"address_info" : userMap.city});
     } else {
        var self = this; 
        wx.getLocation({
          type: 'gcj02', //返回可以用于wx.openLocation的经纬度
          success: function(res) {
            var latitude = res.latitude
            var longitude = res.longitude
            var url = self.baseApiUrl + "?g=api&m=project&a=map";
            var data = {latitude : latitude,longitude : longitude};
            util.ajax({
              "url" : url,
              "data" : data,
              "success" : function(data){
                self.loaded();
                if(data.result == 'ok') {
                  self.setData({"address_info" : data.ad_info.city});
                  wx.setStorageSync('userMap',data.ad_info);
                } 
              }
            })
        } 
     })
     }
  },
  pullDown: function( e ) {
    this.page = this.page + 1;
    this.goodsList();
  },
  pullUpLoad: function(e) {
    
  },
  goTop: function(e) {
    this.setData({
      "scroll_Top" : -Math.random()
    });
  },
  scroll:function(e) {
    if(this.data.windowHeight < e.detail.scrollTop) {
       this.setData({"goTopId" : "bottom: 15%; opacity: 1;"});
    } else {
       this.setData({"goTopId" : "bottom: -15%; opacity: 0;"});
    }
  },
  onReady:function(){
    //wx.hideNavigationBarLoading();
    // 页面渲染完成
  },
  onShow:function(){
    wx.getSystemInfo( {
      success: ( res ) => {
        this.setData( {
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
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
    this.refresh();
    this.bannerList();
   
  },
  error:function(data) {
    if(data.url == undefined) {
      data.url = '../index/index';
    }
    if(data['result'] == 'fail') {
      this.setData({
        error : data
      });
    } else {
       //console.log('接口获取数据错误！！！');
    }
    this.setData({loaded:true});
  },
  bannerList:function() {
    var url = this.baseApiUrl + "/?g=Api&m=Banner&a=lists";
    
    var self = this;
     util.ajax({
        "url" :  url,
        "success" : function(data) {
           self.setData({
              "banners" : data.banners
           });
        }
     });
  },   
  goodsList:function() {
    if(this.data.no_data) return true;
    var offset = (this.page - 1) * this.size;
    var size = this.size;
    var data = {
      "offset" : offset,
      "size" : size
    };
    if(this.cate_id != undefined) {
       data.cate_id = this.cate_id;
       var url = this.baseApiUrl + "?g=api&m=goodsCate&a=getGoods";
    } 
    else {
       var url = this.baseApiUrl + "?g=Api&m=Goods&a=lists";
    }
    
    var self = this;
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){
         var allData = '';
         var agoData = self.data.goods;
         var goods = data.goods;
        if(data.goods.length != 0) {
            if(data.goods.length < self.size) {
              self.setData({
                "is_over" : 1,
                "no_data" : 1
              });
              
            }
            if(agoData) {
              allData = agoData;
              goods.map(function(good) {
                allData.push(good);
              });
            } else {
              allData = goods;
            }
            self.setData({loaded:true});
            self.setData({
              "goods" : allData
            });
        }  else {
          self.setData({
            "is_over" : 1,
            "no_data" : 1
          });
         
        }    
       self.loaded();
      }
    });
  },
  cusImageLoad: function (e){
    var id = e.currentTarget.dataset.id;
    var that = this;
    var data = {};
    data[id] = WxAutoImage.wxAutoImageCal(e);
    that.setData(data);
  },
  cusImageGoods:function (e){
      var that = this;
      that.setData(util.imageUtil(e));
  },
  goodsCate:function(e){
    var offset = 0;
    var size = 100;
    var data = {
      "offset" : offset,
      "size" : size
    };
    var url = this.baseApiUrl + "?g=api&m=goodsCate&a=lists";
    var self = this; 
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){
        if(data.result == 'ok') {
           self.cate_id = data.cates[0].cate_id;
           self.goodsList(); 
           self.setData({
              "cates" : data.cates
           });
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
 //首页分类选择
 channelRendered:function(e) {
      var nav_scroll_left = 0;
      this.cate_id = e.currentTarget.dataset.cate_id;
      this.current_index = e.currentTarget.dataset.index;
      var nav_temp = 0;
      if(this.data.current_index == undefined || this.data.current_index < this.current_index) {
         if(this.data.cates.length  - this.current_index >= 2 &&  this.current_index >= 2) {
            nav_scroll_left =  parseInt((this.current_index - 2)) *  this.data.windowWidth + this.data.windowWidth / 5;
            this.setData({"nav_scroll_left" : nav_scroll_left});
         }  
      } else if(this.data.current_index > this.current_index) {
        if(this.data.cates.length - this.current_index > 3) {
          if(this.current_index > 1) {
            nav_scroll_left =  -(parseInt((this.current_index - 2)) *  this.data.windowWidth - this.data.windowWidth / 5);
          }
          this.setData({"nav_scroll_left" : nav_scroll_left});
        }  
      }
      this.setData({"current_index" : this.current_index});
      this.refresh();
  },
  //初始化数据
  refresh:function() {
     this.loadding();
     this.setData({
      'goods' : [],
      'is_over' : 0,
      'no_data' : 0,
      "scroll_Top" : -Math.random()
    });
    this.page = 1;
    this.goodsList();
  },  
  //点击切换
  location:function(e) {
    self = this;
    //this.loadding();
    wx.chooseLocation({
      success:function(res) {
          var latitude = res.latitude
          var longitude = res.longitude
          var url = self.baseApiUrl + "?g=api&m=project&a=map";
          var data = {latitude : latitude,longitude : longitude};
          util.ajax({
            "url" : url,
            "data" : data,
            "success" : function(data){
                self.loaded();
                if(data.result == 'ok') {
                  self.setData({"address_info" : data.ad_info.city});
                  wx.setStorageSync('userMap',data.ad_info);
                } 
            }
          })
      },
      fail:function(res) {
        //self.loaded();
      }
    },
    );
  },
  //地址查看
  sendLocaltion:function(latitude,longitude) {
     wx.openLocation({
        latitude: latitude,
        longitude: longitude,
        scale: 28,
        success:function(e) {
        }
    })
  },
  onShareAppMessage: function () {
     return getApp().share({title : "",desc : "",path : ""});
  },
  bindRedirect:function(e) {
    var url = e.currentTarget.dataset.url;
    if(!url) return false;
    wx.redirectTo({
      "url": url,
    })
  },
})