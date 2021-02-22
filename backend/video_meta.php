<?
include 'config.php';

$file = $_GET['file'];
$path = "$videos_dir/$file";

$path = ensure_safe($path);

function value($key, $lines, $n) {
    $lines = preg_grep("/$key/", $lines);
    return count($lines) > 0 ? preg_split("/:\\s+/", current($lines))[$n] : null;
}

header("Content-type: application/json");
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');

exec("ffmpeg -hide_banner -i ".escapeshellarg($path). " 2>&1", $lines, $return);
$datetime = value('creation_time', $lines, 1);
$coords = value('location', $lines, 1);
$lat = substr($coords, 0, 8);
$lon = substr($coords, 8);
$comment = value('comment', $lines, 1);
$model = value('model', $lines, 1);
$duration = preg_split("/,? +/", value('Duration', $lines, 1))[0];

$video = value('Video', $lines, 2);
$parts = preg_split("/,? +/", $video);
$format = $parts[0];
$reso = $parts[7];
$kbps = $parts[12];
$fps = $parts[14];

$result = array('file' => $file,
              'camera' => $model,
              'datetime' => $datetime,
              'comment' => $comment,
              'latitude' => $lat,
              'longitude' => $lon,
              'kbps' => $kbps,
              'format' => $format,
              'resolution' => $reso,
              'duration' => $duration,
              'fps' => $fps);

echo json_encode($result);
