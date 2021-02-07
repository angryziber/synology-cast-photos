var config = {
  lanBaseUrl: 'http://192.168.0.2', // for faster downloads when in LAN (.local names not supported)
  lanCheckUrl: '/backend/config.php',
  interval: 10, // sec
  listUrl: '/backend/photos_list.php',
  photoUrlPrefix: '/backend/photo.php?file=',
  photoVideoUrlPrefix: '/backend/photov.php?file=',
  metaUrlPrefix: '/backend/photo_meta.php?file=',
  markPhotoUrl: '/backend/photo_mark.php',
  googleMapsApiKey: '',
  mode: 'video', // 'video' supports 4k/UHD resolution on Google Cast, while 'img' doesn't do server-side processing
  videoListUrl: '/backend/videos_list.php',
  videoUrlPrefix: '/video/'
}
