synology-cast-photos
====================

Small set of scripts to cast photos stored on a Synology NAS directly to Google Chromecast.

To install:

- Enable Web station on your Synology NAS
- Copy/clone these files to the 'web' directory on your NAS
- Register Chromecast app with Google pointing to http://your-nas-ip/random.html
- Change app ID in cast.html
- Open http://your-nas-ip/cast.html in your browser, start casting!

Note: these php scripts take advantage of rawfs running on the NAS so you have cast raw photos directly.

Photos are streamed as they are (without any resizing, etc on the NAS) because CPU of Chromecast is faster than Synology one.
