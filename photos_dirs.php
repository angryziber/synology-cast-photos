<?
include 'config.php';

$accessToken = trim(file($photos_list_dir.'/php-access-token.txt')[0]);
if ($_GET['accessToken'] != $accessToken) forbidden();

$dir = $_GET['dir'];
chdir($photos_list_dir);
ensure_safe($dir);

header('Content-type: text/plain; charset=utf8');
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($photos_list_dir)).' GMT');

$dir = escapeshellarg($dir);
passthru("find $dir* -type d -maxdepth 1");
?>
