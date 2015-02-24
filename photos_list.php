<?
$prefix = '/volume1/Photos/';

$dir = $_GET['dir'];
header('Content-type: text/plain; charset=utf8');
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($prefix.$dir)).' GMT');

chdir($prefix);
if (strpos(realpath($dir), $prefix) !== 0) return;
$dir = escapeshellarg($dir);

exec("find $dir* -type f", $files);
foreach ($files as $file) {
  $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
  if ($ext == 'cr2') $file = $file.'.jpg';
  else if ($ext != 'jpg') continue;
  echo $file."\n";
}
?>
