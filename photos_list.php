<?
    $prefix = '/volume1/Photos/';
    
    $dir = $_GET['dir'] ? $_GET['dir'] : '2013/Annabel';
    header('Content-type: text/plain; charset=utf8');
    header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($prefix.$dir)).' GMT');
    
    $dir = escapeshellarg($dir);
    chdir($prefix);
    exec("find $dir* -type f", $files);
    foreach ($files as $file) {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if ($ext == 'cr2') $file = $file.'.jpg';
        else if ($ext != 'jpg') continue;
        echo $file."\n";
    }
?>

