<?
include 'config.php';
if (!$origin && !strpos($_SERVER['HTTP_REFERER'], "://$host/receiver/")) forbidden();

$dir = $_GET['dir'];
if (!$dir) forbidden();

chdir($videos_dir);

$dirs = explode('+', $dir);

foreach ($dirs as $dir) {
  ensure_safe($dir);
  $dir = escapeshellarg($dir);
  exec("find $dir* -type f", $files);
}

header('Content-type: text/plain; charset=utf8');
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime("$videos_dir/$dir")).' GMT');

foreach ($files as $file) {
  $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
  if ($ext == 'mp4' || $ext == 'avi' || $ext == 'mov' || $ext == 'ogv')
    echo $file."\n";
}
