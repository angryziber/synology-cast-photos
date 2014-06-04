<?
$file=$_GET['file'];
$prefix = '/volume1/Photos/';
$path = $prefix.$file;

if (preg_match("/\.(CR2|cr2)\.jpg$/", $path)) {
  $path = preg_replace("/\.jpg$/", "", $path);
}

if (file_exists($path)) {
  $exec = exec("/usr/syno/bin/exiv2 -g Exif.Image.Orientation -pv \"".$path."\"");
  $exif = preg_split("/\s+/", $exec);
  $result = array('file' => $file, 'orientation' => $exif[5]);

  header("Content-type: application/json");
  header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');
  echo json_encode($result);
}
else {
  echo "{}";
}
?>
