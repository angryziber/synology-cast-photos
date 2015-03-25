<?
include 'config.php';

$accessToken = trim(file($photos_list_dir.'php-access-token.txt')[0]);
if ($_GET['accessToken'] != $accessToken) {
    header("HTTP/1.0 403 Forbidden");
    echo "Forbidden";
    return;
}

$dir = $_GET['dir'];
header('Content-type: text/plain; charset=utf8');
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($photos_list_dir)).' GMT');

chdir($photos_list_dir);
if (strpos(realpath(dirname($dir) ? dirname($dir) : '.'), $photos_list_dir) !== 0) return;
$dir = escapeshellarg($dir);

passthru("find $dir* -type d -maxdepth 1");
?>
