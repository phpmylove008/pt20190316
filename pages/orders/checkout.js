var util = require('../../utils/util.js')
Page({
  data:{
    "btn_order_done" : false,
    "error" : {
       "result" : '',
       "error_info" : ''
    },
    'order_tixinged' : 0
    // text:"这是一个页面"
  },
  onLoad:function(options){
    this.sell_type = options.sell_type;
    this.goods_id = options.goods_id;
    this.address_id = options.address_id;
    if(options.group_order_id != undefined) {
      this.group_order_id = options.group_order_id;
    }
    this.token = wx.getStorageSync('token'); 
    this.baseApiUrl = util.config('baseApiUrl');
  
    this.setData({
      sell_type : this.sell_type,
      goods_id :　this.goods_id
    });

    var self = this;
    setTimeout(function(){
      self.setData({'order_tixinged' : 1});
    }
    ,2500);

    this.doneOrderBanner();
    this.address();
    this.goodsDetail();
     
    //console.log(options);
    // 页面初始化 options为页面跳转所带来的参数
  },
  doneOrderBanner : function() {
    var url = this.baseApiUrl + "?g=Api&m=Project&a=shippingBanner";
    var self = this;
    util.ajax({
      url : url,
      success : function(data) {
        self.setData({'shippingBanner' : data.shipping});
      }
    });
  },
  order_tixinged:function(e) {
    this.setData({'order_tixinged' : 1});
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
  btnOrderDone:function(e){
    if(!this.data.address) return false;
    if(this.data.btn_order_done) return true;
    var self = this;
    this.setData({
      "btn_order_done" : true
    });

    var url = this.baseApiUrl + "?g=Api&m=Weuser&a=orders&token=" + this.token;
    var data = {
      "goods_id" : this.goods_id,
      "address_id" : this.address_id,
      "group_order_id" : this.group_order_id ? this.group_order_id : 0,
      "groupbuy" : this.sell_type == 1 ? 1 : 0
    };

    util.ajax({
        "url" :  url,
        "method" :　"POST",
        "data" : data,
        "success" : function(data) {
            if(data['result'] == "ok") {
                //服务端生成订单成功
                //  self.setData({
                //   "btn_order_done" : false
                // });
                //微信支付
                self.order_id = data.order_id;
                util.wxpay(self);
                //self.wxpay();
            } else if(data['result'] == "fail") {
               self.error(data);
            } else {
              var data = {"result" : 'fail',"error_info" : util.config('error_text')[0]};
              self.error(data);
            }
        }
      });
  },
  error:function(data) {
    if(data['result'] == 'fail') {
      this.setData({
        error : data
      });
    } else {
       //console.log('接口获取数据错误！！！');
    }
  },
  wxpay:function(){
     var self = this;
     var url = this.baseApiUrl + "?g=Api&m=Weuser&a=wxpay&token=" + this.token + "&order_id=" + this.order_id;
     util.ajax({
        "url" :  url,
        "method" :　"GET",
        "success" : function(data) {
            if(data['result'] == "ok") {
               wx.requestPayment({
                  'timeStamp': data.param.timeStamp,
                  'nonceStr': data.param.nonceStr,
                  'package': data.param.package,
                  'signType': 'MD5',
                  'paySign': data.param.paySign,
                  'success':function(res) {
                      //console.log(res);
                  },
                  'fail':function(res){
                    //console.log(res);
                  }
                })
            } else if(data['result'] == "fail") {
               self.error(data);
            } else {
              var data = {"result" : 'fail',"error_info" : util.config('error_text')[0],"url" : '../orders/orders'};
              self.error(data);
            }
        }
      });
  },

  address:function(){{
      var self = this;
      var pra = '';
      if(this.address_id != undefined) {
        var pra = "&address_id=" + this.address_id;
      }
      var url = this.baseApiUrl + "?g=Api&m=Weuser&a=addresses&token=" + this.token + pra;
      util.ajax({
          "url" :  url,
          "method" :　"GET",
          "success" : function(data) {
              if(data['result'] == "ok") {
                  self.setData({loaded:true});
                  if(data.address_list.length > 0) {
                    var address = self.addressSort(data.address_list,self.address_id);
                     self.setData({
                        "address" : address
                    });  
                  }
                  if(address) {
                    self.address_id = address.address_id;
                  }
              } else {
                self.error(data);
              }
          }
        });
   }},
  addressSort:function(list,address_id) {
    var address;
    if(list.length == 1) {
      return list[0];
    }
    if(list.length <= 0) {
      return null;
    }
    
    for (var i in list) {
      if(undefined != address_id) {
         if(list[i]['address_id'] == address_id) {
            address = list[i];
         }
      } else if(list[i]['status'] == "DEFAULT") {
          address = list[i];
      } else if(i >= list.length - 1) {
          address = list[0];
      }
    }
    return address;
  },
  goodsDetail:function(){
     var url = this.baseApiUrl + "?g=Api&m=Goods&a=detail&goods_id=" + this.goods_id;
     var self = this;
     util.ajax({
        url : url,
        success : function(data){
            if(data.result == 'ok') {
              self.setData({
                goods : data.goods,
                gallery : data.gallery
              });
            } else {
              self.error(data);
            } 
        } 
     });
  },
  errorGo: function(e) {
    wx.redirectTo({
      url: "../index/index"
    })
  },
  onShareAppMessage: function () {
    return {
      title: '微信小商城',
      desc: '风靡全国的拼团商城，优质水果新鲜直供，快来一起拼好货吧',
      path: 'pages/index/index'
    }
  }   
})