var audio = (function(self) {
  var player = $('audio')[0];
  var playlist = [];
  var playlistIndex = 0;

  self.addToPlaylist = function(url, name) {
    playlist.push({url:url, name:name});
    if (!player.src) self.play();
  };

  self.play = function() {
    player.src = playlist[playlistIndex].url;
    player.play();
    $title.text('Playing: ' + playlist[playlistIndex].name);
  };

  self.stop = function() {
    player.pause();
  };

  self.prev = function() {
    if (--playlistIndex < 0) playlistIndex = playlist.length-1;
    self.play();
  };

  self.next = function() {
    if (++playlistIndex >= playlist.length) playlistIndex = 0;
    self.play();
  };

  $(player).on('ended', self.next);
  return self;
})(audio || {});
