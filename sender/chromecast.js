// Chromecast sender API wrapper

var chromecast = (function(self) {
  self = $.extend({
    appId: undefined,
    namespace: 'urn:x-cast:message',
    onMessage: $.noop,
    onError: function(e) {console.log(e)}
  }, self);

  $('<script src="//www.gstatic.com/cv/js/sender/v1/cast_sender.js" async></script>').appendTo('body');
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
    session.addMessageListener(self.namespace, self.onMessage);
    session.addUpdateListener(function() {
      if (session.status != chrome.cast.SessionStatus.CONNECTED) {
        self.session = null;
      }
    });
  }

  function receiverListener(e) {
    if (e === chrome.cast.ReceiverAvailability.AVAILABLE && !self.session) {
      $('body').one('click', () => self.start());
    }
  }

  self.start = function(callback) {
    chrome.cast.requestSession(function(session) {
      sessionListener(session);
      if (callback) callback();
    }, self.onError);
  };

  self.message = function(message, callback) {
    function sendMessage() {
      self.session.sendMessage(self.namespace, message, callback || $.noop, self.onError);
    }

    if (self.session) sendMessage();
    else self.start(sendMessage);
  };

  return self;
})(chromecast || {});
