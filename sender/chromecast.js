// Chromecast sender API wrapper

function Chromecast(config) {
  const self = {
    namespace: 'urn:x-cast:message',
    onMessage: () => {},
    onError: e => console.log(e),
    ...this
  }

  window['__onGCastApiAvailable'] = function(loaded, error) {
    if (loaded) {
      var sessionRequest = new chrome.cast.SessionRequest(config.castAppId)
      var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener)
      chrome.cast.initialize(apiConfig, () => {}, onerror)
    }
    else self.onError(error)
  }

  function sessionListener(session) {
    self.session = session
    session.addMessageListener(self.namespace, self.onMessage)
    session.addUpdateListener(function() {
      if (session.status != chrome.cast.SessionStatus.CONNECTED) {
        self.session = null
      }
    })
  }

  function receiverListener(e) {
    if (e === chrome.cast.ReceiverAvailability.AVAILABLE && !self.session) {
      const handler = () => {
        self.start()
        document.body.removeEventListener('click', handler)
      }
      document.body.addEventListener('click', handler)
    }
  }

  self.start = function(callback) {
    chrome.cast.requestSession(session => {
      sessionListener(session)
      if (callback) callback()
    }, self.onError)
  }

  self.message = function(message, callback) {
    function sendMessage() {
      self.session.sendMessage(self.namespace, message, callback || (() => {}), self.onError)
    }

    if (self.session) sendMessage()
    else self.start(sendMessage)
  }

  return self
}
