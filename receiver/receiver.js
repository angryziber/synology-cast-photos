function Receiver(config, content, keyboard) {
  var self = Object.assign(this, config);

  if (navigator.userAgent.indexOf('CrKey') >= 0)
    initAsReceiver(); // running under Chromecast - receive commands from Chromecast senders
  else
    initAsStandalone(); // running as standalone web page - take commands from location hash

  window.onhashchange = function() {
    if (location.hash) self.onCommand(decodeURIComponent(location.hash.substring(1)));
  };
  setTimeout(onhashchange, 0);

  function initAsReceiver() {
    var receiverManager = cast.receiver.CastReceiverManager.getInstance();
    content.supports4k = receiverManager.canDisplayType('video/mp4', 'hev1.1.2.L150', 3840, 2160);

    self.messageBus = receiverManager.getCastMessageBus(self.namespace);
    self.messageBus.onMessage = function(e) {
      self.onCommand(e.data);
    };

    receiverManager.onSenderConnected(function(e) {
      self.messageBus.send(e.senderId, content.supports4k ? 'mode:video' : 'mode:img');
    });

    var config = new cast.receiver.CastReceiverManager.Config();
    config.maxInactivity = 60000;
    receiverManager.start(config);
  }

  function initAsStandalone() {
    content.supports4k = window.innerHeight * window.devicePixelRatio > 1080;
    if (keyboard) keyboard.init();
  }

  self.broadcast = function(message) {
    if (self.messageBus) self.messageBus.broadcast(message);
  };

  self.onCommand = function(command) {
    var separatorPos = command.indexOf(':');
    if (separatorPos == -1) separatorPos = command.length;
    var cmd = command.substring(0, separatorPos);
    var arg = command.substring(separatorPos + 1);
    var title = command;

    if (cmd == 'rnd') {
      if (arg) content.loadUrls(arg, true);
      else content.random();
    }
    else if (cmd == 'seq') {
      if (arg) content.loadUrls(arg, false);
      else content.sequential();
    }
    else if (cmd == 'interval') {
      content.interval = parseInt(arg) * 1000;
      title = 'Interval: ' + arg + 's';
    }
    else if (cmd == 'style') {
      content.style(arg);
    }
    else if (cmd == 'prev') {
      content.prev(arg);
    }
    else if (cmd == 'next') {
      content.next(arg);
    }
    else if (cmd == 'pause') {
      content.pause();
    }
    else if (cmd == 'mark') {
      content.mark(arg);
    }
    else if (cmd == 'photos') {
      location.href = location.origin + '/receiver/#' + arg;
    }
    else if (cmd == 'videos') {
      location.href = location.origin + '/receiver/video.html#' + arg;
    }
    else if (cmd == 'audio') {
      if (arg == 'prev') audio.prev();
      else if (arg == 'next') audio.next();
      else if (arg == 'stop') audio.stop();
      else {
        arg = arg.split('#');
        audio.addToPlaylist(arg[0], arg[1]);
      }
      title = null;
    }
    else {
      content.loadUrls(cmd, true);
    }

    if (title) {
      content.title(title);
      self.broadcast(title);
    }
  }
}
