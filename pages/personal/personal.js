var util = require('../../utils/util.js')
var app = getApp();
Page({
  data:{
      "URL" : 4,
      "userInfo" : util.config('userInfo'),
      

    // text:"这是一个页面"
  },
  onLoad:function(options){
     var token = wx.getStorageSync('token');
     this.me(token);
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
  me:function(token){
     this.setData({loaded:false});
     this.baseApiUrl = util.config('baseApiUrl');
     var self = this;
     if(token) {
        var data = {
           "token" : token
        };
        var url = this.baseApiUrl + "/?g=Api&m=Weuser&a=me";
        util.ajax({
          "url" :  url,
          "data" : data,
          "success" : function(data) {
              if(data['result'] == "ok") {
                  self.setData({
                    "userInfo" : {
                      "avatarUrl" : data.user_info.headimgurl,
                      "nickName" : data.user_info.nickname
                    }
                  });  
                  self.setData({loaded:true});
              } else {
                console.log('token');
                wx.removeStorageSync('token');  
                self.login();
              }
          },
          "error":  function (data) {
            endtime = new Date().getTime();
            console.error('ERR: Args : ' + JSON.stringify(obj.data) + " Url : " + obj.url + " Time : " + (endtime - starttime) / 1000 + "s");
            obj.error($data);
          }
        });
     } else {
       self.login();
     }
  },
  //清除緩存
  refreshLogin:function(){
     this.clearCache();
     this.setData({"userInfo" : util.config('userInfo')});
     wx.removeStorageSync('token');
     this.me();
  },
  clearCache:function(){
    wx.clearStorageSync();
  },
  login:function(){
    var self = this;
    var code = '';
    var returnData = false;

    var token = wx.getStorageSync('token');
    getApp().login(self,token);
    
    return returnData;
  },
   error:function(data) {
    if(data['result'] == 'fail') {
      this.setData({
        error : data
      });
    } else {
       //console.log('接口获取数据错误！！！');
    }
    this.setData({loaded:true});
  },
  switch2Change: function (e){
    //console.log('switch1 发生 change 事件，携带值为', e.detail.value)
  },
  onShareAppMessage: function () {
    return getApp().share({title : '',desc : '',path : ''});
  } 
})