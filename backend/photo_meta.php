<?
include 'config.php';

$file = $_GET['file'];
if (preg_match("/\\.(CR2|cr2)\\.jpg$/", $file)) {
    $file = preg_replace("/\\.jpg$/", "", $file);
}

$path = ensure_safe("$photos_list_dir/$file");

function exif_value($line, $n) {
  return preg_split("/\\s{2,}/", $line, 3)[$n];
}

header("Content-type: application/json");
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');

exec("$exiv2 -g Exif.Image.Model -g Exif.Image.Orientation -g Exif.Image.DateTime -g Exif.Photo.ExposureTime -g Exif.Photo.FNumber -g Exif.Photo.ISOSpeedRatings -g Exif.Photo.FocalLength -g Exif.CanonCs.LensType -PEIkvt ".escapeshellarg($path), $lines, $return);
$datetime = exif_value(preg_replace('/:/', '-', $lines[2], 2), 1);
$datetime = preg_replace('/:[0-9]{2}$/', '', $datetime);
$result = array('file' => $file,
              'camera' => str_replace('DIGITAL REBEL', '300D', str_replace('DIGITAL REBEL XT', '350D', exif_value($lines[0], 2))),
              'orientation' => exif_value($lines[1], 1),
              'datetime' => $datetime,
              'exposure' => exif_value($lines[3], 1),
              'fnumber' => exif_value($lines[4], 2),
              'iso' => exif_value($lines[5], 1),
              'focal' => exif_value($lines[6], 2),
              'lens' => str_replace('(65535)', '', exif_value($lines[7], 2)));

echo json_encode($result);
?>
