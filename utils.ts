
const getLanguage = () => {
  const lang = chrome.i18n.getUILanguage();
  if (!lang) return 'en'
  if (
    lang.toLowerCase().includes('zh') ||
    lang.toLowerCase().includes('cn')
  ) return 'zh'
  return 'en'
}

/** 国际化词条 */
const i18nTextMap = {
  en: {
    title: "Manager",
    existsMessage: "Already exists",
    placeholder: 'Enter a new cookie name and press Enter',
    disabled: "The current page cannot set",
    init: "Plugin initialization in progress",
    showAll: "Show All",
  },
  zh: {
    title: "管理器",
    existsMessage: "已存在",
    placeholder: '输入新的 cookie 名称，然后回车',
    disabled: "当前页面无法设置",
    init: "插件初始化中",
    showAll: "显示全部",
  }
}

/** 当前语言环境下的词条 */
const lang = getLanguage()
export const i18n = i18nTextMap[lang]

/** 插件异步通信 */
export const sendMessage = (message: Record<string, any>): Promise<any> => {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, message, response => {
        resolve(response)
      });
    });
  })
}