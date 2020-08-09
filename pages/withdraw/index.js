const app = getApp()
const WXAPI = require('apifm-wxapi')
const i18n = require('../../utils/i18n')

Page({
  onShow: function() {
      this.setI18nInfo()
  },
  bindCancel: function() {
    wx.navigateBack({})
  },
  bindSave: function(e) {
    const that = this;
    let minWidthAmount = wx.getStorageSync('WITHDRAW_MIN');
    if (!minWidthAmount) {
      minWidthAmount = 0
    }
    var amount = e.detail.value.amount;

    if (!amount) {
      wx.showModal({
        title: i18n._('错误'),
        content: i18n._('请填写正确的提现金额'),
        showCancel: false,
        confirmText: i18n._('确定'),
      })
      return
    }
    if (amount * 1 < minWidthAmount) {
      wx.showModal({
        title: i18n._('错误'),
        content: i18n._('提现金额不能低于')  + "￥"+ minWidthAmount,
        showCancel: false,
        confirmText: i18n._('确定'),
      })
      return
    }
    WXAPI.withDrawApply(wx.getStorageSync('token'), amount).then(function(res) {
      if (res.code == 0) {
        wx.showModal({
          title: i18n._('成功'),
          content: i18n._('您的提现申请已提交，等待财务打款'),
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              that.bindCancel();
            }
          }
        })
      } else {
        wx.showModal({
          title: i18n._('错误'),
          content: res.msg,
          showCancel: false,
          confirmText: i18n._('确定'),
        })
      }
    })
  },
  setI18nInfo: function() {
    i18n.setTabBarLanguage()
    wx.setNavigationBarTitle({
      title: i18n._('提现'),
    })
    this.setData({
      _t: wx.getStorageSync('LanguageMap'),
      language: i18n.getLanguage()
    })
  },
})