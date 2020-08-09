const app = getApp();
const CONFIG = require('../../config.js')
const WXAPI = require('apifm-wxapi')
const i18n = require('../../utils/i18n')

Page({
    data:{
      orderId:0,
      goodsList:[],
      yunPrice:"0.00",
      appid: CONFIG.appid
    },
    onLoad:function(e){
      var orderId = e.id;
      this.data.orderId = orderId;
      this.setData({
        orderId: orderId
      });
      wx.showShareMenu({
        withShareTicket: true
      })

      if (! wx.getStorageSync('nick')) {
        WXAPI.userDetail(wx.getStorageSync('token')).then(function (res) {
          if (res.code == 0) {
            wx.setStorageSync('nick', res.data.base.nick)
          } else {
            wx.setStorageSync('nick', i18n._('其他用户'))
          }
        });
      }
    },
    onShow : function () {
      var that = this;
      WXAPI.orderDetail(wx.getStorageSync('token'), that.data.orderId).then(function (res) {
        if (res.code != 0) {
          wx.showModal({
            title: i18n._('错误'),
            content: res.msg,
            showCancel: false,
            confirmText: i18n._('确定')
          })
          return;
        }
        that.setData({
          orderDetail: res.data
        });
      })
      var yunPrice = parseFloat(this.data.yunPrice);
      var allprice = 0;
      var goodsList = this.data.goodsList;
      for (var i = 0; i < goodsList.length; i++) {
        allprice += parseFloat(goodsList[0].price) * goodsList[0].number;
      }
      this.setData({
        allGoodsPrice: allprice,
        yunPrice: yunPrice
      });

      this.setI18nInfo();
    },
    tapGoods: function (e) {
      if (e.currentTarget.dataset.id != 0) {
        wx.navigateTo({
          url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
      }
    },
    wuliuDetailsTap:function(e){
      var orderId = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: "/pages/wuliu/index?id=" + orderId
      })
    },
    confirmBtnTap:function(e){
      let that = this;
      let orderId = this.data.orderId;
      wx.showModal({
          title: i18n._('确认您已收到商品？'),
          content: '',
          success: function(res) {
            if (res.confirm) {
              WXAPI.orderDelivery(wx.getStorageSync('token'), orderId).then(function (res) {
                if (res.code == 0) {
                  that.onShow();                  
                }
              })
            }
          },
          confirmText: i18n._('确定'),
          cancelText: i18n._('取消'),
      })
    },
    submitReputation: function (e) {
      let that = this;
      let postJsonString = {};
      postJsonString.token = wx.getStorageSync('token');
      postJsonString.orderId = this.data.orderId;
      let reputations = [];
      let i = 0;
      while (e.detail.value["orderGoodsId" + i]) {
        let orderGoodsId = e.detail.value["orderGoodsId" + i];
        let goodReputation = e.detail.value["goodReputation" + i];
        let goodReputationRemark = e.detail.value["goodReputationRemark" + i];

        let reputations_json = {};
        reputations_json.id = orderGoodsId;
        reputations_json.reputation = goodReputation;
        reputations_json.remark = goodReputationRemark;

        reputations.push(reputations_json);
        i++;
      }
      postJsonString.reputations = reputations;
      WXAPI.orderReputation({
        postJsonString: JSON.stringify(postJsonString)
      }).then(function (res) {
        if (res.code == 0) {
          that.onShow();
        }
      })
    },
  // onShareAppMessage: function (res) {
  //   return {
  //     title: '推荐给你！20张优惠先到先得！',
  //     path: 'pages/index/index?inviter_id=' + wx.getStorageSync('uid') + '&share_order_number=' + this.data.orderDetail.orderInfo.orderNumber + '&share_user_name=' + wx.getStorageSync('nick'),
  //     imageUrl: this.data.orderDetail.goods[0].pic
  //   }
  // },
  setI18nInfo: function() {
    i18n.setTabBarLanguage()
    wx.setNavigationBarTitle({
      title: i18n._('订单详情'),
    })
    this.setData({
      _t: wx.getStorageSync('LanguageMap'),
      language: i18n.getLanguage()
    })
  },
})