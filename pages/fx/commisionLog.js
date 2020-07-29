const app = getApp()
const WXAPI = require('apifm-wxapi')
const i18n = require('../../utils/i18n')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    commisionLog: []
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const _this = this
    WXAPI.fxCommisionLog({
      token: wx.getStorageSync('token')
    }).then(res => {
      if (res.code == 0) {
        _this.setData({
          commisionLog: res.data.result
        })
      } else {
        _this.setData({
          commisionLog: []
        })
      }
    })
    this.setI18nInfo()
  },
  setI18nInfo: function() {
    i18n.setTabBarLanguage()
    wx.setNavigationBarTitle({
      title: i18n._('返佣明细'),
    })
    this.setData({
      _t: wx.getStorageSync('LanguageMap'),
      language: i18n.getLanguage()
    })
  },
})