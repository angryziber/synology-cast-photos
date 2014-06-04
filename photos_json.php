<?
    $urlprefix = '/photo.php?file=';
    $prefix = '/volume1/Photos/';
    
    $urls = array();

    function recurse($dir) {
        global $urlprefix, $prefix, $urls;
        $files = scandir($prefix.$dir);
        if (!$files) return;
        foreach (scandir($prefix.$dir) as $file) {
            if ($file == '.' || $file == '..') continue;            
            $path = $dir.'/'.$file;
            if (is_dir($prefix.$path)) recurse($path);
            else {
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if ($ext == 'cr2') $path = $path.'.jpg';
                else if ($ext != 'jpg') continue;
                $urls[] = $path;
            }
        }
    }

    $dir = $_GET['dir'] ? $_GET['dir'] : '2013/Annabel';
    header('Content-type: application/json');
    header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($prefix.$dir)).' GMT');
    recurse($dir);
    echo json_encode(array('prefix' => $urlprefix, 'urls' => $urls));
?>

