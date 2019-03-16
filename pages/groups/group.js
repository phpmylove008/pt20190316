var util = require('../../utils/util.js');
var WxAutoImage = require('../../WxAutoImage/WxAutoImage.js');

Page({
  onLoad:function(options){
    this.options = options;
    this.getConfig();
    this.getGroup();
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
  loadding:function() {
    this.setData({loaded:false});
  },
  loaded : function() {
    this.setData({loaded:true});
  },
  cusImageLoad: function (e){
    var that = this;
    //这里看你在wxml中绑定的数据格式 单独取出自己绑定即可
    that.setData(WxAutoImage.wxAutoImageCal(e));
  },
  toDetail:function(e){
    if(e.currentTarget.dataset.id  == undefined || e.currentTarget.dataset.id ==0 || !e.currentTarget.dataset.id) {
      return false;
    }

    var self = this;
    this.loadding();
    
    var redurl = e.currentTarget.dataset.url;// + "?id=" + e.currentTarget.dataset.id
    var url = this.baseApiUrl + "?g=Api&m=Weuser&a=group_orders";
    
    var data = {
        "token" : this.token,
        "id" : e.currentTarget.dataset.id,
        "type" :　1
    };
    var self = this;
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){
        self.loaded();
        if(data.group_order.order.order_id) {
          wx.navigateTo({
            url: redurl
          });
        }
      }
    })
  },
   //配置方法
  getConfig:function() {
     var token = wx.getStorageSync('token');
     this.baseApiUrl = util.config('baseApiUrl'); 
     this.token = token;
     this.setData({
       "load_text" :  util.config('pullload_text').load_text,
       "no_tuan_orders" :  util.config('pullload_text').no_tuan_orders,
       "tuan_status" : util.config('tuan_status'),
       "web" : util.config('web'),
       "group_text" : util.config('group_text'),
       "group_pic" : util.config('group_pic')
     });
     this.size = util.config('page_size');
     this.offset = util.config('page_offset');
     this.page = 1;
  },
  goodsList:function() {
    var offset = this.offset;
    var size = this.size;
    var data = {
      "offset" : offset,
      "size" : size
    };
    if(this.cate_id != undefined) {
       data.cate_id = this.cate_id;
       var url = this.baseApiUrl + "?g=api&m=goodsCate&a=getGoods";
    }  else { 
       return false;
    }
    var self = this;
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){
         var goods = data.goods;
         self.setData({
            "goods" : goods
         });
         self.loaded();
      }
    });
  },
  countdown:function(expire_time) {
    var times =  (expire_time - Math.round(new Date().getTime() / 1000)) * 1000;
    util.countdown(this,times);
  },
  getGroup:function() {
    var url = this.baseApiUrl + "?g=Api&m=Weuser&a=group_orders";
    
    var data = {
        "token" : this.token,
        "id" : this.options.id
    };
    if(this.options.type == 1) {
      data.type = 1;
    }
    var self = this;
    util.ajax({
      "url" : url,
      "data" : data,
      "success" : function(data){
          if(data.result == 'ok') {
             var users = data.group_order.users.map(function(user) {
                user.join_time = util.formatTime(new Date(user.join_time * 1000));
                return user;
             });
             data.group_order.users = users;

             data.group_order.group_title_class = data.group_order.status == '2' || data.group_order.status == '5' || data.group_order.status == '6' ? 'tips_err' : data.group_order.status == '1' ? 'tips_succ' : 'tips_succ';
            
             data.group_order.group_detail_class = data.group_order.status == '2' ? 'tm_err' : data.group_order.status == '1' ? 'tm_succ' : 'tm_tm';

             var group_but_text = '';
             var group_but_url = '';
            //  if(data.group_order.status == '0') {
            //    group_but_url = '';
            //    group_but_text = self.data.group_text[data.group_order.status].replace("%s",(data.group_order.require_num - data.group_order.people));
            //  } else if(data.group_order.status == '1') {
            //    group_but_url = '';
            //    group_but_text = self.data.group_text[1];
            //  } else if(data.group_order.status == '2') {
            //     group_but_url = '../index/index';
            //     group_but_text = self.data.group_text[2];
            //  }
             // 买了 没买 团进行中
             if(data.group_order.status == '0' || data.group_order.status == '7' || data.group_order.status == '8') {
                if(!data.group_order.order) {
                    group_but_url = '../orders/checkout?sell_type=1&goods_id' + data.group_order.order.goods_id;
                    group_but_text = self.data.group_text[1];  
                } else {
                    group_but_url = '';
                    group_but_text = self.data.group_text[0].replace("%s",(data.group_order.require_num - data.group_order.people));
                }
             } else {
                group_but_url = '../index/index';
                group_but_text = self.data.group_text[2];
             }


             var tips_tit = '';
             if(data.group_order.status == '0') {
                 if(!data.group_order.order) {
                   tips_tit = self.data.tuan_status[0]['tips_title'][0];
                 } else if(data.group_order.users[0].user_id != data.group_order.order.buyer_id) {
                    tips_tit = self.data.tuan_status[0]['tips_title'][1];
                 } else {
                    tips_tit = self.data.tuan_status[0]['tips_title'][2];
                 }
             } else if(data.group_order.status == '1') {
               if(!data.group_order.order) {
                   tips_tit = self.data.tuan_status[1]['tips_title'][0];
               } else if(data.group_order.users[0].user_id != data.group_order.order.buyer_id) {
                    tips_tit = self.data.tuan_status[1]['tips_title'][1];
                 } else {
                  tips_tit = self.data.tuan_status[1]['tips_title'][2];
                }
             } else if(data.group_order.status == '2') {
                if(!data.group_order.order) {
                  tips_tit = self.data.tuan_status[2]['tips_title'][0];
                } else if(data.group_order.users[0].user_id != data.group_order.order.buyer_id) {
                    tips_tit = self.data.tuan_status[2]['tips_title'][1];
                 } else {
                  tips_tit = self.data.tuan_status[2]['tips_title'][2];
                }
             } else if(data.group_order.status == '5') {
                if(!data.group_order.order) {
                  tips_tit = self.data.tuan_status[5]['tips_title'][0];
              } else if(data.group_order.users[0].user_id != data.group_order.order.buyer_id) {
                    tips_tit = self.data.tuan_status[5]['tips_title'][1];
                 } else {
                  tips_tit = self.data.tuan_status[5]['tips_title'][2];
                }
             } else if(data.group_order.status == '6') {
                if(!data.group_order.order) {
                  tips_tit = self.data.tuan_status[6]['tips_title'][0];
                 } else if(data.group_order.users[0].user_id != data.group_order.order.buyer_id) {
                    tips_tit = self.data.tuan_status[6]['tips_title'][1];
                 } else {
                  tips_tit = self.data.tuan_status[6]['tips_title'][2];
                }
             } else if(data.group_order.status == '9') {
                if(!data.group_order.order) {
                  tips_tit = self.data.tuan_status[9]['tips_title'][0];
                 } else if(data.group_order.users[0].user_id != data.group_order.order.buyer_id) {
                    tips_tit = self.data.tuan_status[9]['tips_title'][1];
                 } else {
                  tips_tit = self.data.tuan_status[9]['tips_title'][2];
                }
             } else if(data.group_order.status == '8') {
                if(!data.group_order.order) {
                  tips_tit = self.data.tuan_status[8]['tips_title'][0];
                 } else if(data.group_order.users[0].user_id != data.group_order.order.buyer_id) {
                    console.log(data.group_order.users[0].user_id);
                    console.log(data.group_order.order.buyer_id);
                    tips_tit = self.data.tuan_status[8]['tips_title'][1];
                 } else {
                  tips_tit = self.data.tuan_status[8]['tips_title'][2];
                }
             } else if(data.group_order.status == '7') {
                if(!data.group_order.order) {
                  tips_tit = self.data.tuan_status[7]['tips_title'][0];
                 } else if(data.group_order.users[0].user_id != data.group_order.order.buyer_id) {
                    tips_tit = self.data.tuan_status[7]['tips_title'][1];
                 } else {
                  tips_tit = self.data.tuan_status[7]['tips_title'][2];
                }
             }

             data.group_order.tips_tit = tips_tit; 
             data.group_order.group_but_text = group_but_text; 
             data.group_order.group_but_url = group_but_url; 

             self.countdown(data.group_order.expire_time);

             var defaultPic = [];
             for(var i = 0;i < data.group_order.require_num - data.group_order.people;i++) {
               defaultPic[i] = self.data.group_pic.defaultAvatar;
             }
             
             data.group_order.defaultAvatar = defaultPic;
             self.cate_id = data.group_order.order.order_goods.cate_id;
             self.goodsList();

             self.setData({
                "group_order" : data.group_order
             });
          } else if(data.result == 'fail') {
             self.error(data);
          } else {
             self.error({
                "result" : 'fail',
                "error_info" : util.config('error_text')[0]
             });
          }
          self.loaded();
      }
    });
  },
  error:function(data) {
    if(data.url == undefined) {
      data.url = '../groups/groups';
    }
    if(data.result == 'fail') {
      this.setData({
        error : data
      });
    } else {
       //console.log('接口获取数据错误！！！');
    }
    this.setData({loaded:true});
  },
  bindRedirect:function(e) {
    var url = e.currentTarget.dataset.url;
    if(!url) return false;
    wx.redirectTo({
      "url": url,
    })
  },
  onShareAppMessage: function () {
    if(this.data.group_order.status == 0 || this.data.group_order.status == 8) {
      var desc = '您参加的 ' + this.data.group_order.order.order_goods.goods_name + '目前还差'+(this.data.group_order.require_num - this.data.group_order.people)+'人,快去叫上身边的小伙伴一起掏多多吧';
       return getApp().share({title : this.data.group_order.order.order_goods.goods_name,desc : desc,path : "pages/groups/group?id=" + this.options.id});
    } else {
      return getApp().share({title : "",desc : "",path : "pages/groups/group?id=" + this.options.id});
    }
  }
})