This [OpenSeadragon](http://openseadragon.github.io/) plugin provides 
a scale bar which adjusts depending on the zoom level.

A demo is available [here](https://pages.nist.gov/OpenSeadragonScalebar/).

For OpenSeadragon 1.x, use the 1.x releases of this plugin.

For OpenSeadragon 2.x, use the master branch of this plugin.

Note: If you are displaying multiple images in OpenSeadragon 2.x, this plugin
assumes that the provided pixelsPerMeter is the one of the image at index 0
in world.getItemAt. You can change that index via the referenceItemIdx option.

It can be used like this:
`````javascript
var viewer = new OpenSeadragon.Viewer(...);
viewer.scalebar({
  minWidth: ...,
  pixelsPerMeter: ...,
  color: ...,
  ...
});
`````

To change any property, just call viewer.scalebar with the updated property.
For example, to change the pixelsPerMeter:

`````javascript
viewer.scalebar({
  pixelsPerMeter: ...
});
`````

To change the unit system from the default of Metric to Imperial,
you must reference the `sizeAndTextRenderer` function in the library directly:

`````javascript
viewer.scalebar({
  ...
  sizeAndTextRenderer: OpenSeadragon.ScalebarSizeAndTextRenderer.IMPERIAL_LENGTH,
  ...
});
`````

The list of all the options can be found and tested on the [demo site](https://pages.nist.gov/OpenSeadragonScalebar/).

If type, pixelsPerMeter or location are not set (or set to 0), the bar is hidden.


The `getAsCanvas` method let one retrieve the scalebar as a canvas element like this:
```javascript
var canvas = viewer.scalebarInstance.getAsCanvas();
```

To retrieve the current display of the OpenSeadragon viewer with the scalebar,
one can use the `getImageWithScalebarAsCanvas` method:
```javascript
var canvas = viewer.scalebarInstance.getImageWithScalebarAsCanvas();
```

Since it is [difficult to define the anchor point](https://github.com/usnistgov/OpenSeadragonScalebar/issues/2) upon rotation. It is recommended to disable `stayInsideImage` if rotation is supported:
`````javascript
viewer.scalebar({
  ...
  stayInsideImage: false,
  ...
});
`````

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
