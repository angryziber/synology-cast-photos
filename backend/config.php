<?
# This is where photos are served from (in my case, it is a fake directory mounted with rawfs, containing jpeg files)
$photos_dir = "/volume1/photo";

# This is where photo listings are taken from (in my case, it is the real location of raw CR2 files)
# Can be the same as $photos_dir if you don't use rawfs
$photos_list_dir = "/volume1/Photos";

# Listing and serving of videos
$videos_dir = "/volume1/video";

# Location of exiv2 tool for getting of photo metadata
$exiv2 = "exiv2";

# If defined, some php scripts will require specifying an access token
$access_token = trim(file("$photos_list_dir/php-access-token.txt")[0]);

# The file where red/green/blue marks are written for later processing when user pressed F1-F3
# This file must be writable by web server
$marks_file = "$photos_list_dir/marks.txt";

# If defined, requests will be allowed only from these hosts (comma-separated)
$allowed_hosts = '';

$origin = $_SERVER['HTTP_ORIGIN'];
if ($origin) {
	$origin_host = preg_replace('/^https?:\/\//', '', $origin);
	if ($allowed_hosts && strpos($allowed_hosts, $origin_host) === false) forbidden();
	header('Access-Control-Allow-Origin: '.$origin);
}

$host = $_SERVER['HTTP_HOST'];
if ($allowed_hosts && strpos($allowed_hosts, $host) === false) forbidden();

# Helper functions

function ensure_safe($path) {
    global $photos_dir, $photos_list_dir, $videos_dir;
    $canonical = realpath($path);
    if (strpos($canonical, $photos_dir) !== 0 &&
        strpos($canonical, $photos_list_dir) !== 0 &&
        strpos($canonical, $videos_dir) !== 0)
        forbidden();
    return $canonical;
}

function check_access() {
    global $access_token;
    if ($access_token && $access_token != $_GET['accessToken'])
        forbidden();
}

function forbidden() {
    header("HTTP/1.0 403 Forbidden");
    echo "Forbidden";
    exit;
}

