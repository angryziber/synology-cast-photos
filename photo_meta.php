<?
$prefix = '/volume1/Photos/';
$exiv2 = '/usr/syno/bin/exiv2';

$file = $_GET['file'];
$path = $prefix.$file;

if (preg_match("/\.(CR2|cr2)\.jpg$/", $path)) {
  $path = preg_replace("/\.jpg$/", "", $path);
}

function exif_value($line) {
  return preg_split("/\s+/", $line)[5];
}

if (file_exists($path)) {
  exec("$exiv2 -g Exif.Image.Orientation -g Exif.Image.DateTime -g Exif.Photo.ExposureTime -g Exif.Photo.FNumber -pv ".escapeshellarg($path), $lines);
  $result = array('file' => $file,
                  'orientation' => exif_value($lines[0]),
                  'date' => exif_value(str_replace(':', '-', $lines[1])),
                  'exposure' => exif_value($lines[2]),
                  'fnumber' => exif_value($lines[3]));

  header("Content-type: application/json");
  header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');
  echo json_encode($result);
}
else {
  echo "{}";
}
?>
