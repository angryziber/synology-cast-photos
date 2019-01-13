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

$exif_orientation = exec("exiv2 -g Exif.Image.Orientation -Pv $path");
$transpose = "";
if ($exif_orientation == 6) $transpose = "transpose=1,";
else if ($exif_orientation == 8) $transpose = "transpose=2,";
else if ($exif_orientation == 3) $transpose = "transpose=1,transpose=1,";

#$scale = "-vf scale=${transpose},w=$w:h=$h:force_original_aspect_ratio=decrease,pad=$w:$h:'(ow-iw)/2':'(oh-ih)/2'";
$scale = "-filter_complex '[0]${transpose}scale=$w:$h,setsar=1,boxblur=20:20[b];[0]${transpose}scale=-1:${h}[v];[b][v]overlay=(W-w)/2'";
$codec = "-vcodec libx264 -profile:v high -tune stillimage -preset superfast";

exec("/bin/ffmpeg -hide_banner -noautorotate -i '$path' $codec -pix_fmt yuv420p $scale -r 1 '$outfile'");
header('Content-Length: ' . filesize($outfile));
header('Accept-Ranges: none');

ob_clean();
flush();
readfile($outfile);
unlink($outfile);
?>