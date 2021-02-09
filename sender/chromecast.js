// Chromecast sender API wrapper

export class Chromecast {
  namespace = 'urn:x-cast:message'
  onMessage = () => {}
  onError = e => console.log(e)

  constructor(appId) {
    window['__onGCastApiAvailable'] = (loaded, error) => {
      if (loaded) {
        const sessionRequest = new chrome.cast.SessionRequest(appId)
        const apiConfig = new chrome.cast.ApiConfig(sessionRequest, this.sessionListener.bind(this), this.receiverListener.bind(this))
        chrome.cast.initialize(apiConfig, () => {}, this.onError)
      }
      else this.onError(error)
    }
  }

  sessionListener(session, callback) {
    this.session = session
    this.message('url:' + location.href.replace('/sender/', '/receiver/'), callback)
    session.addMessageListener(this.namespace, this.onMessage)
    session.addUpdateListener(() => {
      if (session.status != chrome.cast.SessionStatus.CONNECTED) this.session = null
    })
  }

  receiverListener(status) {
    if (!this.session) console.log('receiver: ' + status)
  }

  start(callback) {
    chrome.cast.requestSession(session => this.sessionListener(session, callback), this.onError)
  }

  message(message, callback) {
    if (this.session) this.session.sendMessage(this.namespace, message, callback || (() => {}), this.onError)
    else this.start(() => this.message(message, callback))
  }
}
