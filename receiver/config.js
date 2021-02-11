export default {
  lanBaseUrl: '', // e.g. 'http://192.168.0.2' - for faster streaming when in LAN (.local names not supported)
  googleMapsApiKey: '', // to view map where geotagged photos were shot (M key)
  lanCheckUrl: '/backend/config.php',
  listUrl: '/backend/photos_list.php?dir=',
  videoListUrl: '/backend/videos_list.php?dir=',
  photoUrlPrefix: '/backend/photo.php?file=',
  photoVideoUrlPrefix: '/backend/photov.php?file=',
  videoUrlPrefix: '/video/',
  metaUrlPrefix: '/backend/photo_meta.php?file=',
  markPhotoUrl: '/backend/photo_mark.php',
  mode: 'video', // 'video' supports 4k/UHD resolution on Google Cast, while 'img' doesn't do server-side processing
  interval: 10, // photo showing interval, in sec
}
