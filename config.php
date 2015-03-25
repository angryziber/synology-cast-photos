<?
# This is where photos are served from (in my case, it is a fake directory mounted with rawfs, containing jpeg files)
$photos_dir = '/volume1/photo';

# This is where photo listings are taken from (in my case, it is the real location of raw CR2 files)
# Can be the same as $photos_dir if you don't use rawfs
$photos_list_dir = '/volume1/Photos';

# Location of exiv2 tool for getting of photo metadata
$exiv2 = '/usr/syno/bin/exiv2';


# Helper functions

function ensure_safe($path) {
    global $photos_dir, $photos_list_dir;
    $canonical = realpath($path);
    if (strpos($canonical, $photos_dir) !== 0 &&
        strpos($canonical, $photos_list_dir) !== 0)
        forbidden();
    return $canonical;
}

function forbidden() {
    header("HTTP/1.0 403 Forbidden");
    echo "Forbidden";
    exit;
}
?>