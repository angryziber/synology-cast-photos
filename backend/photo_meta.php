<?
include 'config.php';

$file = $_GET['file'];
if (preg_match("/\\.(CR2|cr2)\\.jpg$/", $file)) {
    $file = preg_replace("/\\.jpg$/", "", $file);
}

$path = ensure_safe("$photos_list_dir/$file");

function exif_value($line, $n) {
  return preg_split("/\\s+/", $line, 3)[$n];
}

header("Content-type: application/json");
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');

exec("$exiv2 -g Exif.Image.Orientation -g Exif.Image.DateTime -g Exif.Photo.ExposureTime -g Exif.Photo.FNumber -g Exif.CanonCs.LensType -PEIkvt ".escapeshellarg($path), $lines);
$result = array('file' => $file,
              'orientation' => exif_value($lines[0], 1),
              'date' => exif_value(str_replace(':', '-', $lines[1]), 1),
              'exposure' => exif_value($lines[2], 1),
              'fnumber' => exif_value($lines[3], 2),
              'lens' => exif_value($lines[4], 2));

echo json_encode($result);
?>
