<?
include 'config.php';

$file=$_GET['file'];
$path = realpath("$photos_dir/$file");
if (strpos($path, $photos_dir) !== 0) forbidden();

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
