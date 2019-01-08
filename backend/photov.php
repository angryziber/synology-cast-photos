<?
include 'config.php';

$file=$_GET['file'];
$path = ensure_safe("$photos_dir/$file");

header("Content-type: video/mp4");
header("Content-disposition: inline;filename=" . basename($file) . ".mp4");
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');
ob_clean();
flush();
passthru("ffmpeg $path -format mp4 -", $status);
?>