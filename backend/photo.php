<?
include 'config.php';

$file=$_GET['file'];
$path = ensure_safe("$photos_dir/$file");

header("Content-type: image/jpeg");
header("Content-disposition: inline;filename=" . basename($file));
header('Content-Length: ' . filesize($path));
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');
ob_clean();
flush();
readfile($path);
