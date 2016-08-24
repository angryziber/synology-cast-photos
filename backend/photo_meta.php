<?
include 'config.php';

$file = $_GET['file'];
if (preg_match("/\\.(CR2|cr2)\\.jpg$/", $file)) {
    $file = preg_replace("/\\.jpg$/", "", $file);
}

$path = ensure_safe("$photos_list_dir/$file");

function exif_value($key, $lines, $n) {
  $lines = preg_grep("/^$key/", $lines);
  return count($lines) > 0 ? preg_split("/\\s{2,}/", current($lines), 3)[$n] : null;
}

header("Content-type: application/json");
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');

exec("$exiv2 -g Exif.Image.Model -g Exif.Image.Orientation -g Exif.Image.DateTime -g Exif.Photo.ExposureTime -g Exif.Photo.FNumber -g Exif.Photo.ISOSpeedRatings -g Exif.Photo.FocalLength -g Exif.CanonCs.LensType -PEIkvt ".escapeshellarg($path), $lines, $return);
$datetime = exif_value('Exif.Image.DateTime', $lines, 1);
$datetime = preg_replace('/:/', '-', $datetime, 2);
$datetime = preg_replace('/:[0-9]{2}$/', '', $datetime);

$exposure = exif_value('Exif.Photo.ExposureTime', $lines, 1);
if (substr($exposure, 0, 2) != '1/') $exposure = exif_value('Exif.Photo.ExposureTime', $lines, 2);

$result = array('file' => $file,
              'camera' => str_replace('DIGITAL REBEL', '300D', str_replace('DIGITAL REBEL XT', '350D', exif_value('Exif.Image.Model', $lines, 2))),
              'orientation' => exif_value('Exif.Image.Orientation', $lines, 1),
              'datetime' => $datetime,
              'exposure' => $exposure,
              'fnumber' => exif_value('Exif.Photo.FNumber', $lines, 2),
              'iso' => exif_value('Exif.Photo.ISOSpeedRatings', $lines, 1),
              'focal' => exif_value('Exif.Photo.FocalLength', $lines, 2),
              'lens' => str_replace('(65535)', '', exif_value('Exif.CanonCs.LensType', $lines, 2)));

echo json_encode($result);
?>
