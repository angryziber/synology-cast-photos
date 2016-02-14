var sender = (function(self) {
  var input = $('[name=prefix]');
  var random = $('[name=random]');
  var cover = $('[name=cover]');
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
    var parts = text.split('|');
    if (parts.length == 1) status.text(text);
    else status.html('<a href="' + parts[1] + '">' + parts[0] + '</a>');
  };

  function sendCommand(cmd) {
    chromecast.message(cmd);
    status.text(cmd);
  }

  self.sendPhotoDir = function() {
    sendCommand((random.is(':checked') ? 'rnd:' : 'seq:') + input.val());
  };

  self.sendAudio = function(url, name) {
    sendCommand('audio:' + url + (name ? '#' + name : ''));
  };

  input.on('typeahead:selected', self.sendPhotoDir);
  input.on('keydown', function(e) {
    if (e.which == 13) self.sendPhotoDir();
  });

  random.on('click', function() {
    sendCommand(random.is(':checked') ? 'rnd' : 'seq');
  });

  cover.on('click', function() {
    sendCommand(cover.is(':checked') ? 'style:cover' : 'style:contain');
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

  $('#pause').on('click', function() {
    sendCommand('pause');
  });

  $('body').on('keydown', function(e) {
    if ($(e.target).is('input')) return;

    var command = keyboard.toCommand(e.which);
    if (command) {
      e.preventDefault();
      sendCommand(command);
    }
  });

  return self;
})(sender || {});
