<?
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') forbidden();

$file = $_POST['file'];
$how = $_POST['how'];

header("Content-type: text/plain");

$what = "$file $how";
$what_escaped = str_replace(" ", "\\ ", $what);
exec("fgrep $what_escaped $marks_file", $matches);

$removals = count(preg_grep('/^-/', $matches));
$marked = count($matches) - $removals > $removals;

if ($marked) {
    $what = '-'.$what;
}

if (file_put_contents($marks_file, $what."\n", FILE_APPEND)) {
    echo $marked ? "Unmarked $how" : "Marked $how";
}
else {
    echo "Failed to mark $what";
}
?>
