Cast your raw photos from NAS directly to TV
============================================

Small set of scripts to cast photos stored on a Synology NAS directly to Google Chromecast.

To use this stuff, you will need some hardware:
- *Synology NAS* device (or any other server containing photos and running php)
- *Google Chromecast* dongle for your TV

To install:

- Enable *Web Station* on your Synology NAS
- Copy/clone these files to the *'web'* directory on your NAS
- [Register a Chromecast app](https://cast.google.com/publish/) with Google pointing to **http://your-nas-ip/random.html**
  (Note: you need to pay Google $5 and also register your Chromecast device for development in order to be able to use http urls)
- Specify registered app ID in *cast.html*
- Open **http://your-nas-ip/cast.html** in your browser, start casting!

Note: these php scripts here take advantage of [rawfs](http://github.com/angryziber/rawfs) running on the NAS so you can cast
raw photos directly.

Photos are streamed as they are (without any resizing, etc on the NAS) because CPU of Chromecast is faster than Synology's.

On my DS212j resizing a photo from Canon 5D mk2 takes about a minute with imagemagick, while Chromecast downloads 2.5Mb
over local Wifi and fits the same image to the screen in just a couple of seconds.
