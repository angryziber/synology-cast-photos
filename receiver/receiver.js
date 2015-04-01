var receiver = (function(self) {
  if (navigator.userAgent.indexOf('CrKey') >= 0)
    initAsReceiver(); // running under Chromecast - receive commands from Chromecast senders
  else
    initAsStandalone(); // running as standalone web page - take commands from location hash

  function initAsReceiver() {
    var receiverManager = cast.receiver.CastReceiverManager.getInstance();

    self.messageBus = receiverManager.getCastMessageBus(self.namespace);
    self.messageBus.onMessage = function(e) {
      onCommand(e.data);
    };

    var config = new cast.receiver.CastReceiverManager.Config();
    config.maxInactivity = 60000;
    receiverManager.start(config);
  }

  self.broadcast = function(message) {
    if (self.messageBus) self.messageBus.broadcast(message);
  };

  function initAsStandalone() {
    window.onhashchange = function() {
      if (location.hash) onCommand(location.hash.substring(1));
    };
    setTimeout(onhashchange, 0);

    window.onresize = function() {
      resetCanvas(canvas);
      if (nextImg.width) renderPhoto(nextImg);
    };

    function commandPrompt() {
      var command = prompt('Photo dir/command', location.hash ? location.hash.substring(1) : '');
      if (command) location.hash = '#' + command;
    }

    window.onkeydown = function (e) {
      switch (e.which) {
        case 37:
        case 38:
          onCommand('prev');
          break;
        case 33:
          onCommand('prev:10');
          break;
        case 39:
        case 40:
          onCommand('next');
          break;
        case 34:
          onCommand('next:10');
          break;
        case 27:
          commandPrompt();
      }
    };

    window.onHammerLoaded = function () {
      var hammer = new Hammer($('body')[0]);
      hammer.on('swiperight', function () {
        onCommand('prev');
      });
      hammer.on('swipeleft', function () {
        onCommand('next');
      });
      hammer.on('press', function () {
        commandPrompt();
      });
    };

    document.write('<script src="//cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.4/hammer.min.js" onload="onHammerLoaded()"></script>');
  }

  function onCommand(command) {
    var separatorPos = command.indexOf(':');
    if (separatorPos == -1) separatorPos = command.length;
    var cmd = command.substring(0, separatorPos);
    var arg = command.substring(separatorPos + 1);
    var title = command;

    if (cmd == 'rnd') {
      photos.loadPhotoUrls(arg, true);
    }
    else if (cmd == 'seq') {
      photos.loadPhotoUrls(arg, false);
    }
    else if (cmd == 'interval') {
      photos.interval = parseInt(arg) * 1000;
      title = 'Interval: ' + arg + 's';
    }
    else if (cmd == 'prev') {
      photos.prev(arg);
    }
    else if (cmd == 'next') {
      photos.next(arg);
    }
    else if (cmd == 'audio') {
      if (arg == 'prev') audio.prev();
      else if (arg == 'next') audio.next();
      else if (arg == 'stop') audio.stop();
      else {
        arg = arg.split('#');
        audio.addToPlaylist(arg[0], arg[1]);
        title = 'Added: ' + arg[1];
      }
    }
    else {
      photos.loadPhotoUrls(cmd, true);
    }

    photos.title(title);
    self.broadcast(title);
  }

  return self;
}(receiver || {}));