<?
include 'config.php';

$file=$_GET['file'];
$path = ensure_safe("$photos_dir/$file");

header("Content-type: video/mp4");
$outfile = tempnam(sys_get_temp_dir(), 'img2mp4').".mp4";
header("Content-disposition: inline; filename=" . basename($outfile));
header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($path)).' GMT');

$w = 3840;
$h = 2160;
$scale = "-vf scale=w=$w:h=$h:force_original_aspect_ratio=decrease,pad=$w:$h:'(ow-iw)/2':'(oh-ih)/2'";
# TODO: https://stackoverflow.com/questions/30789367/ffmpeg-how-to-convert-vertical-video-with-black-sides-to-video-169-with-blur

exec("/bin/ffmpeg -hide_banner -i '$path' -pix_fmt yuv420p -profile high -tune stillimage -preset superfast $scale -r 1 '$outfile'");
header('Content-Length: ' . filesize($outfile));
header('Accept-Ranges: none');

ob_clean();
flush();
readfile($outfile);
unlink($outfile);
?>