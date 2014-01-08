/* 
 * This software was developed at the National Institute of Standards and
 * Technology by employees of the Federal Government in the course of
 * their official duties. Pursuant to title 17 Section 105 of the United
 * States Code this software is not subject to copyright protection and is
 * in the public domain. This software is an experimental system. NIST assumes
 * no responsibility whatsoever for its use by other parties, and makes no
 * guarantees, expressed or implied, about its quality, reliability, or
 * any other characteristic. We would appreciate acknowledgement if the
 * software is used.
 */

/**
 *
 * @author Antoine Vandecreme <antoine.vandecreme@nist.gov>
 */
(function($) {

    if (!$.version || $.version.major < 1) {
        throw new Error('OpenSeadragonScalebar requires OpenSeadragon version 1.0.0+');
    }

    $.Viewer.prototype.scalebar = function(options) {
        if (!this.scalebarInstance) {
            options = options || {};
            options.viewer = this;
            this.scalebarInstance = new $.Scalebar(options);
        } else {
            this.scalebarInstance.refresh(options);
        }
    };

    $.ScalebarType = {
        NONE: 0,
        MICROSCOPY: 1,
        MAP: 2
    };

    $.ScalebarLocation = {
        NONE: 0,
        TOP_LEFT: 1,
        TOP_RIGHT: 2,
        BOTTOM_RIGHT: 3,
        BOTTOM_LEFT: 4
    };

    /**
     * 
     * @class Scalebar
     * @param {Object} options
     * @param {OpenSeadragon.Viewer} options.viewer The viewer to attach this
     * Scalebar to.
     * @param {OpenSeadragon.ScalebarType} options.type The scale bar type.
     * Default: microscopy
     * @param {Integer} options.pixelsPerMeter The pixels per meter of the
     * zoomable image at the original image size. If null, the scale bar is not
     * displayed. default: null
     * @param (String} options.minWidth The minimal width of the scale bar as a
     * CSS string (ex: 100px, 1em, 1% etc...) default: 150px
     * @param {OpenSeadragon.ScalebarLocation} options.location The location
     * of the scale bar inside the viewer. default: bottom left
     * @param {Integer} options.xOffset Offset location of the scale bar along x.
     * default: 5
     * @param {Integer} options.yOffset Offset location of the scale bar along y.
     * default: 5
     * @param {Boolean} options.stayInsideImage When set to true, keep the 
     * scale bar inside the image when zooming out. default: true
     * @param {String} options.color The color of the scale bar using a color
     * name or the hexadecimal format (ex: black or #000000) default: black
     * @param {String} options.fontColor The font color. default: black
     * @param {String} options.backgroundColor The background color. default: none
     * @param {String} options.fontSize The font size. default: not set
     * @param {String} options.barThickness The thickness of the scale bar in px.
     * default: 2
     */
    $.Scalebar = function(options) {
        options = options || {};
        if (!options.viewer) {
            throw new Error("A viewer must be specified.");
        }
        this.viewer = options.viewer;

        this.divElt = document.createElement("div");
        this.viewer.container.appendChild(this.divElt);
        this.divElt.style.position = "relative";
        this.divElt.style.margin = "0";

        this.setMinWidth(options.minWidth || "150px");

        this.setDrawScalebarFunction(options.type || $.ScalebarType.MICROSCOPY);
        this.color = options.color || "black";
        this.fontColor = options.fontColor || "black";
        this.backgroundColor = options.backgroundColor || "none";
        this.fontSize = options.fontSize || "";
        this.barThickness = options.barThickness || 2;
        this.pixelsPerMeter = options.pixelsPerMeter || null;
        this.location = options.location || $.ScalebarLocation.BOTTOM_LEFT;
        this.xOffset = options.xOffset || 5;
        this.yOffset = options.yOffset || 5;
        this.stayInsideImage = isDefined(options.stayInsideImage) ?
                options.stayInsideImage : true;

        var self = this;
        this.viewer.addHandler("open", function() {
            self.refresh();
        });
        this.viewer.addHandler("animation", function() {
            self.refresh();
        });
    };

    $.Scalebar.prototype = {
        updateOptions: function(options) {
            if (!options) {
                return;
            }
            if (isDefined(options.type)) {
                this.setDrawScalebarFunction(options.type);
            }
            if (isDefined(options.minWidth)) {
                this.setMinWidth(options.minWidth);
            }
            if (isDefined(options.color)) {
                this.color = options.color;
            }
            if (isDefined(options.fontColor)) {
                this.fontColor = options.fontColor;
            }
            if (isDefined(options.backgroundColor)) {
                this.backgroundColor = options.backgroundColor;
            }
            if (isDefined(options.fontSize)) {
                this.fontSize = options.fontSize;
            }
            if (isDefined(options.barThickness)) {
                this.barThickness = options.barThickness;
            }
            if (isDefined(options.pixelsPerMeter)) {
                this.pixelsPerMeter = options.pixelsPerMeter;
            }
            if (isDefined(options.location)) {
                this.location = options.location;
            }
            if (isDefined(options.xOffset)) {
                this.xOffset = options.xOffset;
            }
            if (isDefined(options.yOffset)) {
                this.yOffset = options.yOffset;
            }
            if (isDefined(options.stayInsideImage)) {
                this.stayInsideImage = options.stayInsideImage;
            }
        },
        setDrawScalebarFunction: function(type) {
            if (!type) {
                this.drawScalebar = null;
            }
            else if (type === $.ScalebarType.MAP) {
                this.drawScalebar = this.drawMapScalebar;
            } else {
                this.drawScalebar = this.drawMicroscopyScalebar;
            }
        },
        setMinWidth: function(minWidth) {
            this.divElt.style.width = minWidth;
            // Make sure to display the element before getting is width
            this.divElt.style.display = "";
            this.minWidth = this.divElt.offsetWidth;
        },
        /**
         * Refresh the scalebar with the options submitted.
         * @param {Object} options
         * @param {OpenSeadragon.ScalebarType} options.type The scale bar type.
         * Default: microscopy
         * @param {Integer} options.pixelsPerMeter The pixels per meter of the
         * zoomable image at the original image size. If null, the scale bar is not
         * displayed. default: null
         * @param (String} options.minWidth The minimal width of the scale bar as a
         * CSS string (ex: 100px, 1em, 1% etc...) default: 150px
         * @param {OpenSeadragon.ScalebarLocation} options.location The location
         * of the scale bar inside the viewer. default: bottom left
         * @param {Integer} options.xOffset Offset location of the scale bar along x.
         * default: 5
         * @param {Integer} options.yOffset Offset location of the scale bar along y.
         * default: 5
         * @param {Boolean} options.stayInsideImage When set to true, keep the 
         * scale bar inside the image when zooming out. default: true
         * @param {String} options.color The color of the scale bar using a color
         * name or the hexadecimal format (ex: black or #000000) default: black
         * @param {String} options.fontColor The font color. default: black
         * @param {String} options.backgroundColor The background color. default: none
         * @param {String} options.fontSize The font size. default: not set
         * @param {String} options.barThickness The thickness of the scale bar in px.
         * default: 2
         */
        refresh: function(options) {
            this.updateOptions(options);

            if (!this.viewer.isOpen() ||
                    !this.drawScalebar ||
                    !this.pixelsPerMeter ||
                    !this.location) {
                this.divElt.style.display = "none";
                return;
            }
            this.divElt.style.display = "";

            var zoom = this.getZoomLevel();
            var currentPPM = zoom * this.pixelsPerMeter;
            var value = normalize(currentPPM, this.minWidth);
            var factor = roundSignificand(value / currentPPM * this.minWidth, 3);
            var size = value * this.minWidth;

            var valueWithUnit = getWithUnit(factor);

//            sanityCheck(currentPPM, size, factor, this.minSize);

            this.drawScalebar(size, valueWithUnit);
            var location = this.getScalebarLocation();
            this.divElt.style.left = location.x + "px";
            this.divElt.style.top = location.y + "px";
        },
        drawMicroscopyScalebar: function(size, valueWithUnit) {
            this.divElt.style.fontSize = this.fontSize;
            this.divElt.style.textAlign = "center";
            this.divElt.style.color = this.fontColor;
            this.divElt.style.border = "none";
            this.divElt.style.borderBottom = this.barThickness + "px solid " + this.color;
            this.divElt.style.backgroundColor = this.backgroundColor;
            this.divElt.innerHTML = valueWithUnit;
            this.divElt.style.width = size + "px";
        },
        drawMapScalebar: function(size, valueWithUnit) {
            this.divElt.style.fontSize = this.fontSize;
            this.divElt.style.textAlign = "center";
            this.divElt.style.color = this.fontColor;
            this.divElt.style.border = this.barThickness + "px solid " + this.color;
            this.divElt.style.borderTop = "none";
            this.divElt.style.backgroundColor = this.backgroundColor;
            this.divElt.innerHTML = valueWithUnit;
            this.divElt.style.width = size + "px";
        },
        /**
         * Compute the location of the scale bar.
         * @returns {OpenSeadragon.Point}
         */
        getScalebarLocation: function() {
            if (this.location === $.ScalebarLocation.TOP_LEFT) {
                var x = 0;
                var y = 0;
                if (this.stayInsideImage) {
                    var pixel = this.viewer.viewport.pixelFromPoint(
                            new $.Point(0, 0), true);
                    if (!this.viewer.wrapHorizontal) {
                        x = Math.max(pixel.x, 0);
                    }
                    if (!this.viewer.wrapVertical) {
                        y = Math.max(pixel.y, 0);
                    }
                }
                return new $.Point(x + this.xOffset, y + this.yOffset);
            }
            if (this.location === $.ScalebarLocation.TOP_RIGHT) {
                var barWidth = this.divElt.offsetWidth;
                var container = this.viewer.container;
                var x = container.offsetWidth - barWidth;
                var y = 0;
                if (this.stayInsideImage) {
                    var pixel = this.viewer.viewport.pixelFromPoint(
                            new $.Point(1, 0), true);
                    if (!this.viewer.wrapHorizontal) {
                        x = Math.min(x, pixel.x - barWidth);
                    }
                    if (!this.viewer.wrapVertical) {
                        y = Math.max(y, pixel.y);
                    }
                }
                return new $.Point(x - this.xOffset, y + this.yOffset);
            }
            if (this.location === $.ScalebarLocation.BOTTOM_RIGHT) {
                var barWidth = this.divElt.offsetWidth;
                var barHeight = this.divElt.offsetHeight;
                var container = this.viewer.container;
                var x = container.offsetWidth - barWidth;
                var y = container.offsetHeight - barHeight;
                if (this.stayInsideImage) {
                    var pixel = this.viewer.viewport.pixelFromPoint(
                            new $.Point(1, 1 / this.viewer.source.aspectRatio),
                            true);
                    if (!this.viewer.wrapHorizontal) {
                        x = Math.min(x, pixel.x - barWidth);
                    }
                    if (!this.viewer.wrapVertical) {
                        y = Math.min(y, pixel.y - barHeight);
                    }
                }
                return new $.Point(x - this.xOffset, y - this.yOffset);
            }
            if (this.location === $.ScalebarLocation.BOTTOM_LEFT) {
                var barHeight = this.divElt.offsetHeight;
                var container = this.viewer.container;
                var x = 0;
                var y = container.offsetHeight - barHeight;
                if (this.stayInsideImage) {
                    var pixel = this.viewer.viewport.pixelFromPoint(
                            new $.Point(0, 1 / this.viewer.source.aspectRatio),
                            true);
                    if (!this.viewer.wrapHorizontal) {
                        x = Math.max(x, pixel.x);
                    }
                    if (!this.viewer.wrapVertical) {
                        y = Math.min(y, pixel.y - barHeight);
                    }
                }
                return new $.Point(x + this.xOffset, y - this.yOffset);
            }
        },
        /**
         * The zoom level here is different from the zoom value of a seadragon 
         * viewport.
         * The zoom of a seadragon viewport is the ratio between the container
         * size and the viewport size.
         * This zoom level is the ratio between the size of the entire image
         * at current zoom and the entire image at the deepest zoom level.
         */
        getZoomLevel: function() {
            var imageWidth = this.viewer.source.dimensions.x;
            var containerWidth = this.viewer.viewport.getContainerSize().x;
            var zoomToZoomLevelRatio = containerWidth / imageWidth;
            return this.viewer.viewport.getZoom(true) * zoomToZoomLevelRatio;
        }

    };


    function normalize(value, minSize) {
        var significand = getSignificand(value);
        var minSizeSign = getSignificand(minSize);
        var result = getSignificand(significand / minSizeSign);
        if (result >= 5) {
            result /= 5;
        }
        if (result >= 4) {
            result /= 4;
        }
        if (result >= 2) {
            result /= 2;
        }
        return result;
    }

    function getSignificand(x) {
        return x * Math.pow(10, Math.ceil(-log10(x)));
    }

    function roundSignificand(x, decimalPlaces) {
        var exponent = -Math.ceil(-log10(x));
        var power = decimalPlaces - exponent;
        var significand = x * Math.pow(10, power);
        // To avoid rounding problems, always work with integers
        if (power < 0) {
            return Math.round(significand) * Math.pow(10, -power);
        }
        return Math.round(significand) / Math.pow(10, power);
    }

    function log10(x) {
        return Math.log(x) / Math.log(10);
    }

    function getWithUnit(value) {
        if (value < 0.000001) {
            return value * 100000000 + " nm";
        }
        if (value < 0.001) {
            return value * 1000000 + " μm";
        }
        if (value < 1) {
            return value * 1000 + " mm";
        }
        if (value >= 1000) {
            return value / 1000 + " km";
        }
        return value + " m";
    }

    function isDefined(variable) {
        return typeof (variable) !== "undefined";
    }

    // For debugging purpose only
    function sanityCheck(currentPPM, barSize, factor, minSize) {
        var ppm = barSize / factor;
        if (Math.abs(ppm - currentPPM) > 0.0001) {
            console.log("PPM difference: Expected: " + currentPPM + " Got: " + ppm);
        }
        if (barSize > minSize * 2) {
            console.log("Bar size above limit: " + barSize);
        }
        if (barSize < minSize) {
            console.log("Bar size under limit: " + barSize);
        }
    }
}(OpenSeadragon));
