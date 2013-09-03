This OpenSeadragon ( http://openseadragon.github.io/ ) plugin provide 
a scale bar which adjusts depending on the zoom level.

It can be used like this:

var viewer = new OpenSeadragon.Viewer(...);
viewer.scalebar({
  width: ...,
  height: ...,
  pixelsPerMeter: ...,
  color: ...
});

To change any property, just call viewer.scalebar with the updated property.
For example, to change the pixelsPerMeter:

viewer.scalebar({
  pixelsPerMeter: ...
});

If width, height or pixelsPerMeter are not set (or set to 0), the bar is hidden.


Disclaimer:

This software was developed at the National Institute of Standards and
Technology by employees of the Federal Government in the course of
their official duties. Pursuant to title 17 Section 105 of the United
States Code this software is not subject to copyright protection and is
in the public domain. This software is an experimental system. NIST assumes
no responsibility whatsoever for its use by other parties, and makes no
guarantees, expressed or implied, about its quality, reliability, or
any other characteristic. We would appreciate acknowledgement if the
software is used.
