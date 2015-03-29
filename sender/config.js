var chromecast = {
  // appId of receiver, must be registered with Google, see README.md
  appId: location.host.indexOf('192.168.') >= 0 || location.host.indexOf('.local') >= 0 ? '40FA4E04' : '87673D37'
};

var vk = {
  // VK client id in order to get access to audio search there
  clientId: 4774342
};

var sender = {
  photoDirsSuggestUrl: '/backend/photos_dirs.php'
};
