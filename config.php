<?
# This is where photos are served from (in my case, it is a fake directory mounted with rawfs, containing jpeg files)
$photos_dir = '/volume1/photo/';

# This is where photo listings are taken from (in my case, it is the real location of raw CR2 files)
$photos_list_dir = '/volume1/Photos';

function forbidden() {
    header("HTTP/1.0 403 Forbidden");
    echo "Forbidden";
    exit;
}
?>