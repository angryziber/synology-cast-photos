// Chromecast sender API wrapper

var chromecast = (function(self) {
  self = $.extend({
    appId: undefined,
    namespace: 'urn:x-cast:message',
    onMessage: $.noop,
    onError: function(e) {console.log(e)}
  }, self);

  window['__onGCastApiAvailable'] = function(loaded, error) {
    if (loaded) {
      var sessionRequest = new chrome.cast.SessionRequest(self.appId);
      var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
      chrome.cast.initialize(apiConfig, $.noop, onerror);
    }
    else self.onError(error);
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
    self.session.sendMessage(self.namespace, message, callback || $.noop, self.onError);
  };

  return self;
})(chromecast || {});
