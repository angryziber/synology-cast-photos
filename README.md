Cast photos from NAS directly to TV
===================================

Cast photos stored on a Synology NAS directly to Google Chromecast or Android TV.

## Required hardware

- *Synology NAS* device (or any other server containing photos and running php)
- *Google Chromecast* dongle for your TV or *Android TV device*

## Components

* sender/ - *Chromecast sender*, use it to start and control the show from Google Chrome
* receiver/ - *Chromecast receiver* - this file will run on Chromecast dongle, or use it stand-alone to view photos
* backend/ - php scripts for listing and serving the actual photos from NAS, or any other php-enabled server
* config.php/js - each directory has a config file, where you can define paths of photos on your server and other parameters

## UHD/4K TVs and Chromecast Ultra

Android TVs and Chromecast Ultra still cannot display any non-video content above FullHD 1080p.
2160p resolution is only used for compatible videos, any other elements of receiver are downscaled, including images.

In order to display images at full TV resolution, they are converted to 1-frame mp4 videos using `ffmpeg`, see (photov.php)[backend/photov.php]
Use `jpeg` branch if you are fine with 1080p resolution.

## Installing

- Enable *Web Station* on your Synology NAS
- In PHP settings (in a tab), add your photos and videos directories to PHP open_basedir - otherwise they won't be accessible to PHP
- Copy/clone this repository to the *'web'* directory on your NAS
- [Register a Chromecast receiver app](https://cast.google.com/publish/) with Google pointing to **http://your-nas-ip/receiver**
  (Note: you need to pay Google $5 and also register your Chromecast device for testing in order to be able to use http urls)
- Specify registered app ID in *sender/config.js*
- Open **http://your-nas-ip/sender** in your browser, start casting!
- Or open **http://your-nas-ip/receiver** to watch photos locally (Use Esc key to specify directory to watch)

Note: these php scripts here can take advantage of [rawfs](http://github.com/angryziber/rawfs) running on the NAS making it 
possible to cast raw photos directly, without converting them to jpeg first. This is optional if your photos are already 
in jpeg format.

There is also an [Android sender app](https://github.com/angryziber/synology-cast-photos-android) for controlling the casted photos instead of *html sender*.

### Older Synologies

If you own an older Synology with simple CPU that cannot resize/convert photos, you can use the `jpeg` branch. 

E.g. on DS212j resizing a photo from Canon 5D mk2 takes about a minute with imagemagick, while Chromecast downloads 2.5Mb
over local Wifi and fits the same image to the screen in just a couple of seconds.

Note, in the Releases there is an ARMv5 binary of ffmpeg that supports H264 encoding. It's slow, but works.
