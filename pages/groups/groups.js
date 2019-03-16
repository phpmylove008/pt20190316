var util = require('../../utils/util.js');
var WxAutoImage = require('../../WxAutoImage/WxAutoImage.js');
Page({
  data:{
      "URL" : 2
    // text:"这是一个页面"
  },
  onLoad:function(options){
     this.getConfig();
     this.getGroups();
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
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
  toDetail:function(e){
    var url = e.currentTarget.dataset.url + "?id=" + e.currentTarget.dataset.id;
    wx.navigateTo({
      url: url
    });
    // wx.redirectTo({
    //   url: url
    // });
  },
   cusImageLoad: function (e){
    var that = this;
    //这里看你在wxml中绑定的数据格式 单独取出自己绑定即可
    that.setData(WxAutoImage.wxAutoImageCal(e));
  },
  //配置方法
  getConfig:function() {
     var token = wx.getStorageSync('token');
     this.baseApiUrl = util.config('baseApiUrl'); 
     this.size = util.config('page_size');
     this.offset = util.config('page_offset');
     this.page = 1;
     this.token = token;
     this.setData({
       "load_text" :  util.config('pullload_text').load_text,
       "no_tuan_orders" :  util.config('pullload_text').no_tuan_orders,
       "tuan_status" : util.config('tuan_status')
     });
  },
  pullDown: function( e ) {
    this.page = this.page + 1;
    this.getGroups();
  },
  pullUpLoad: function(e) {
  },
  getGroups:function(e) {
    if(this.data.no_data) return true;
    var offset = (this.page - 1) * this.size;
    var size = this.size;
    var token = this.token;
    var data = {
      "offset" : offset,
      "size" : size,
      "token" : token
    };
    
    var url = this.baseApiUrl + "?g=Api&m=Weuser&a=groups";
    
    var self = this;
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){
         var allData = '';
         var agoData = self.data.groups;
         var groups = data.group_orders;
        if(data.group_orders.length != 0) {
            if(data.group_orders.length < self.size) {
              self.setData({
                "is_over" : 1,
                "no_data" : 1
              });
              
            }
            if(agoData) {
              allData = agoData;
              groups.map(function(group) {
                allData.push(group);
              });
            } else {
              allData = groups;
            }
            self.setData({loaded:true});
            self.setData({
              "groups" : allData
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
  loadding:function() {
    this.setData({loaded:false});
  },
  loaded : function() {
    this.setData({loaded:true});
  },
  error:function(data) {
    if(data.url == undefined) {
      data.url = '../personal/personal';
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
  onShareAppMessage: function () {
    return getApp().share({title : '',desc : '',path : ''});
  }  
})