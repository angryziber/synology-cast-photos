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

exec("$exiv2 -g Exif.Image.Model -g Exif.Image.Orientation -g Exif.Image.DateTime -g Exif.Photo.ExposureTime -g Exif.Photo.FNumber -g Exif.CanonCs.LensType -PEIkvt ".escapeshellarg($path), $lines);
$result = array('file' => $file,
              'camera' => exif_value($lines[0], 2),
              'orientation' => exif_value($lines[1], 1),
              'date' => exif_value(preg_replace('/:/', '-', $lines[2], 2), 1),
              'exposure' => exif_value($lines[3], 1),
              'fnumber' => exif_value($lines[4], 2),
              'lens' => str_replace('Canon EF', '', exif_value($lines[5], 2)));

echo json_encode($result);
?>
