<?
include 'config.php';

$file = $_POST['file'];
$how = $_POST['how'];
$path = ensure_safe("$photos_list_dir/$file");
$mark_file = ensure_safe("$path.$how");

fwrite($mark_file, '$file $how');

header("Content-type: text/plain");
?>
Marked: <?=$how?>
