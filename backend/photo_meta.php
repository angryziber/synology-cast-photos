<?
include 'config.php';

$file = $_GET['file'];
$path = "$photos_list_dir/$file";

if (preg_match("/\\.(CR2|cr2)\\.jpg$/", $path) && !file_exists($path)) {
    $path = preg_replace("/\\.jpg$/", "", $path);
}

$path = ensure_safe($path);

function exif_value($key, $lines, $n) {
    $lines = preg_grep("/^$key /", $lines);
    return count($lines) > 0 ? preg_split("/\\s{2,}/", current($lines), 3)[$n] : null;
}

function exif_coord($key, $lines) {
    $ref = exif_value($key.'Ref', $lines, 1);
    $parts = preg_split("/ /", exif_value($key, $lines, 2));
    return ($ref == 'S' || $ref == 'W' ? -1 : 1) * $parts[0] + $parts[1] / 60;
}

header("Content-type: application/json");
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');

exec("$exiv2 -g Exif.Image.Model -g Exif.Image.Orientation -g Exif.Image.DateTime -g Exif.Photo.ExposureTime -g Exif.Photo.FNumber -g Exif.Photo.ISOSpeedRatings -g Exif.Photo.FocalLength -g Exif.CanonCs.LensType -g Exif.GPSInfo.GPSLatitude -g Exif.GPSInfo.GPSLongitude -g Exif.GPSInfo.GPSAltitude -PEIkvt ".escapeshellarg($path), $lines, $return);
$datetime = exif_value('Exif.Image.DateTime', $lines, 1);
$datetime = preg_replace('/:/', '-', $datetime, 2);
$datetime = preg_replace('/:[0-9]{2}$/', '', $datetime);

$exposure = exif_value('Exif.Photo.ExposureTime', $lines, 1);
if (substr($exposure, 0, 2) != '1/') {
    $parts = preg_split('/\//', $exposure, 2);
    $exposure = $parts[0] / $parts[1];
}

$result = array('file' => $file,
              'camera' => str_replace('DIGITAL REBEL', '300D', str_replace('DIGITAL REBEL XT', '350D', exif_value('Exif.Image.Model', $lines, 2))),
              'orientation' => exif_value('Exif.Image.Orientation', $lines, 1),
              'datetime' => $datetime,
              'exposure' => $exposure,
              'fnumber' => exif_value('Exif.Photo.FNumber', $lines, 2),
              'iso' => exif_value('Exif.Photo.ISOSpeedRatings', $lines, 1),
              'focal' => exif_value('Exif.Photo.FocalLength', $lines, 2),
              'lens' => str_replace('(65535)', '', exif_value('Exif.CanonCs.LensType', $lines, 2)),
              'latitude' => exif_coord('Exif.GPSInfo.GPSLatitude', $lines),
              'longitude' => exif_coord('Exif.GPSInfo.GPSLongitude', $lines),
              'altitude' => exif_value('Exif.GPSInfo.GPSAltitude', $lines, 2) * 1);

echo json_encode($result);
