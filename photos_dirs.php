<?
$prefix = '/volume1/Photos/';

$dir = $_GET['dir'] ? $_GET['dir'] : '2013/Annabel';
header('Content-type: text/plain; charset=utf8');
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($prefix)).' GMT');

$dir = escapeshellarg($dir);
chdir($prefix);
passthru("find $dir* -type d -maxdepth 1");
?>
