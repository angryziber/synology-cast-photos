<?
include 'config.php';

$file=$_GET['file'];
$path = ensure_safe("$photos_dir/$file");

header("Content-type: video/mp4");
$outfile = tempnam(sys_get_temp_dir(), 'img2mp4').".mp4";
header("Content-disposition: inline; filename=" . basename($outfile));
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');

exec("/bin/ffmpeg -hide_banner -i '$path' -pix_fmt yuvj420p -tune stillimage -preset superfast -vf scale=w=3840:h=2160:force_original_aspect_ratio=decrease,pad=3840:2160:'(ow-iw)/2' -r 1 '$outfile'");
header('Content-Length: ' . filesize($outfile));
header('Accept-Ranges: none');

ob_clean();
flush();
readfile($outfile);
unlink($outfile);
?>