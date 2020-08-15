const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const i18n = require('../../utils/i18n');
const { languageMap } = require('../../i18n/en');

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    couponInput: '', // 输入的优惠券码
    sysCoupons: [], //可领取的优惠券列表
    myCoupons: [], //已领取的可用优惠券列表
    invalidCoupons: [] //已失效的优惠券
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    if (options.activeIndex) {
      this.setData({
        activeIndex: options.activeIndex,
      });
    }
    
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },
  onShow: function () {
    this.sysCoupons()    
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.getMyCoupons()
        this.invalidCoupons()
      }
    })
    this.setI18nInfo();
    this.setData({
      tabs: [i18n._("可领券"), i18n._("已领券"),i18n._("已失效")],
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
    });
  },
  getCounponByPwd(e){ // 通过优惠码领取优惠券
    const _this = this;
    const pwd = e.detail.value.pwd;
    if(!pwd){
      wx.showToast({
        title: i18n._('请输入优惠码'),
        icon: 'none'
      })
      return
    }
    WXAPI.fetchCoupons({
      pwd: pwd,
      token: wx.getStorageSync('token')
    }).then(function (res) {
      if (res.code == 20001 || res.code == 20002) {
        wx.showToast({
          title: i18n._('您来晚了'),
          icon: 'none'
        })
        return;
      }
      if (res.code == 20003) {
        wx.showToast({
          title: i18n._('你领过了，别贪心哦'),
          icon: 'none'
        })
        return;
      }
      if (res.code == 30001) {
        wx.showToast({
          title: i18n._('您的积分不足'),
          icon: 'none'
        })
        return;
      }
      if (res.code == 20004) {
        wx.showToast({
          title: i18n._('已过期'),
          icon: 'none'
        })
        return;
      }
      if (res.code == 700) {
        wx.showToast({
          title: i18n._('优惠码不存在'),
          icon: 'none'
        })
        return;
      }
      if (res.code == 0) {
        wx.showModal({
          title: i18n._('成功'),
          content: i18n._('您已成功领取优惠券，赶快去下单使用吧！'),
          showCancel: false,
          confirmText: i18n._('确认')
        })
        _this.setData({
          couponInput: ''
        })
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      }
    })
  },
  sysCoupons: function () { // 读取可领取券列表
    var _this = this;
    WXAPI.coupons().then(function (res) {
      if (res.code == 0) {
        _this.setData({
          sysCoupons: res.data
        });
      }
    })
  },
  getCounpon: function (e) {
    const that = this
    if (e.currentTarget.dataset.pwd) {
      wx.showToast({
        title: i18n._('请通过优惠券码兑换'),
        icon: 'none'
      })
      return
    }
    WXAPI.fetchCoupons({
      id: e.currentTarget.dataset.id,
      token: wx.getStorageSync('token')
    }).then(function (res) {
      if (res.code == 20001 || res.code == 20002) {
        wx.showModal({
          title: i18n._('错误'),
          content: i18n._('来晚了'),
          showCancel: false
        })
        return;
      }
      if (res.code == 20003) {
        wx.showModal({
          title: i18n._('错误'),
          content: i18n._('你领过了，别贪心哦'),
          showCancel: false,
          confirmText: i18n._('确定')
        })
        return;
      }
      if (res.code == 30001) {
        wx.showModal({
          title: i18n._('错误'),
          content: i18n._('您的积分不足'),
          showCancel: false,
          confirmText: i18n._('确定')
        })
        return;
      }
      if (res.code == 20004) {
        wx.showModal({
          title: i18n._('错误'),
          content: i18n._('已过期'),
          showCancel: false,
          confirmText: i18n._('确定')
        })
        return;
      }
      if (res.code == 0) {
        wx.showToast({
          title: i18n._('领取成功，赶紧去下单吧'),
          icon: 'success',
          duration: 2000
        })
      } else {
        wx.showModal({
          title: i18n._('错误'),
          content: res.msg,
          showCancel: false
        })
      }
    })
  },
  getMyCoupons: function () {
    var _this = this;
    WXAPI.myCoupons({
      token: wx.getStorageSync('token'),
      status: 0
    }).then(function (res) {
      if (res.code == 0) {
        _this.setData({
          myCoupons: res.data
        })
      }
    })
  },
  invalidCoupons: function () {
    var _this = this;
    WXAPI.myCoupons({
      token: wx.getStorageSync('token'),
      status: '1,2,3'
    }).then(function (res) {
      if (res.code == 0) {
        _this.setData({
          invalidCoupons: res.data
        })
      }
    })
  },
  setI18nInfo: function() {
    i18n.setTabBarLanguage()
    wx.setNavigationBarTitle({
      title: i18n._('领券中心'),
    })
    this.setData({
      _t: wx.getStorageSync('LanguageMap')
    })
  },
})