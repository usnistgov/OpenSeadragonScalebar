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

    var self = this;

    OpenSeadragon.Viewer.prototype.scalebar = function(options) {
        if (!self.scalebarInstance) {
            self.scalebarInstance = new $.Scalebar({
                viewer: this,
                width: options.width,
                height: options.height,
                pixelsPerMeter: options.pixelsPerMeter,
                color: options.color
            });
        } else {
            self.scalebarInstance.refresh(options);
        }
    };

    /**
     * 
     * @class Scalebar
     * @param {Object} options
     * @param {OpenSeadragon.Viewer} options.viewer The viewer to attach this
     * Scalebar to.
     * @param {Integer} options.pixelsPerMeter The pixels per meter of the
     * zoomable image at the original image size. If null, the scale bar is not
     * displayed. default: null
     * @param (String} options.width The width of the scale bar canvas as a
     * CSS string (ex: 100px, 1em, 1% etc...). default: 0
     * @param (String} options.height The height of the scale bar canvas as a
     * CSS string (ex: 100px, 1em, 1% etc...). default: 0
     * @param {String} options.color The color of the scale bar using a color
     * name or the hexadecimal format (ex: black or #000000) default: black
     */
    $.Scalebar = function(options) {
        options = options || {};
        if (!options.viewer) {
            throw new Error("A viewer must be specified.");
        }
        this.viewer = options.viewer;

        this.canvas = document.createElement("canvas");
        this.viewer.container.appendChild(this.canvas);
        this.canvas.style.position = "relative";

        options.width = options.width || "0";
        options.height = options.height || "0";
        this.setSize(options.width, options.height);

        this.color = options.color || "black";
        this.pixelsPerMeter = options.pixelsPerMeter || null;

        var self = this;
        this.viewer.addHandler("open", function() {
            self.refresh();
        });
        this.viewer.addHandler("animation", function() {
            self.refresh();
        });
    };

    $.Scalebar.prototype = {
        setSize: function(width, height) {
            this.canvas.style.width = width;
            this.canvas.style.height = height;
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.context = this.canvas.getContext("2d");
            this.context.font = this.canvas.height - 10 + "px sans-serif";
            this.minSize = this.canvas.width / 2;
        },
        /**
         * Refresh the scalebar with the options submitted.
         * @param {Object} options
         * @param {Integer} options.pixelsPerMeter The pixels per meter of the
         * zoomable image at the original image size. If null, the scale bar is not
         * displayed. default: null
         * @param (String} options.width The width of the scale bar canvas as a
         * CSS string (ex: 100px, 1em, 1% etc...)
         * @param (String} options.height The height of the scale bar canvas as a
         * CSS string (ex: 100px, 1em, 1% etc...)
         * @param {String} options.color The color of the scale bar using a color
         * name or the hexadecimal format (ex: black or #000000) default: black
         */
        refresh: function(options) {
            options = options || {};
            if (options.width || options.height) {
                var width = options.width || this.canvas.style.width;
                var height = options.height || this.canvas.style.height;
                this.setSize(width, height);
            }
            if (options.color) {
                this.color = options.color;
            }
            if (typeof(options.pixelsPerMeter) !== "undefined") {
                this.pixelsPerMeter = options.pixelsPerMeter;
            }

            var width = this.canvas.width;
            var height = this.canvas.height;
            this.context.clearRect(0, 0, width, height);
            if (!this.viewer.isOpen() || !this.pixelsPerMeter) {
                return;
            }

            var contWidth = this.viewer.container.offsetWidth;
            var contHeight = this.viewer.container.offsetHeight;

            var pixel = this.viewer.viewport.pixelFromPoint(
                    new OpenSeadragon.Point(1, 1 / this.viewer.source.aspectRatio),
                    true);
            var x = Math.round(pixel.x) - width;
            var y = Math.round(pixel.y) - height;
            if (x + width > contWidth) {
                x = contWidth - width;
            }
            if (y + height > contHeight) {
                y = contHeight - height;
            }
            this.canvas.style.left = x - 10 + "px"; //add 10px margin
            this.canvas.style.top = y - 10 + "px";
            var zoom = this.getZoomLevel();
            var currentPPM = zoom * this.pixelsPerMeter;

            var value = normalize(currentPPM, this.minSize);
            var factor = roundSignificand(value / currentPPM * this.minSize, 3);
            var size = value * this.minSize;

            var valueWithUnit = getWithUnit(factor);

//            sanityCheck(currentPPM, size, factor, this.canvas.width, this.minSize);

            var textSize = this.context.measureText(valueWithUnit).width;
            var center = (size - textSize) / 2;

            this.context.fillStyle = this.color;
            this.context.strokeStyle = this.color;
            this.context.beginPath();
            this.context.moveTo(0, height - 2);
            this.context.lineTo(size, height - 2);
            this.context.stroke();
            this.context.fillText(valueWithUnit, center, height - 8);
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
            return value * 100000000 + "nm";
        }
        if (value < 0.001) {
            return value * 1000000 + "μm";
        }
        if (value < 1) {
            return value * 1000 + "mm";
        }
        if (value >= 1000) {
            return value / 1000 + "km";
        }
        return value + "m";
    }

    // For debugging purpose only
    function sanityCheck(currentPPM, barSize, factor, canvasWidth, minSize) {
        var ppm = barSize / factor;
        if (Math.abs(ppm - currentPPM) > 0.0001) {
            console.log("PPM difference: Expected: " + currentPPM + " Got: " + ppm);
        }
        if (barSize > canvasWidth) {
            console.log("Bar size above limit: " + barSize);
        }
        if (barSize < minSize) {
            console.log("Bar size under limit: " + barSize);
        }
    }
}(OpenSeadragon));