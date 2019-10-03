<?
include 'config.php';
check_access();

$dir = $_GET['dir'];
chdir($videos_dir);
ensure_safe(dirname($dir));

header('Content-type: text/plain; charset=utf8');
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($photos_list_dir)).' GMT');

$dir = escapeshellarg($dir);
passthru("find $dir* -type d -maxdepth 1 -not -path '**/@eaDir*'", $status);
if ($status != 0) passthru("find -iname '*$dir*' -type d -maxdepth 3 -not -path '**/@eaDir*' | sed 's@./@@'");
