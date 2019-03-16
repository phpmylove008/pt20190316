var util = require('../../utils/util.js')
Page({
  data:{
    "order" : [],
    "URL" :　3,
    "modalHidden" : true
  },
  onLoad:function(options){
      this.id = options.id;
      if(this.id == undefined) {
          this.error({result:'fail',error_info:'该订单不存在,请刷新该订单!'});
      }
      this.getConfig();
      var orders = this.getData();//token,this.offset,this.size
    // 页面初始化 options为页面跳转所带来的参数
  },
  //配置方法
  getConfig:function() {
     var token = wx.getStorageSync('token');
     this.baseApiUrl = util.config('baseApiUrl'); 
     this.size = util.config('page_size');
     this.offset = util.config('page_offset');
     this.token = token;
     this.page = 1;
     this.order_status = util.config('order_status');
  },
  loadding:function() {
    this.setData({loaded:false});
  },
  loaded : function() {
    this.setData({loaded:true});
  },
  getData:function() {
    this.loadding();
    var url = this.baseApiUrl + "?g=Api&m=Weuser&a=getorder";  
    var token = this.token;
    var data = {
      "token" : token,
      "order_id" : this.id
    };

    var self = this;
     util.ajax({
        url : url,
        data : data,
        method : "GET",
        success : function(data){
            self.loaded();
            if(data.result == 'ok') {
                var order = data.order;
                order.pay_time = util.formatTime(new Date(order.pay_time * 1000));
                order.order_time = util.formatTime(new Date(order.order_time * 1000));
                order.order_status_lang = self.order_status[order.order_status];
                
                if(order.order_status == '0' || order.order_status == '1' || order.order_status == '2'  ) {
                    order.state_class = "state_1";
                } else if(order.order_status == '3') {
                   order.state_class = "state_2";
                } else if(order.order_status == '4') {
                   order.state_class = "state_3";
                }
                self.setData({"order" : order});
            } else {
               self.error(data);
               return false;
            }
        }
     });
  },
  orderBuy:function(e) {
    this.order_id = e.currentTarget.dataset.order_id;
    util.wxpay(this);
    this.order_id = false;
  },
   //取消訂單
  orderCancel:function(e) {
    this.order_id = e.currentTarget.dataset.order_id;
    this.setData({
      'modalHidden' : false,
      'titleModel' : '确定“取消订单”吗？'
    });
    //console.log(this.order_id);
  },
  modalConfirm:function(e) {
    if(e.target.dataset.callback != undefined && e.target.dataset.callback) {
      return this.orderReceiveFun();
    }

    var self = this;
    if(this.order_id == undefined) {
       self.setData({
        'modalHidden' : true
      });
      return false;
    }
    var token = this.token;
    var url = this.baseApiUrl + "?g=Api&m=Weuser&a=cancelOrder";   
   
    var data = {
      token:	token,
      order_id:	this.order_id
    };
    this.loadding();
    util.ajax({
        "url" :  url,
        "method" :　"GET",
        "data" : data,
        "success" : function(data) {
            if(data['result'] == "ok") {
              self.setData({
                'modalHidden' : true
              });
              self.loaded();
              self.refresh();
            } else {
               self.error(data);
            }  
        }
      });
    this.order_id = undefined;
  },
  modalCancel:function(e) {
     this.setData({
      'modalHidden' : true
    });
    this.order_id = undefined;
  },
  refresh:function(e){
    this.setData({ "order" : []});
    this.getData();
    this.order_id = undefined;
  },
  //监听用户下拉动作
  onPullDownRefresh:function() {
    this.refresh();
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
  error:function(data) {
    //如果是 查询物流信息出错 不显示弹窗
    if(data.error_code == '41001') {
        this.setData({
          'express' : {
          "loading" : false,"error" : 1,"info" : util.config('error_text')[8]}
        });
        return true;
    }
    
    if(data['result'] == 'fail') {
      this.setData({
        error : data
      });
    } else {
       //console.log('接口获取数据错误！！！');
    }
  },
  onShareAppMessage: function () {
    return getApp().share({title : "",desc : "",path : "pages/orders/order?id=" + this.id});
  },
  close_express: function () {
     this.setData( {
        'expressOpen' : 0,
        'shipping_info' : {},
        'express' : {"loading" : false}
     });
  }   
  ,
  expressShow : function(e) {
    this.setData({"expressOpen" : 1,'express' : {loading : true}});
    var order_id = e.currentTarget.dataset.order_id;
    
    var token = this.token;
    var url = this.baseApiUrl + "?g=Api&m=Project&a=express&order_id=" +　order_id;   
    var self = this;
    util.ajax({
        "url" :  url,
        "method" :　"GET",
        "data" : [],
        "success" : function(data) {
            if(data['result'] == "ok") {
              self.setData({
                'express' : {loading : false},
                "shipping_info" : data.shipping
                });
            } else {
                 self.setData({
                   'express' : {
                    "loading" : false,"error" : 1,"info" : util.config('error_text')[8]}
                  });
            }  
        }
      });
  },
  orderReceive : function(e) {
      this.setData({
        'modalHidden' : false,
        'callback' : '1',
         'titleModel' : '确定“确认收货”吗？'
      });

    this.order_id = e.currentTarget.dataset.order_id;
    
  },
   orderReceiveFun : function() {
    var order_id = this.order_id;
    var token = this.token;
    var url = this.baseApiUrl + "?g=Api&m=Weuser&a=receivedOrder&token=" + token + "&order_id=" +　order_id;   
    var self = this;
    var data = {
    };
    
    this.loadding();
    util.ajax({
        "url" :  url,
        "method" :　"POST",
        "data" : data,
        "success" : function(data) {
            if(data['result'] == "ok") {
              self.setData({
                'modalHidden' : true
              });
              self.loaded();
              self.refresh();
            } else {
              self.error(data);
            }  
        }
      });
  }
})