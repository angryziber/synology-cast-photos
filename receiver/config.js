var photos = {
  interval: 10000,  // ms
  photoListUrl: '/backend/photos_list.php',
  photoUrlPrefix: '/backend/photov.php?file=',
  metaUrlPrefix: '/backend/photo_meta.php?file=',
  markPhotoUrl: '/backend/photo_mark.php'
};

var videos = {
  videoListUrl: '/backend/videos_list.php',
  videoUrlPrefix: 'http://192.168.0.2/video/'
};

var receiver = {
  namespace: 'urn:x-cast:message'
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
