/* $.panel - v0.0.1 - 2015-09-16
 * Copyright (c) 2015 Maxime Corson - SPYRIT SI
 * Licensed MIT
 * Based on the bigSlide jquery plugin (http://ascott1.github.io/bigSlide.js/) by Adam D. Scott
 */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var Panel = function($panel, options) {

        // plugin settings
        var settings = $.extend({
            push: null,
            side: 'left',
            width: '15.625em',
            speed: '300',
            state: 'closed',
            activeBtn: 'active',
            easyClose: false,
            beforeOpen: function () {
            },
            afterOpen: function () {
            },
            beforeClose: function () {
            },
            afterClose: function () {
            }
        }, options);

        var self = this;

        // CSS properties set by bigSlide.js on all implicated DOM elements
        var baseCSSDictionary = 'transition -o-transition -ms-transition -moz-transitions webkit-transition ' + settings.side;

        var model = {
            //CSS properties set by bigSlide.js on this.$menu
            menuCSSDictionary: baseCSSDictionary + ' position top bottom height width',
            //CSS properties set by bigSlide.js on this.$push
            pushCSSDictionary: baseCSSDictionary,
            // store the menu's state in the model
            state: settings.state
        };

        var controller = {
            // update the menu's state
            changeState: function () {
                if (model.state === 'closed') {
                    model.state = 'open'
                } else {
                    model.state = 'closed'
                }
            },
            // check the menu's state
            getState: function () {
                return model.state;
            }
        };

        var view = {
            init: function(){

                // CSS for how the menu will be positioned off screen
                var positionOffScreen = {
                    position: 'fixed',
                    top: '0',
                    bottom: '0',
                    height: '100%'
                };

                // manually add the settings values
                positionOffScreen[settings.side] = '-' + settings.width;
                positionOffScreen.width = settings.width;

                // add the css values to position things offscreen
                if (settings.state === 'closed') {
                    $panel.css(positionOffScreen);
                    if(settings.push)
                    {
                        $(settings.push)
                            .css(settings.side, '0')
                            .css('position', 'fixed');
                    }
                }

                // css for the sliding animation
                var animateSlide = {
                    '-webkit-transition': settings.side + ' ' + settings.speed + 'ms ease',
                    '-moz-transition': settings.side + ' ' + settings.speed + 'ms ease',
                    '-ms-transition': settings.side + ' ' + settings.speed + 'ms ease',
                    '-o-transition': settings.side + ' ' + settings.speed + 'ms ease',
                    'transition': settings.side + ' ' + settings.speed + 'ms ease'
                };

                // add the animation css
                $panel.css(animateSlide);
                if(settings.push)
                {
                    $(settings.push).css(animateSlide);
                }

                if (settings.easyClose) {
                    $(document).on('click.bigSlide', function (e) {
                        if (!$(e.target).closest($panel).length && controller.getState() === 'open') {
                            self.close();
                        }
                    });
                }
            }
        }

        // toggle the menu open
        this.open = function() {
            settings.beforeOpen($(this));
            controller.changeState();
            $panel.css(settings.side, '0');
            $panel.addClass('open');
            if(settings.push)
            {
                $(settings.push).css(settings.side, settings.width);
            }
            settings.afterOpen($(this));
        };

        // toggle the menu closed
        this.close = function() {
            settings.beforeClose($(this));
            controller.changeState();
            $panel.css(settings.side, '-' + settings.width);
            $(settings.push).css(settings.side, '0');
            //panel.removeClass(settings.activeBtn);
            settings.afterClose($(this));
            setTimeout(function(){ $panel.removeClass('open'); }, settings.speed);
        };

        this.destroy = function() {
            //remove inline styles generated by bigSlide.js while preserving any other inline styles
            $panel.each(function () {
                $(this).attr('style', _cleanInlineCSS($(this).attr('style'), model.menuCSSDictionary).trim());
            });

            $(settings.push).each(function() {
                $(this).attr('style', _cleanInlineCSS($(this).attr('style'), model.pushCSSDictionary).trim());
            });

            //release DOM references to avoid memory leaks
            $panel = null;
        };

        this.isOpen = function() {
            return model.state === 'open';
        }

        view.init();
    };

    $.fn.panel = function(methodOrOptions) {

        var method = (typeof methodOrOptions === 'string') ? methodOrOptions : undefined;

        if (method)
        {
            var panels = [];

            this.each(function() {
                var $el = $(this);
                var panel = $el.data('panel');

                panels.push(panel);
            });

            var args    = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;
            var results = [];

            this.each(function (index) {
                var panel = panels[index];

                if (!panel) {
                    console.warn('$.panel not instantiated yet');
                    console.info(this);
                    results.push(undefined);
                    return;
                }

                if (typeof panel[method] === 'function') {
                    var result = panel[method].apply(panel, args);
                    results.push(result);
                } else {
                    console.warn('Method "' + method + '" not defined in $.panel');
                }
            });
            return (results.length > 1) ? results : results[0];
        }
        else
        {
            var options = (typeof methodOrOptions === 'object') ? methodOrOptions : undefined;
            return this.each(function() {
                var $el = $(this);
                var panel = new Panel($el, options);

                $el.data('panel', panel);
            });
        }
    };

    // where inlineCSS is the string value of an element's style attribute
    // and toRemove is a string of space-separated CSS properties,
    // _cleanInlineCSS removes the CSS declaration for each property in toRemove from inlineCSS
    // and returns the resulting string
    function _cleanInlineCSS(inlineCSS, toRemove) {
        var inlineCSSArray = inlineCSS.split(';');
        var toRemoveArray = toRemove.split(' ');

        var cleaned = '';
        var keep;

        for (var i = 0, j = inlineCSSArray.length; i < j; i++) {
            keep = true;
            for (var a = 0, b = toRemoveArray.length; a < b; a++) {
                if (inlineCSSArray[i] === '' || inlineCSSArray[i].indexOf(toRemoveArray[a]) !== -1) {
                    keep = false;
                }
            }
            if (keep) {
                cleaned += inlineCSSArray[i] + '; ';
            }
        }

        return cleaned;
    }
}));
