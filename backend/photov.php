<?
# This will convert photo to 4k 1-frame video, because it's currently the only way to render photos at
# 4k resolution on Chromecast/Android TV
include 'config.php';

$file = $_GET['file'];
$path = ensure_safe("$photos_dir/$file");
$style = $_GET['style'];
$preload = $_GET['preload'];
$outfile = sys_get_temp_dir().'/img2mp4$'.str_replace('/', '$', $file).'.mp4';
$exists = file_exists($outfile);

$w = $_GET['w'];
if (!$w) $w = 3180;
$h = $_GET['h'];
if (!$h) $h = 2160;


# TODO VideoStation with HW acceleration can use something like that:
# /var/packages/VideoStation/target/bin/ffmpeg -vaapi_device /dev/dri/renderD128 -hwaccel vaapi -hwaccel_output_format vaapi -noautorotate -i input-file -vcodec h264_vaapi -vf format=nv12|vaapi,hwupload,scale_vaapi=w=$w:h=$h -vsync 2 -bf 0 -b:v 3192698 - -f mp4 -skip_displaymatrix 1 -map 0:0 -map 0:1 -y ???

if (!$exists) {
  $exif_orientation = exec("exiv2 -q -g Exif.Image.Orientation -Pv '$path'");
  $transpose = "";
  if ($exif_orientation == 6) $transpose = "transpose=1,";
  else if ($exif_orientation == 8) $transpose = "transpose=2,";
  else if ($exif_orientation == 3) $transpose = "transpose=1,transpose=1,";

  if ($style == 'fill')
    $scale = "-filter_complex '[0]${transpose}scale=$w:$h,setsar=1,boxblur=20:20[b];[0]${transpose}scale=-1:${h}[v];[b][v]overlay=(W-w)/2'";
  else
    $scale = "-vf ${transpose}scale=w=$w:h=$h:force_original_aspect_ratio=decrease";

  $codec = "-vcodec libx264 -profile:v high -crf 22 -tune stillimage -preset ultrafast -pix_fmt yuv420p";

  exec("ffmpeg -hide_banner -noautorotate -i '$path' $codec $scale -r 1 '$outfile'");
}

header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');
header('Accept-Ranges: none');

if ($preload) {;
  echo filesize($outfile);
}
else {
  header("Content-type: video/mp4");
  header("Content-disposition: inline; filename=" . basename($outfile));
  header('Content-Length: ' . filesize($outfile));

  ob_clean();
  flush();
  readfile($outfile);
  unlink($outfile);
}
