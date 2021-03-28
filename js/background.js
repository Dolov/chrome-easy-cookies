const getCookies = (currentUrl, cookieName) => {
	/** 读取数据 */
	return new Promise(resolve => {
    chrome.storage.sync.get(currentUrl, (cookies) => {
      if (cookieName) {
        resolve(cookies[cookieName] || [])
      } else {
        resolve(cookies)
      }
    })
  })
}

const setCookieList = async (currentUrl, cookieName, cookieValue) => {
  const cookies = await getCookies(currentUrl)
  const currentList = cookies[cookieName] || []
	/** 保存数据 */
  chrome.storage.sync.set({[currentUrl]: {
    ...cookies,
    [cookieName]: [cookieValue, ...currentList]
  }}, () => {
    
  })
}

setCookieList('app.clickpaas.com', 'userTag', 'beta')


