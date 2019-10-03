var common = {
  lanBaseUrl: 'http://192.168.0.2', // for faster downloads when in LAN (.local names not supported)
  lanCheckUrl: '/backend/config.php'
};

var photos = {...common,
  interval: 10000, // ms
  listUrl: '/backend/photos_list.php',
  photoUrlPrefix: '/backend/photo.php?file=',
  photoVideoUrlPrefix: '/backend/photov.php?file=',
  metaUrlPrefix: '/backend/photo_meta.php?file=',
  markPhotoUrl: '/backend/photo_mark.php',
  mode: 'video', // 'video' supports 4k/UHD resolution on Google Cast, while 'img' doesn't do server-side processing
};

var videos = {...common,
  listUrl: '/backend/videos_list.php',
  videoUrlPrefix: '/video/',
};

var receiver = {
  namespace: 'urn:x-cast:message',
};

// helper functions

function randomInt(max) {
  if (window.crypto) {
    var array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }
  else return Math.floor(Math.random() * max);
}

function shuffle(o) {
  for (var j, x, i = o.length; i; j = randomInt(i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}
