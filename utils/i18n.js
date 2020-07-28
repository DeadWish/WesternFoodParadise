function getLanguage() {
  //返回缓存中的language属性 (en / zh_CN) 	
  return wx.getStorageSync('Language') || 'zh_CN'
};
function getLanguageIndex() {
  if (this.getLanguage() == 'zh_CN') {
    return 0
  } else {
    return 1
  }
}
function translate(){
  //返回翻译的对照信息
  return require('../i18n/'+ getLanguage() + '.js').languageMap;
}

function translateTxt(desc){
  //翻译，如果没有就返回原文
  return translate()[desc] || desc;
}

function setTabBarLanguage(){
  wx.setTabBarItem({
    index: 0,
    pagePath: "pages/index/index",
    iconPath: "images/nav/home-off.png",
    selectedIconPath: "images/nav/home-on.png",
    text: translateTxt("首页")
  })

  wx.setTabBarItem({
    index: 1,
    pagePath: "pages/category/category",
    iconPath: "images/nav/ic_catefory_normal.png",
    selectedIconPath: "images/nav/ic_catefory_pressed.png",
    text: translateTxt("分类")
  })

  wx.setTabBarItem({
    index: 2,
    pagePath: "pages/shop-cart/index",
    iconPath: "images/nav/cart-off.png",
    selectedIconPath: "images/nav/cart-on.png",
    text: translateTxt("购物车")
  })

  wx.setTabBarItem({
    index: 3,
    pagePath: "pages/my/index",
    iconPath: "images/nav/my-off.png",
    selectedIconPath: "images/nav/my-on.png",
    text: translateTxt("我的")
  })
}
module.exports = {
  setTabBarLanguage: setTabBarLanguage,
  getLanguageIndex: getLanguageIndex,
  getLanguage: getLanguage,
  _t: translate,
  _: translateTxt,
}