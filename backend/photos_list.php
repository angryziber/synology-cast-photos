<?
include 'config.php';

$dir = $_GET['dir'];
chdir($photos_list_dir);
ensure_safe($dir);

header('Content-type: text/plain; charset=utf8');
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime("$photos_list_dir/$dir")).' GMT');

$dir = escapeshellarg($dir);
exec("find $dir* -type f", $files);

foreach ($files as $file) {
  $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
  if ($ext == 'cr2') $file = $file.'.jpg';
  else if ($ext != 'jpg') continue;
  echo $file."\n";
}
?>
