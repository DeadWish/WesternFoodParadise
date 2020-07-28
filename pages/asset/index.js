const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const i18n = require('../../utils/i18n')
import ApifmLogin from '../../template/login/index.js';

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxlogin: true,
    balance: 0.00,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0,
    cashlogs: undefined,

    // tabs: ["资金明细", "提现记录", "押金记录"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,

    withDrawlogs: undefined,
    depositlogs: undefined,
    isSeller: false,
    rechargeOpen: false // 是否开启充值[预存]功能
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ApifmLogin.init(this)
    const that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    let rechargeOpen = wx.getStorageSync('RECHARGE_OPEN')
    if (rechargeOpen && rechargeOpen == "1") {
      rechargeOpen = true
    } else {
      rechargeOpen = false
    }
    
    this.setData({
      tabs: [i18n._("资金明细")],
    })
    
    if (wx.getStorageSync('isSeller')) {
      this.setData({
        rechargeOpen: rechargeOpen,
        tabs: [i18n._("资金明细"), i18n._("提现记录")],
        isSeller: true,
      })
    } else {
      this.setData({
        rechargeOpen: rechargeOpen
      })
    }
  },

  onShow: function () {
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        this.doneShow();
      }
    })
    this.setI18nInfo()
    this.setData({
      tabs: [i18n._("资金明细")],
    })
  },
  doneShow: function () {
    const _this = this
    const token = wx.getStorageSync('token')
    if (!token) {
      this.setData({
        wxlogin: false
      })
      return
    }
    WXAPI.userAmount(token).then(function (res) {
      if (res.code == 700) {
        wx.showToast({
          title: i18n._('当前账户存在异常'),
          icon: 'none'
        })
        return
      }
      if (res.code == 2000) {
        this.setData({
          wxlogin: false
        })
        return
      }
      if (res.code == 0) {
        _this.setData({
          balance: res.data.balance.toFixed(2),
          freeze: res.data.freeze.toFixed(2),
          totleConsumed: res.data.totleConsumed.toFixed(2),
          score: res.data.score
        });
      }
    })
    this.fetchTabData(this.data.activeIndex)
  },
  fetchTabData(activeIndex){
    if (activeIndex == 0) {
      this.cashLogs()
    }
    if (activeIndex == 1) {
      this.withDrawlogs()
    }
    if (activeIndex == 2) {
      this.depositlogs()
    }
  },
  cashLogs() {
    const _this = this
    WXAPI.cashLogs({
      token: wx.getStorageSync('token'),
      page:1,
      pageSize:50
    }).then(res => {
      if (res.code == 0) {
        _this.setData({
          cashlogs: res.data
        })
      }
    })
  },
  withDrawlogs() {
    const _this = this
    WXAPI.withDrawLogs({
      token: wx.getStorageSync('token'),
      page:1,
      pageSize:50
    }).then(res => {
      if (res.code == 0) {
        _this.setData({
          withDrawlogs: res.data
        })
      }
    })
  },
  depositlogs() {
    const _this = this
    WXAPI.depositList({
      token: wx.getStorageSync('token'),
      page:1,
      pageSize:50
    }).then(res => {
      if (res.code == 0) {
        _this.setData({
          depositlogs: res.data.result
        })
      }
    })
  },
  recharge: function (e) {
    wx.navigateTo({
      url: "/pages/recharge/index"
    })
  },
  withdraw: function (e) {
    wx.navigateTo({
      url: "/pages/withdraw/index"
    })
  },
  payDeposit: function (e) {
    wx.navigateTo({
      url: "/pages/deposit/pay"
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    this.fetchTabData(e.currentTarget.id)
  },
  cancelLogin(){
    wx.switchTab({
      url: '/pages/my/index'
    })
  },
  processLogin(e){
    if (!e.detail.userInfo) {
      wx.showToast({
        title: i18n._('已取消'),
        icon: 'none',
      })
      return;
    }
    AUTH.register(this);
  },
  setI18nInfo: function() {
    i18n.setTabBarLanguage()
    wx.setNavigationBarTitle({
      title: i18n._('我的资产'),
    })
    this.setData({
      _t: wx.getStorageSync('LanguageMap')
    })
  },
})