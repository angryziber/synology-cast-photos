<?
include 'config.php';
if (!$origin && !strpos($_SERVER['HTTP_REFERER'], "://$host/receiver/")) forbidden();

$dir = $_GET['dir'];
if (!$dir) forbidden();

chdir($photos_list_dir);

$dirs = explode('+', $dir);

foreach ($dirs as $dir) {
  ensure_safe($dir);
  $dir = escapeshellarg($dir);
  exec("find $dir* -type f", $files);
}

header('Content-type: text/plain; charset=utf8');
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime("$photos_list_dir/$dir")).' GMT');

foreach ($files as $file) {
  if (strpos($file, '@eaDir') > 0) continue;
  $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
  if ($ext == 'cr2') $file = $file.'.jpg';
  else if ($ext != 'jpg') continue;
  echo $file."\n";
}
