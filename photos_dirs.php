<?
$prefix = '/volume1/Photos/';

$dir = $_GET['dir'];
header('Content-type: text/plain; charset=utf8');
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($prefix)).' GMT');

chdir($prefix);
if (strpos(realpath($dir), $prefix) !== 0) return;
$dir = escapeshellarg($dir);

passthru("find $dir* -type d -maxdepth 1");
?>
