<?
$prefix = '/volume1/photo/';

$file=$_GET['file'];
$path = realpath($prefix.$file);
if (strpos($path, $prefix) !== 0) return;

if (file_exists($path)) {
  header("Content-type: image/jpeg");
  header("Content-disposition: inline;filename=" . basename($file));
  header('Content-Length: ' . filesize($path));
  header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');
  ob_clean();
  flush();
  readfile($path);
  exit;
}
else {
  ?>Not found <?=$path?><?
}
?>
