// Chromecast sender API wrapper

var chromecast = (function(self) {
  // required self.appId
  self.namespace = 'urn:x-cast:message';

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
    self.session.addMessageListener(self.namespace, messageListener);
  }

  function receiverListener(e) {
    if (e === chrome.cast.ReceiverAvailability.AVAILABLE)
      chrome.cast.requestSession(sessionListener)
  }

  self.message = function(message, callback) {
    self.session.sendMessage(self.namespace, message, callback || $.noop, onerror);
  };

  function messageListener(ns, text) {
    $('#status').text(text).show().fadeOut(2000);
  }

  function onerror(e) {
    console.log(e);
  }

  return self;
})(chromecast || {});
