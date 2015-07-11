<?
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') forbidden();

$file = $_POST['file'];
$how = $_POST['how'];

header("Content-type: text/plain");

$what = "$file $how";
if (file_put_contents($marks_file, $what."\n", FILE_APPEND)) {
    echo "Marked $what";
}
else {
    echo "Failed to mark $what";
}
?>
