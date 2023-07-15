import React from "react"
import jsCookies from 'js-cookie'
import { Input, Divider, Tag, message } from 'antd'
import { useStorage } from "@plasmohq/storage/hook"
import empty from "data-base64:~assets/empty.svg"
import cookie from "data-base64:~assets/cookie.png"
import TagGroup from './components/TagGroup'
import './style.less'

/** 默认 tag 颜色 */
const DEFAULT_COLOR = "#3b5999"

const HostnameContainer: React.FC<{
  children: (hostname: string) => React.ReactNode
}> = props => {
  const { children } = props

  const [hostname, setHostname] = React.useState('')

  React.useEffect(() => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      const currentUrl = tabs[0].url
      try {
        const { hostname } = new URL(currentUrl) || {}
        setHostname(hostname)
      } catch (error) {
        
      }
    });
  }, [])

  if (!hostname) {
    return (
      <h1>loading</h1>  
    )
  }
  return children(hostname)
}


const Popup = props => {
  const { hostname } = props
  const [cookies, setCookies] = React.useState([])
  const [storageData = {}, setStorageData] = useStorage(hostname)
  const [cookieName, setCookieName] = React.useState("")

  /** 获取并存储当前页面的 cookie 信息 */
  const getCurrentPageCookies = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "COOKIES" }, (cookies) => {
        setCookies(cookies)
      });
    });
  }

  React.useEffect(() => {
    getCurrentPageCookies()
  }, [])

  /** 新增 cookie */
  const handleCreateCookieName = () => {
    if (!cookieName) return
    if (storageData[cookieName]) {
      message.error(`${cookieName} - 已存在`)
      return
    }
    const newData = {
      ...storageData,
      [cookieName]: {
        list: []
      }
    }
    setStorageData(newData)
    setCookieName("")
  }

  /** 删除 cookie */
  const handleDeleteCookieName = (name: string) => {
    const newData = {
      ...storageData,
    }
    delete newData[name]
    setStorageData(newData)
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
    const newTags = storageData[cookieName].list.filter(tag => tag !== deleteValue);
    const currentValue = jsCookies.get(cookieName)
    if (currentValue === deleteValue) {
      jsCookies.remove(cookieName)
    }
    setStorageData({
      ...storageData,
      [cookieName]: {
        ...storageData[cookieName],
        list: newTags,
      }
    })
  }

  /** 切换 cookie */
  const handleCookieValueChange = (cookieName: string, nextValue: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const cookieDetails = {
        url: tabs[0].url,
        name: cookieName,
        value: nextValue,
        path: "/",
        expirationDate: new Date().getTime() + 10000
      };
      chrome.cookies.set(cookieDetails, cookie => {
        console.log('cookie: ', cookie);
        getCurrentPageCookies()
      });
    });
  }

  const noData = Object.keys(storageData).length === 0
  const style: React.CSSProperties = {
    backgroundColor: "#f6f9fa",
  }

  if (noData) {
    style.backgroundImage = `url(${empty})`
  }

  return (
    <div className="container">
      <header>
        <img src={cookie} alt="" />
        <span className="name">Cookie 管理器</span>
      </header>
      <div className="main">
        <div style={style}>
          <div className="list">
            {Object.keys(storageData).map(name => {
              const value = cookies[name]
              const list = storageData[name].list || []
              return (
                <div key={name} style={{ marginBottom: 16 }}>
                  <Divider orientation="left" orientationMargin="0">
                    <Tag closable color={DEFAULT_COLOR} onClose={() => handleDeleteCookieName(name)}>
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
            placeholder='输入新的 cookie 名称，然后回车'
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
