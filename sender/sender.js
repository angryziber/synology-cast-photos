var sender = (function(self) {
  var input = $('[name=prefix]');
  var random = $('[name=random]');
  var interval = $('[name=interval]');
  var status = $('#status');

  var accessToken = self.accessToken || localStorage['accessToken'];
  if (!accessToken) {
    accessToken = prompt('Access Token');
    if (accessToken) localStorage['accessToken'] = accessToken;
  }

  input.typeahead({hint: true, highlight: true, minLength: 3}, {
    name: 'photo-dirs',
    displayKey: 'dir',
    source: function (dir, cb) {
      $.get(self.photoDirsSuggestUrl, {dir:dir, accessToken:accessToken}, function(data) {
        var values = data.trim().split('\n');
        cb($.map(values, function (value) {
          return {dir: value};
        }));
      });
    }
  });

  chromecast.onMessage = function(ns, text) {
    status.text(text).show().fadeOut(2000);
  };

  function sendCommand(cmd) {
    chromecast.message(cmd);
    status.text(cmd).show().fadeOut(1000);
  }

  self.sendPhotoDir = function() {
    sendCommand((random.is(':checked') ? 'rnd:' : 'seq:') + input.val());
  };

  self.sendAudio = function(url, name) {
    sendCommand('audio:' + url + (name ? '#' + name : ''));
  };

  input.on('typeahead:selected', self.sendPhotoDir);
  input.closest('form').on('submit', function() {
    self.sendPhotoDir();
    return false;
  });

  random.on('click', function() {
    if (input.val()) self.sendPhotoDir();
  });

  interval.on('change', function() {
    sendCommand('interval:' + interval.val());
  });

  $('#prev').on('click', function() {
    sendCommand('prev');
  });

  $('#next').on('click', function() {
    sendCommand('next');
  });

  $('#prev-more').on('click', function() {
    sendCommand('prev:10');
  });

  $('#next-more').on('click', function() {
    sendCommand('next:10');
  });

  $(window).on('keydown', function(e) {
    switch (e.which) {
      case 37:
      case 38:
        sendCommand('prev');
        break;
      case 33:
        sendCommand('prev:10');
        break;
      case 39:
      case 40:
        sendCommand('next');
        break;
      case 34:
        sendCommand('next:10');
        break;
    }
  });

  return self;
})(sender || {});
