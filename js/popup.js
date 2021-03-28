



const ReviewApp = {
  data() {
      return {
        cookies: {},
        cookieName: '',
        createBtnText: '新建 cookie',
      }
  },
  mounted() {
    
  },
  methods: {
    focus() {
      const cookieLenght = Object.keys(this.cookies).length
      if (cookieLenght === 0) {
        this.$refs.inputRef.focus()
      }
    },
    /** 初始化，读取缓存的数据添加至应用 */
    async init() {
      const cookies = await this.getCookies()
      this.cookies = cookies
    },

    /** 创建新的 cookie */
    async createCookieName() {
      if (!this.cookieName) return
      if (this.cookies[this.cookieName]) return
      await this.setCookies(this.cookieName)
      await this.init()
      this.cookieName = ''
    },

    /** 添加 cookie 值 */
    async addCookieValue(cookieName) {
      const currentValue = this.$refs[`inputRef-${cookieName}`]?.value
      if (!currentValue) return
      if (this.cookies[cookieName].includes(currentValue)) return
      await this.setCookies(cookieName, currentValue)
      await this.init()
    },

    /** 从本地获取 cookies 数据 */
    async getCookies() {
      const hostname = await this.getHostname()
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
    async setCookies(cookieName, cookieValue) {
      const hostname = await this.getHostname()
      const cookies = await this.getCookies()
      const currentList = cookies[cookieName] || []
      if (cookieValue) {
        currentList.unshift(cookieValue)
      }
      
      const value = {
        ...cookies,
        [cookieName]: currentList
      }
      chrome.storage.sync.set({[hostname]: value})
    },

    /** 获取当前激活 tab 的 url */
    async getHostname() {
      return new Promise(resolve => {
        chrome.tabs.query({active: true}, (tabs) => {
          const { hostname } = new URL(tabs[0].url)
          resolve(hostname)
        })
      })
    }
  },
  async created() {
    await this.init()
    this.focus()
  },
}

Vue.createApp(ReviewApp).mount('#container')
