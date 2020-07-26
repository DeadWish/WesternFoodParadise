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

module.exports = {
  getLanguageIndex: getLanguageIndex,
  getLanguage: getLanguage,
  _t: translate,
  _: translateTxt,
}