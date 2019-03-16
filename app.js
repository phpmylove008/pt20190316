var util = require('./utils/util.js')
App({
  onLaunch: function () {
    //console.log(1);
    if(!wx.getStorageSync('token')) {
      this.login();
    }
    wx.getSetting({
      success(res) {
        console.log(res.authSetting)
         res.authSetting = {
           "scope.userInfo": true,
           "scope.userLocation": true
         }
      }
    })
    wx.openSetting({
      success(res) {
        console.log(res.authSetting)
        // res.authSetting = {
        //   "scope.userInfo": true,
        //   "scope.userLocation": true
        // }
      }
    })
    
    //console.log(2);
  },
  onShow: function () {

  },
  onHide: function () {
  },
  share: function (obj) {
    var token = wx.getStorageSync('token');
    var baseApiUrl = util.config('baseApiUrl'); 
    var url = baseApiUrl + "?g=Api&m=Weuser&a=share&token=" + token;    
    var share_text = util.config('share_text');
    return {
      title: obj.title || share_text.title,
      desc: obj.desc || share_text.desc,
      path: obj.path || share_text.path,
      complete : function($data) {
        if($data.errMsg == "shareAppMessage:cancel") {
            util.ajax({
                url: url,
                data: {'share_type' : '分享给好友','share_status' : 0,'share_url' : obj.path || share_text.path},
                method : "POST",
                success : function(e) {
                }
            });
        } else if($data.errMsg == "shareAppMessage:ok") {
           util.ajax({
                url: url,
                data: {'share_type' : '分享给好友','share_status' : 1,'share_url' : obj.path || share_text.path},
                method : "POST",
                success : function(e) {
                }
          });
        }
      }
    }
  },
  login : function(self='',istoken='') {
    var baseApiUrl = util.config('baseApiUrl'); 
     var _self = this;
     wx.login({
      success: function(res) {
        if (res.code) {
          var url = baseApiUrl + "/?g=api&m=WeApp&a=login&code=" + res.code;
          util.ajax({
              "url" :  url,
              "method" :　"GET",
              "success" : function(data) {
                   var token = data.token;
                   if(data.result == "ok") {
                     //console.log(5);
                      wx.setStorageSync('token',token);
                      if(self && !istoken) {
                         _self.getUserInfo(self,token);
                      }
                   } 
              }
          });
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },

  getUserInfo : function(self,token) {
     var baseApiUrl = util.config('baseApiUrl'); 
     var url = baseApiUrl + "/?g=api&m=WeApp&a=login&token=" + token;    
     var data = [];
  
      //获取微信信息
      wx.getUserInfo({
          success: function(res) {
              util.ajax({
                  "url" :  url,
                  "data" : res,
                  "method" :　"PUT",
                  "success" : function(data) {
                    self.me(token);
                  }
              })
          },
          withCredentials:true,
          fail: function(res) {
            console.log(res);
            //self.me(token);
          }
      })
  }
})