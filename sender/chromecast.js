// Chromecast sender API wrapper

var chromecast = (function(self) {
  self.appId = self.appId || undefined;
  self.namespace = self.namespace || 'urn:x-cast:message';
  self.onMessage = self.onMessage || $.noop;
  self.onError = self.onError || function(e) {console.log(e)};

  window['__onGCastApiAvailable'] = function(loaded, error) {
    if (loaded) {
      var sessionRequest = new chrome.cast.SessionRequest(self.appId);
      var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
      chrome.cast.initialize(apiConfig, $.noop, onerror);
    }
    else onerror(error);
  };

  function sessionListener(session) {
    self.session = session;
    self.session.addMessageListener(self.namespace, self.onMessage);
  }

  function receiverListener(e) {
    if (e === chrome.cast.ReceiverAvailability.AVAILABLE)
      chrome.cast.requestSession(sessionListener)
  }

  self.message = function(message, callback) {
    self.session.sendMessage(self.namespace, message, callback || $.noop, onerror);
  };

  return self;
})(chromecast || {});
