/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .factory('NuttyUtil', function() {
        var Zindex = 0;
        var termid = 0;
        var topid = 0;

        Object.size = function(obj) {
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        /* took browser detection code from www.quirksmode.org/js/detect.html (author: Peter-Paul Koch) with permission */
        var BrowserDetect = {
            init: function() {
                this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
                this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
                this.OS = this.searchString(this.dataOS) || "an unknown OS";
            },
            searchString: function(data) {
                for (var i = 0; i < data.length; i++) {
                    var dataString = data[i].string;
                    var dataProp = data[i].prop;
                    this.versionSearchString = data[i].versionSearch || data[i].identity;
                    if (dataString) {
                        if (dataString.indexOf(data[i].subString) != -1)
                            return data[i].identity;
                    } else if (dataProp)
                        return data[i].identity;
                }
            },
            searchVersion: function(dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                if (index == -1) return;
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            },
            dataBrowser: [{
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            }, {
                string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            }, {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            }, {
                prop: window.opera,
                identity: "Opera",
                versionSearch: "Version"
            }, {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            }, {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            }, {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            }, {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            }, { // for newer Netscapes (6+)
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            }, {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            }, {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            }, { // for older Netscapes (4-)
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }],
            dataOS: [{
                string: navigator.platform,
                subString: "Win",
                identity: "Windows"
            }, {
                string: navigator.platform,
                subString: "Mac",
                identity: "Mac"
            }, {
                string: navigator.userAgent,
                subString: "iPhone",
                identity: "iPhone/iPod"
            }, {
                string: navigator.platform,
                subString: "Linux",
                identity: "Linux"
            }]

        };

        BrowserDetect.init();

        if (BrowserDetect.browser === "Chrome" && BrowserDetect.version >= 29 && (BrowserDetect.OS == "Linux" || BrowserDetect.OS == "Mac"))
            BrowserDetect.incompatible = 0;
        else
            BrowserDetect.incompatible = 1;

        ﻿ /* ! viewportSize | Author: Tyson Matanich, 2013 | License: MIT */
        (function(window) {
            window.viewportSize = {};

            window.viewportSize.getHeight = function() {
                return getSize("Height");
            };

            window.viewportSize.getWidth = function() {
                return getSize("Width");
            };

            var getSize = function(Name) {
                var size;
                var name = Name.toLowerCase();
                var document = window.document;
                var documentElement = document.documentElement;
                if (window["inner" + Name] === undefined) {
                    // IE6 & IE7 don't have window.innerWidth or innerHeight
                    size = documentElement["client" + Name];
                } else if (window["inner" + Name] != documentElement["client" + Name]) {
                    // WebKit doesn't include scrollbars while calculating viewport size so we have to get fancy

                    // Insert markup to test if a media query will match document.doumentElement["client" + Name]
                    var bodyElement = document.createElement("body");
                    bodyElement.id = "vpw-test-b";
                    bodyElement.style.cssText = "overflow:scroll";
                    var divElement = document.createElement("div");
                    divElement.id = "vpw-test-d";
                    divElement.style.cssText = "position:absolute;top:-1000px";
                    // Getting specific on the CSS selector so it won't get overridden easily
                    divElement.innerHTML = "<style>@media(" + name + ":" + documentElement["client" + Name] + "px){body#vpw-test-b div#vpw-test-d{" + name + ":7px!important}}</style>";
                    bodyElement.appendChild(divElement);
                    documentElement.insertBefore(bodyElement, document.head);

                    if (divElement["offset" + Name] == 7) {
                        // Media query matches document.documentElement["client" + Name]
                        size = documentElement["client" + Name];
                    } else {
                        // Media query didn't match, use window["inner" + Name]
                        size = window["inner" + Name];
                    }
                    // Cleanup
                    documentElement.removeChild(bodyElement);
                } else {
                    // Default to use window["inner" + Name]
                    size = window["inner" + Name];
                }
                return size;
            };

        })(window);
        // Public API here
        return {
            alternate: 0,
            browser: BrowserDetect,
            incZindex: function(id) {
                topid = id;
                return Zindex++;
            },
            randomstr: function(n) {
                var text = "";
                var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < n; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            },
            getWidth: function() {
                return viewportSize.getWidth();
            },
            getHeight: function() {
                return viewportSize.getHeight();
            },
            gettermid: function() {
                return termid++;
            }
        };
    });
