import React from "react"
import { Input, Divider, Tag, message, Checkbox } from 'antd'
import { useStorage } from "@plasmohq/storage/hook"
import empty from "data-base64:~assets/empty.svg"
import cookie from "data-base64:~assets/cookie.png"
import disabled from "data-base64:~assets/disabled.svg"
import TagGroup from './components/TagGroup'
import { i18n, sendMessage } from './utils'
import './style.less'

/** COOKIE 名称的默认颜色 */
const DEFAULT_TAG_COLOR = "#3b5999"

/** 容器的默认背景色 */
const DEFAULT_BACKGROUND = "#f6f9fa"

const CONTAINER_CLASS_NAME = "container"

/** 展示所有 cookie */
const ShowAll: React.FC<{
  cookies,
  visible,
}> = props => {
  const { cookies, visible } = props

  if (!visible) return null
  return (
    <div className="show-all-container">
      {Object.keys(cookies).map(name => {
        return (
          <div className="cookie-item">
            <Tag bordered={false}>{name}</Tag>
            <Tag color="success" bordered={false}>{cookies[name]}</Tag>
          </div>
        )
      })}
    </div>
  )
}

/** 获取到 hostname 后再然后组件内容 */
const HostnameContainer: React.FC<{
  children: (hostname: string) => React.ReactNode
}> = props => {
  const { children } = props

  const [hostname, setHostname] = React.useState<string>(null)

  React.useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const currentUrl = tabs[0].url
      if (
        !currentUrl ||
        currentUrl.startsWith("chrome://") ||
        currentUrl.startsWith("chrome-extension://")
      ) {
        setHostname("")
      } else {
        const { hostname } = new URL(currentUrl)
        setHostname(hostname)
      }
    });
  }, [])

  if (hostname === null) {
    return (
      <div className="mt-16 flex-center" style={{ padding: 12, whiteSpace: "nowrap", fontWeight: "bold" }}>
        <span>{i18n.init}</span>
      </div>
    )
  }

  if (hostname === "") {
    return (
      <div className="mt-16 flex-center" style={{ padding: 12, whiteSpace: "nowrap", fontWeight: "bold" }}>
        <img style={{ width: 24, height: 24, marginRight: 6 }} src={disabled} />
        <span>{i18n.disabled} Cookie</span>
      </div>
    )
  }
  return children(hostname)
}


const Popup = props => {
  const { hostname } = props
  const [visible, setVisible] = React.useState(false)
  const [cookies, setCookies] = React.useState([])
  const [storageData = {}, setStorageData] = useStorage(hostname)
  const [cookieName, setCookieName] = React.useState("")

  /**
   * 获取并存储当前页面的 cookie 信息
   * 由于 chrome.cookies.getAll api 获取的数据不完整，所以通过 content-scripts 获取
   */
  const getCurrentPageCookies = async () => {
    const cookies = await sendMessage({ type: "GET_ALL" })
    setCookies(cookies)
  }

  const deleteBrowserCookie = async (cookieName: string) => {
    const cookies = await sendMessage({ type: "DELETE", data: cookieName })
    setCookies(cookies)
  }

  React.useEffect(() => {
    getCurrentPageCookies()
  }, [])

  /** 新增 cookie */
  const handleCreateCookieName = () => {
    if (!cookieName) return
    if (storageData[cookieName]) {
      message.error(`${cookieName} - ${i18n.existsMessage}`)
      return
    }
    const newData = {
      ...storageData,
      [cookieName]: {
        list: []
      }
    }
    setCookieName("")
    setStorageData(newData)
  }

  /** 删除 cookie */
  const handleDeleteCookieName = (name: string) => {
    const newData = {
      ...storageData,
    }
    delete newData[name]
    setStorageData(newData)
    deleteBrowserCookie(name)
  }

  /** 新增 cookie 值 */
  const handleCreateCookieValue = (cookieName: string, value: string) => {
    const newData = {
      ...storageData,
      [cookieName]: {
        ...storageData[cookieName],
        list: [...storageData[cookieName].list, value],
      }
    }
    setStorageData(newData)
  }

  /** 删除 cookie 值 */
  const handleDeleteCookieValue = (cookieName: string, deleteValue: string) => {
    deleteBrowserCookie(cookieName)
    const newTags = storageData[cookieName].list.filter(tag => tag !== deleteValue);
    setStorageData({
      ...storageData,
      [cookieName]: {
        ...storageData[cookieName],
        list: newTags,
      }
    })
  }

  /** 切换 cookie */
  const handleCookieValueChange = async (cookieName: string, nextValue: string) => {
    const cookies = await sendMessage({
      type: "CREATE",
      data: {
        name: cookieName,
        value: nextValue,
      }
    })
    setCookies(cookies)
  }

  const noData = Object.keys(storageData).length === 0
  const style: React.CSSProperties = {
    backgroundColor: DEFAULT_BACKGROUND,
  }

  if (noData) {
    style.backgroundImage = `url(${empty})`
  }

  return (
    <div className={CONTAINER_CLASS_NAME}>
      <header>
        <div className="flex-center">
          <img src={cookie} />
          <span className="name">Cookie {i18n.title}</span>
        </div>
        <Checkbox checked={visible} onChange={e => setVisible(e.target.checked)}>
          {i18n.showAll}
        </Checkbox>
      </header>
      <div className="main">
        <div style={style}>
          <div className="list">
            <ShowAll visible={visible} cookies={cookies} />
            {Object.keys(storageData).map(name => {
              const value = cookies?.[name]
              const list = storageData[name]?.list || []
              return (
                <div key={name} style={{ marginBottom: 16 }}>
                  <Divider orientation="left" orientationMargin="0">
                    <Tag
                      closable
                      color={DEFAULT_TAG_COLOR}
                      onClose={() => handleDeleteCookieName(name)}
                    >
                      {name}
                    </Tag>
                  </Divider>
                  <TagGroup
                    name={name}
                    data={list}
                    value={value}
                    onCreate={handleCreateCookieValue}
                    onDelete={handleDeleteCookieValue}
                    onChange={handleCookieValueChange}
                  />
                </div>
              )
            })}
          </div>
          <Input
            autoFocus
            value={cookieName}
            onChange={e => setCookieName(e.target.value)}
            placeholder={i18n.placeholder}
            onPressEnter={handleCreateCookieName}
          />
        </div>
      </div>
    </div>
  )
}

export default () => {
  return (
    <HostnameContainer>
      {hostname => <Popup hostname={hostname} />}
    </HostnameContainer>
  )
}
