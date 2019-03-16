var util = require('../../utils/util.js')
Page({
  data:{
    "address_list": [],
    loaded: false
  },
  onLoad:function(options){
    this.sell_type = options.sell_type;
    
    this.goods_id = options.goods_id;

    this.address_id = options.address_id;

     var data = {};

     if(this.sell_type && this.sell_type != undefined) {
        data.sell_type = this.sell_type;
     }
     
     if(this.goods_id && this.goods_id != undefined) {
        data.goods_id = this.goods_id;
     }
     
     if(this.address_id && this.address_id != undefined) {
        data.address_id = this.address_id;
     }

     this.setData(data);
     this.token = wx.getStorageSync('token'); 
     this.baseApiUrl = util.config('baseApiUrl');
     this.addressList();
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
     wx.hideNavigationBarLoading();
     this.setData({loaded:true});
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
    this.addressList();
  },
  loadding:function() {
    this.setData({loaded:false});
  },
  loaded : function() {
    this.setData({loaded:true});
  },
  selectedDEFAULT:function(obj) {
      this.loadding();
      var self = this;
      var index = obj.currentTarget.dataset.index;
      var data = this.data.address_list;

      //console.log('goods_id : '+ this.goods_id);
      if(this.goods_id && this.goods_id != "undefined" && this.sell_type && this.sell_type != "undefined") {
          wx.redirectTo({
            url: '../../pages/orders/checkout?goods_id='+  this.goods_id +'&sell_type=' + this.sell_type +'&address_id=' + data[index].address_id
          });
          return;
      }

      var url = this.baseApiUrl + "?g=Api&m=Weuser&a=addresses&token=" + this.token + "&address_id=" + data[index].address_id;
      util.ajax({
          "url" :  url,
          "method" :　"PUT",
          "data" : {"status" : "DEFAULT"},
          "success" : function(res) {
              if(res['result'] == "ok") {
                self.loaded();
                for(var i=0;i < data.length;i++) {
                  data[i].status = (i == index ? "DEFAULT" : "COMMON");
                }
                self.setData({
                  address_list : data
                });
              }
          }
        });      
   },
   //修改地址页面
   edit:function(e){
     var address_id = e.target.dataset.address_id;
     wx.redirectTo({
       "url" : "./address?address_id=" + address_id + "&goods_id=" + this.goods_id + "&sell_type=" + this.sell_type,
     });
   },
   addressList:function(){{
      var self = this;
      
      var url = this.baseApiUrl + "?g=Api&m=Weuser&a=addresses&token=" + this.token;
      util.ajax({
          "url" :  url,
          "method" :　"POST",
          "success" : function(data) {
              if(data['result'] == "ok") {
                  self.setData({
                      "address_list" : data.address_list
                  });  
              }
              
          }
        });
   }},
  //错误处理函数
  error:function(data) {
    if(data['result'] == 'fail') {
      this.setData({
        error : data,
        url : "./addresses"
      });
    } else {
       //console.log('接口获取数据错误！！！');
    }
  },
})