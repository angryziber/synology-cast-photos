var audio = (function(self) {
  var player = $('audio')[0];
  var $title = $('#title');
  var playlist = [];
  var playlistIndex = 0;

  self.addToPlaylist = function(url, name) {
    playlist.push({url:url, name:name});
    if (!player.src || player.paused) self.play();
    else $title.text('Added (' + playlist.length + '): ' + name);
  };

  self.play = function() {
    player.src = playlist[playlistIndex].url;
    player.play();
    $title.text('Playing (' + (playlistIndex+1) + '/' + playlist.length + '): ' + playlist[playlistIndex].name);
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
