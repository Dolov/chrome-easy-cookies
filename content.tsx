import React from 'react'
import Cookies from 'js-cookie'

export interface contentProps {
  
}

const Content: React.FC<contentProps> = props => {

  React.useEffect(() => {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.type === 'COOKIES') {
        sendResponse(Cookies.get())
      }
    });
  }, [])

  return null
}

export default Content
