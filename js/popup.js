
const ReviewApp = {
  data() {
    return {
      /** 当前域名下的 cookie 信息 */
      cookies: {},
      /** 添加值的 cookie 名称 */
      addValueInputName: '',
      /** 当前域名下的 cookie 信息 */
      currentCookiesValue: {},
      /** 新建 cookie 的 input 是否可见 */
      createNewCookieInputVisible: false,
    }
  },
  mounted() {
    
  },
  computed: {
    
  },
  methods: {
    /** 初始化，读取缓存的数据添加至应用 */
    async init() {
      const cookies = await this.getCookiesInfo()
      this.cookies = cookies
      await this.getCurrentCookiesValue()
    },
    async getCurrentCookiesValue() {
      const cookiesValue = {}
      const cookiesName = Object.keys(this.cookies)
      for (const name of cookiesName) {
        const cookie = await this.getCookie(name)
        cookiesValue[name] = cookie?.value
      }
      this.currentCookiesValue = cookiesValue
    },

    /** 切换 cookie 值 */
    async onCookieValueChange(cookieName, cookieValue) {
      await this.setCookie(cookieName, cookieValue)
      await this.getCurrentCookiesValue()
    },

    preCreateCookieName() {
      this.createNewCookieInputVisible = true
      setTimeout(() => {
        this.$refs.createNewCookieinputRef.focus()
      }, 0)
    },
    /** 创建新的 cookie */
    async createCookieName() {
      const newCookieName = this.$refs.createNewCookieinputRef.value
      if (!newCookieName) return
      if (this.cookies[newCookieName]) return
      await this.storeCookies(newCookieName)
      await this.init()
      this.$refs.createNewCookieinputRef.value = ''
    },

    /** 添加 cookie 值 */
    async addCookieValue(cookieName) {
      const currentValue = this.$refs[`inputRef-${cookieName}`]?.value
      if (!currentValue) return
      if (this.cookies[cookieName].includes(currentValue)) return
      await this.storeCookies(cookieName, currentValue)
      await this.init()
      this.addValueInputName = ''
      await this.onCookieValueChange(cookieName, currentValue)
    },

    toggleInputVisible(cookieName) {
      this.addValueInputName = cookieName
      setTimeout(() => {
        this.$refs[`inputRef-${cookieName}`].focus()
      }, 10)
    },

    /** 从本地获取 cookies 数据 */
    async getCookiesInfo() {
      const { hostname } = await this.getHostname()
      return new Promise(resolve => {
        chrome.storage.sync.get(hostname, (cookies) => {
          if (cookies && cookies[hostname]) {
            resolve(cookies[hostname])
          } else {
            resolve({})
          }
        })
      })
    },

    /** 持久化数据至本地 */
    async storeCookies(cookieName, cookieValue, type) {
      const { hostname } = await this.getHostname()
      const cookies = await this.getCookiesInfo()
      let currentList = cookies[cookieName] || []
      if (cookieValue) {
        currentList.unshift(cookieValue)
      }

      if (type === 'delete-value') {
        currentList = currentList.filter(item => item !== cookieValue)
      }

      const value = {
        ...cookies,
        [cookieName]: currentList
      }

      if (type === 'delete-name') {
        delete value[cookieName]
      }
      chrome.storage.sync.set({[hostname]: value})
    },

    async getCookie(cookieName) {
      const { origin, hostname } = await this.getHostname()
      return new Promise(resolve => {
        chrome.cookies.get({url: origin, "name": cookieName}, (cookie) => {
          resolve(cookie)
        })
      })
    },

    async setCookie(cookieName, cookieValue) {
      const { origin } = await this.getHostname()
      return new Promise(resolve => {
        chrome.cookies.set({
          url: origin,
          name: cookieName,
          value: cookieValue
        }, resolve) 
      })
    },

    /** 获取当前激活 tab 的 url */
    async getHostname() {
      return new Promise(resolve => {
        chrome.tabs.query({active: true}, (tabs) => {
          const { hostname, origin } = new URL(tabs[0].url)
          resolve({
            origin,
            hostname,
          })
        })
      })
    },
    checked(cookieName, cookieValue) {
      return this.currentCookiesValue[cookieName] === cookieValue
    },
    async deleteCookieValue(cookieName, cookieValue) {
      await this.storeCookies(cookieName, cookieValue, 'delete-value')
      await this.init()
      if (this.currentCookiesValue[cookieName] === cookieValue) {
        await this.setCookie(cookieName, null)
      }
    },
    async deleteCookieName(cookieName) {
      await this.storeCookies(cookieName, null, 'delete-name')
      await this.init()
      await this.setCookie(cookieName, null)
    }
  },
  async created() {
    await this.init()
  },
}

Vue.createApp(ReviewApp).mount('#container')

