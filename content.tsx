import React from 'react'
import Cookies from 'js-cookie'

export interface contentProps {
  
}

const Content: React.FC<contentProps> = props => {

  React.useEffect(() => {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      const { type, data } = request
      if (type === 'GET_ALL') {
        sendResponse(Cookies.get())
      }
      if (type === 'DELETE') {
        Cookies.remove(data)
        sendResponse(Cookies.get())
      }
      if (type === 'CREATE') {
        const { name, value } = data
        Cookies.set(name, value)
        sendResponse(Cookies.get())
      }
    });
  }, [])

  return null
}

export default Content
