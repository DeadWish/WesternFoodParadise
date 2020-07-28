const app = getApp()
const WXAPI = require('apifm-wxapi')
const i18n = require('../../utils/i18n')

Page({

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const _this = this
    WXAPI.userDetail(wx.getStorageSync('token')).then(res => {
      if (res.code === 0) {
        _this.setData({
          userDetail: res.data
        })
      }
    }),
    this.setI18nInfo()
  },

  nameChange(e){
    this.data.name = e.detail.value
  },
  mobileChange(e){
    this.data.mobile = e.detail.value
  },
  bindSave(){
    wx.requestSubscribeMessage({
      tmplIds: ['7sO58VXh0T5a6SwB5c9hR43bnBPxW8E6v3d70QQXuIk'],
      success(res) {

      },
      fail(e) {
        console.error(e)
      },
      complete: (e) => {
        this.bindSaveDone()
      },
    })
  },
  bindSaveDone: function () {
    const name = this.data.name
    const mobile = this.data.mobile
    if (!name) {
      wx.showToast({
        title: i18n._('请输入真实姓名'),
        icon: 'none'
      })
      return
    }
    if (!mobile) {
      wx.showToast({
        title: i18n._('请输入手机号码'),
        icon: 'none'
      })
      return
    }
    WXAPI.fxApply(wx.getStorageSync('token'), name, mobile).then(res => {
      if (res.code != 0) {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        return
      }
      wx.navigateTo({
        url: "/pages/fx/apply-status"
      })
    })
  },
  setI18nInfo: function() {
    i18n.setTabBarLanguage()
    wx.setNavigationBarTitle({
      title: i18n._('申请成为分享官'),
    })
    this.setData({
      _t: wx.getStorageSync('LanguageMap'),
      language: i18n.getLanguage()
    })
  },
})