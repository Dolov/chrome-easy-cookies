function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime()+((exdays || 100)*24*60*60*1000));
  var expires = "expires="+d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(name)
{
  var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  if(arr=document.cookie.match(reg))
  return unescape(arr[2]);
  else
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  const { type, payload } = request
  if (type === 'setCookie') {
    const { name, value, exdays } = payload
    setCookie(name, value, exdays)
    callback(true)
  }
  if (type === 'getCookie') {
    const { name } = payload
    callback(getCookie(name))
  }
})