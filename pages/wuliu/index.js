const WXAPI = require('apifm-wxapi')
const app = getApp()
const i18n = require('../../utils/i18n')

Page({
  data: {},
  onLoad: function (e) {
    var orderId = e.id;
    this.data.orderId = orderId;
  },
  onShow: function () {
    var that = this;
    this.setI18nInfo()
    WXAPI.orderDetail(wx.getStorageSync('token'), that.data.orderId).then(function (res) {
      if (res.code != 0) {
        wx.showModal({
          title: i18n._('错误'),
          content: res.msg,
          showCancel: false,
          confirmText:i18n._('确定'),
        })
        return;
      }
      that.setData({
        orderDetail: res.data,
        logisticsTraces: res.data.logisticsTraces.reverse()
      });
    })
  },
  setI18nInfo: function() {
    i18n.setTabBarLanguage()
    wx.setNavigationBarTitle({
      title: i18n._('物流详情'),
    })
    this.setData({
      _t: wx.getStorageSync('LanguageMap'),
      language: i18n.getLanguage()
    })
  },
})
