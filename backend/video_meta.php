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
if ($datetime == null) $datetime = substr($file, strrpos($file, '/') + 1);

$coords = value('location', $lines, 1);
$lat = substr($coords, 0, 8);
$lon = substr($coords, 8, 9);
$comment = value('comment', $lines, 1);
$model = value('model', $lines, 1);

$duration = value('Duration', $lines, 1);
$duration = substr($duration, 0, strpos($duration, ','));
$kbps = value('bitrate', $lines, 3);
$kbps = substr($kbps, 0, strpos($kbps, ' '));

$video = value('Video', $lines, 2);
$parts = preg_split("/, +/", $video);
$format = substr($parts[0], 0, strpos($parts[0], ' '));
$reso = $parts[2];
$fps = substr($parts[5], 0, strpos($parts[5], ' '));

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
