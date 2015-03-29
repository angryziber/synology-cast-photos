Cast photos from NAS directly to TV
===================================

Small set of scripts to cast photos stored on a Synology NAS directly to Google Chromecast.

## Required hardware

- *Synology NAS* device (or any other server containing photos and running php)
- *Google Chromecast* dongle for your TV or *Android TV device*

## Components

* sender/ - *Chromecast sender*, use it to start and control the show from Google Chrome with Google Cast extension installed
* receiver/ - *Chromecast receiver* - this file will run on Chromecast dongle, or use it stand-alone to view photos
* backend/ - php scripts for serving the actual photos from NAS, or any other php-enabled server
* config.php/js - each directory has a config file, where you can define paths of photos on your server and other parameters

## Installing

- Enable *Web Station* on your Synology NAS
- In PHP settings (in a tab), add your photos directory to PHP open_basedir - otherwise photos won't be accessible to PHP
- Copy/clone these files to the *'web'* directory on your NAS
- [Register a Chromecast receiver app](https://cast.google.com/publish/) with Google pointing to **http://your-nas-ip/receiver**
  (Note: you need to pay Google $5 and also register your Chromecast device for testing in order to be able to use http urls)
- Specify registered app ID in *sender/config.js*
- Open **http://your-nas-ip/sender** in your browser, start casting!

Note: these php scripts here take advantage of [rawfs](http://github.com/angryziber/rawfs) running on the NAS making it 
possible to cast raw photos directly, without converting them to jpeg first. This is optional if your photos are already 
in jpeg format.

There is also an [Android sender app](https://github.com/angryziber/synology-cast-photos-android) for controlling the casted photos instead of *html sender*.

Photos are streamed as they are (without any resizing, etc on the NAS) because CPU of Chromecast is faster than Synology's.

On my DS212j resizing a photo from Canon 5D mk2 takes about a minute with imagemagick, while Chromecast downloads 2.5Mb
over local Wifi and fits the same image to the screen in just a couple of seconds.
