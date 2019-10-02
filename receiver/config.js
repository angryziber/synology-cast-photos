var lanBaseUrl = 'http://nas.local'; // for faster downloads when in LAN

var photos = {
  interval: 10000,  // ms
  photoListUrl: '/backend/photos_list.php',
  photoUrlPrefix: '/backend/photo.php?file=',
  photoVideoUrlPrefix: '/backend/photov.php?file=',
  metaUrlPrefix: '/backend/photo_meta.php?file=',
  markPhotoUrl: '/backend/photo_mark.php',
  mode: 'video', // 'video' supports 4k/UHD resolution on Google Cast, while 'img' doesn't do server-side processing
  lanBaseUrl: lanBaseUrl
};

if (location.search.indexOf('?mode') == 0)
  photos.mode = location.search.split('=')[1];

var videos = {
  videoListUrl: '/backend/videos_list.php',
  videoUrlPrefix: '/video/',
  lanBaseUrl: lanBaseUrl
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
