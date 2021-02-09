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

  sessionListener(session) {
    this.session = session
    document.body.removeEventListener('click', this.requestStart)
    session.addMessageListener(this.namespace, this.onMessage)
    session.addUpdateListener(() => {
      if (session.status != chrome.cast.SessionStatus.CONNECTED)
        this.session = null
    })
  }

  receiverListener(e) {
    if (e === chrome.cast.ReceiverAvailability.AVAILABLE && !this.session)
      document.body.addEventListener('click', this.requestStart)
  }

  start(callback) {
    chrome.cast.requestSession(session => {
      this.sessionListener(session)
      if (callback) callback()
    }, this.onError)
  }

  requestStart = () => this.start()

  message(message, callback) {
    const sendMessage = () => this.session.sendMessage(this.namespace, message, callback || (() => {}), this.onError)
    if (this.session) sendMessage()
    else this.start(sendMessage)
  }
}
