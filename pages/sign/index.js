import initCalendar from '../../template/calendar/index';
import { setTodoLabels } from '../../template/calendar/index';
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const i18n = require('../../utils/i18n')
let interstitialAd = null

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-b5abb25cb93c2769'
      })
      interstitialAd.onLoad(() => { })
      interstitialAd.onError((err) => { })
      interstitialAd.onClose(() => { })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setI18nInfo()
  },
  doneShow: function () {
    initCalendar({
      afterTapDay: (currentSelect, allSelectedDays) => {
        // 不是今天，直接 return 
        const myDate = new Date();
        // console.log('y:', myDate.getFullYear())
        // console.log('m:', myDate.getMonth() + 1)
        // console.log('d:', myDate.getDate())
        if (myDate.getFullYear() != currentSelect.year ||
          (myDate.getMonth() + 1) != currentSelect.month ||
          myDate.getDate() != currentSelect.day) {
          return
        }
        if (currentSelect.hasTodo) {
          wx.showToast({
            title: i18n._('今天已签到'),
            icon: 'none'
          })
          return
        }
        WXAPI.scoreSign(wx.getStorageSync('token')).then(r => {
          wx.showToast({
            title: i18n._('签到成功'),
            icon: 'none'
          })
          setTodoLabels({
            pos: 'bottom',
            dotColor: '#40',
            days: [{
              year: currentSelect.year,
              month: currentSelect.month,
              day: currentSelect.day,
              todoText: i18n._('已签到')
            }],
          });
        })
      }
    });
    WXAPI.scoreSignLogs({
      token: wx.getStorageSync('token')
    }).then(res => {
      if (res.code == 0) {
        res.data.result.forEach(ele => {
          const _data = ele.dateAdd.split(" ")[0]
          setTodoLabels({
            pos: 'bottom',
            dotColor: '#40',
            days: [{
              year: parseInt(_data.split("-")[0]),
              month: parseInt(_data.split("-")[1]),
              day: parseInt(_data.split("-")[2]),
              todoText: i18n._('已签到')
            }],
          });
        })
      }
    })    
  },
  setI18nInfo: function() {
    i18n.setTabBarLanguage()
    wx.setNavigationBarTitle({
      title: i18n._('每日签到'),
    })
    this.setData({
      _t: wx.getStorageSync('LanguageMap'),
      language: i18n.getLanguage()
    })
  },
})