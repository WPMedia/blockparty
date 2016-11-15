(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var postGraphicsTemplate = require('./pg-template/postGraphicsTemplate.js');

},{"./pg-template/postGraphicsTemplate.js":5}],2:[function(require,module,exports){
'use strict';

(function () {

    // All utility functions should attach themselves to this object.
    var util = {};

    // This code assumes it is running in a browser context
    window.TWP = window.TWP || {
        Module: {}
    };
    window.TWP.Module = window.TWP.Module || {};
    window.TWP.Module.util = util;

    if (!util.getParameters || typeof util.getParameters === 'undefined') {
        util.getParameters = function (url) {
            var paramList = [],
                params = {},
                kvPairs,
                tmp;
            if (url) {
                if (url.indexOf('?') !== -1) {
                    paramList = url.split('?')[1];
                    if (paramList) {
                        if (paramList.indexOf('&')) {
                            kvPairs = paramList.split('&');
                        } else {
                            kvPairs = [paramList];
                        }
                        for (var a = 0; a < kvPairs.length; a++) {
                            if (kvPairs[a].indexOf('=') !== -1) {
                                tmp = kvPairs[a].split('=');
                                params[tmp[0]] = unescape(tmp[1]);
                            }
                        }
                    }
                }
            }
            return params;
        };
    }

    // Update the height of the iframe if this page is iframe'd.
    // NOTE: This **requires** the iframe's src property to use a location
    // without its protocol. Using a protocol will not work.
    //
    // e.g. <iframe frameborder="0" scrolling="no" style="width: 100%; height:600px;" src="//www.washingtonpost.com/graphics/national/census-commute-map/?template=iframe"></iframe>
    util.changeIframeHeight = function () {
        // Location *without* protocol and search parameters
        var partialLocation = window.location.origin.replace(window.location.protocol, '') + window.location.pathname;

        // Build up a series of possible CSS selector strings
        var selectors = [];

        // Add the URL as it is (adding in the search parameters)
        selectors.push('iframe[src="' + partialLocation + window.location.search + '"]');

        if (window.location.pathname[window.location.pathname.length - 1] === '/') {
            // If the URL has a trailing slash, add a version without it
            // (adding in the search parameters)
            selectors.push('iframe[src="' + (partialLocation.slice(0, -1) + window.location.search) + '"]');
        } else {
            // If the URL does *not* have a trailing slash, add a version with
            // it (adding in the search parameters)
            selectors.push('iframe[src="' + partialLocation + '/' + window.location.search + '"]');
        }

        // Search for those selectors in the parent page, and adjust the height
        // accordingly.
        var $iframe = $(window.top.document).find(selectors.join(','));
        var h = $('body').outerHeight(true);
        $iframe.css({ 'height': h + 'px' });
    };

    // from http://davidwalsh.name/javascript-debounce-function
    util.debounce = function (func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            var later = function later() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    $(document).ready(function () {
        // iframe code
        var params = util.getParameters(document.URL);
        if (params['template'] && params['template'] === 'iframe') {
            // TODO Why do we need this? Nobody knows.
            try {
                document.domain = 'washingtonpost.com';
            } catch (e) {}

            $('body').addClass('iframe').show().css('display', 'block');
            if (params['graphic_id']) {
                $('#' + params['graphic_id']).siblings().hide();
            }
            $('#pgcontent, .pgArticle').siblings().hide();

            // CORS limitations
            try {
                if (window.location.hostname === window.top.location.hostname) {
                    var resizeIframe = util.debounce(function () {
                        util.changeIframeHeight();
                    }, 250);

                    // responsive part
                    // TODO Why 1000ms? This is not reliable.
                    window.setTimeout(function () {
                        util.changeIframeHeight();
                    }, 1000);

                    $(window).on('resize', resizeIframe);
                }
            } catch (e) {}
        }
    });
}).call(undefined);

},{}],3:[function(require,module,exports){
'use strict';

(function ($, window) {

    var core = window.wp_pb = window.wp_pb || {};
    var nav = core.nav = core.nav || {};

    var wpHeader = {

        init: function init() {

            // hide nav on IE 8 browsers
            if ($('#page').hasClass('ie8')) {
                return;
            } else {

                /*
                * Move header feature outside of pb-container 
                */
                if ($("#pb-root .pb-f-page-header-v2").length) {
                    var $header = $(".pb-f-page-header-v2");
                    $("#pb-root").before($header);
                }

                /*
                 * Detect IE browsers, add classes
                 */
                if (window.ActiveXObject || "ActiveXObject" in window) {
                    $("#main-sections-nav").addClass("ie");
                    $("#wp-header").addClass("ie");
                }

                /*
                 * Nav menu items click tracking code
                 *   - left nav items formatt: menu_nav_{{nav-menu-item-name}}
                 *   - top nav items formatt:  top_nav_{{nav-menu-item-name}}
                 */

                // left nav
                $("#sections-menu-off-canvas ul.side-nav li").each(function () {
                    if ($(this).hasClass('nav-screenreader-link')) {
                        return;
                    }
                    var item = $(this).find('>a'),
                        itemText = item.html().replace(/\s+/g, '').replace(/\&/g, '-').toLowerCase(),
                        itemLink = item.attr('href');

                    if ($(this).hasClass('main-nav')) {
                        // main nav item
                        item.attr('href', itemLink + "?nid=menu_nav_" + itemText);
                    } else if ($(this).hasClass('sub-nav-item')) {
                        // sub nav item
                        var mainItem = $(this).parents('.main-nav').find('>a').text().replace(/\s+/g, '').replace(/\&/g, '-').toLowerCase();
                        item.attr('href', itemLink + "?nid=menu_nav_" + mainItem + '-' + itemText);
                    }
                });

                // top nav
                $("#sections-menu-wide li").each(function () {
                    var item = $(this).find('a'),
                        itemText = item.html().replace(/\s+/g, '').replace(/\&/g, '-').toLowerCase(),
                        itemLink = item.attr('href');
                    item.attr('href', itemLink + "?nid=top_nav_" + itemText);
                });

                // --------------------------------END items click tracking-----------------------------

                /*
                 * Search field and button functionality
                 */
                (function () {

                    var searchIconHovered;

                    // Search field and button
                    $('#search-btn').click(function (e) {
                        if ($(this).hasClass('closed')) {

                            $(this).removeClass('closed').addClass('opened');
                            $('#search-field').removeClass('closed').addClass('opened');
                            $('#search-field').focus();
                        } else if ($(this).hasClass('opened')) {
                            $("#search-form").submit();
                        }
                    });

                    $("#search-btn").bind("mouseover", function () {
                        if ($(this).hasClass('opened')) searchIconHovered = true;
                    }).bind("mouseout", function () {
                        if ($(this).hasClass('opened')) searchIconHovered = false;
                    });

                    $('#search-field').blur(function (e) {
                        if ($(this).hasClass('opened') && !searchIconHovered) {

                            $(this).removeClass('opened').addClass('closed');
                            $('#search-btn').removeClass('opened').addClass('closed');
                        }
                    });

                    $("#search-form, #nav-search-mobile").submit(function (event) {
                        if ($(this).find('input[type=text]').val()) {
                            try {
                                s.sendDataToOmniture('Search Submit', 'event2', { 'eVar38': $(this).find('input[type=text]').val(), 'eVar1': s.pageName });
                            } catch (e) {}
                            return true;
                        } else {
                            return false;
                        }
                    });
                })();

                // ------------------------------- End Search field and button functionality  ----------------------

                /*
                 * List items hover events & styles
                 */
                (function () {

                    var timer;

                    // User ststus buttons hovers
                    $("#logged-in-status .nav-sign-in").hover(function (e) {
                        $('#nav-subscribe').addClass('signIn-hover');
                    }, function (e) {
                        $('#nav-subscribe').removeClass('signIn-hover');
                    });

                    // Sections button
                    $("#sections-menu-off-canvas li a").hover(function (e) {
                        $(this).addClass('hover-name');
                        $(this).parent().addClass('unhover-list');
                    }, function (e) {
                        $(this).removeClass('hover-name');
                        $(this).parent().removeClass('unhover-list');
                    });

                    $('#nav-user').click(function () {
                        $('#user-menu').toggleClass('nav-user-show');
                    });

                    $('#settings-nav-btn').click(function () {
                        if ($('#logged-in-status').hasClass('logged-in')) {
                            $('#user-menu').toggleClass('nav-user-show');
                        } else {
                            $('.sign-up-buttons').toggleClass('nav-user-show');
                        }
                    });

                    function delayHover(element) {
                        timer = setTimeout(function () {
                            $("#main-sections-nav").addClass('subNavigation');
                            $(element).addClass("hover");
                        }, 75);
                    };

                    $('.main-nav').hover(function () {
                        delayHover($(this));
                    }, function () {
                        $(this).removeClass("hover");
                        $("#main-sections-nav").removeClass('subNavigation');
                        clearTimeout(timer);
                    });

                    if ($(window).width() <= 480) {
                        $('.main-nav').click(function () {
                            location.href = $(this).find('.main-nav-item').attr('href');
                        });
                    }
                })();

                // ------------------------------- End List items hover events & styles ----------------------
            }
        },

        setupNav: function setupNav() {

            $.fn.appendLinkItems = function (links, surroundingTag) {
                var element = this;
                surroundingTag = surroundingTag || "<li>";
                $.each(links, function (i, link) {
                    var a = $("<a>");
                    if (link.title) {
                        a.text(link.title);
                    }
                    if (link.html) {
                        a.html(link.html);
                    }
                    if (link.href) {
                        a.attr("href", link.href);
                    }
                    if (link.attr) {
                        a.attr(link.attr);
                    }
                    element.append($(surroundingTag).append(a).addClass(link.selected ? "selected" : ""));
                });
                return this;
            };

            nav.setIdentityMenu = function (menu) {
                var element = $("#user-menu ul");
                element.children('li').remove();
                element.appendLinkItems(menu);
            };

            nav.closeDropdowns = function () {
                $("#wp-header .dropdown-trigger.active").each(function () {
                    $(this).removeClass("active");
                    $("#" + $(this).data("menu")).hide();
                });
                $(".leaderboard").removeClass("hideAd");
            };

            nav.showNav = function () {
                // if (typeof window.wp_pb == 'object' && typeof window.wp_pb.report == 'function'
                //     && ($("#wp-header").hasClass("bar-hidden"))) {
                if ($("#wp-header").hasClass("bar-hidden")) {

                    // wp_pb.report('nav', 'start_open', true);

                    setTimeout(function () {
                        $("#wp-header").removeClass("bar-hidden");
                        // wp_pb.report('nav', 'finish_open', true);
                    }, 250);
                }
            };

            nav.hideNav = function () {
                // if (typeof window.wp_pb == 'object' && typeof window.wp_pb.report == 'function' 
                //    && (!$("#wp-header").hasClass("bar-hidden")) ) {
                if (!$("#wp-header").hasClass("bar-hidden")) {

                    // wp_pb.report('nav', 'start_close', true);

                    setTimeout(function () {
                        // wp_pb.report('nav', 'finish_close', true);
                        $("#wp-header").addClass("bar-hidden");
                    }, 250);
                }
            };

            // activate site menu with custom actions
            $(".section-menu-btn").click(function (event) {

                event.stopPropagation();
                event.preventDefault();

                if ($('html').hasClass('drawbridge-up')) {
                    return;
                }

                var _clickElement = $(this),
                    _menuElement = $("#main-sections-nav");

                if (_menuElement.hasClass("active")) {

                    $("body").removeClass("left-menu left-menu-pb");
                    _clickElement.removeClass("active");
                    _menuElement.removeClass("active");

                    // if (typeof window.wp_pb == 'object' && typeof window.wp_pb.report == 'function') {
                    //     wp_pb.report('nav', 'menu_start_close', true);
                    // setTimeout(function() {
                    //     wp_pb.report('nav', 'menu_finish_close', true);
                    // }, 500);
                    // }
                } else {

                    _menuElement.css("height", $(window).height() - 45);
                    $("body").addClass("left-menu left-menu-pb");
                    _clickElement.addClass("active");
                    _menuElement.addClass("active");

                    // if (typeof window.wp_pb == 'object' && typeof window.wp_pb.report == 'function') {
                    //     wp_pb.report('nav', 'menu_start_open', true);
                    //     setTimeout(function() {
                    //         wp_pb.report('nav', 'menu_finish_open', true);
                    //     }, 500);
                    // }
                }

                calcSubnavPosition();
            });
        },

        setScrollEvents: function setScrollEvents() {
            var isHomepage = $("#logo-in-nav").hasClass('homePage'),
                scrollPos = $(this).scrollTop() ? $(this).scrollTop() : 0,
                isMobileDevice = isMobile(),
                notificationBar = $('.pb-f-page-notification-bar'),
                notificationOffset = 0;
            if (notificationBar.length) {
                notificationOffset = notificationBar.outerHeight();
            }

            if (isHomepage) {
                $('#logo-in-nav').removeClass('nav-display-show').addClass('nav-display-hide');

                $(window).scroll(function () {

                    var navchange = false,
                        widthbreak = 768,
                        window_width = $(window).width(),
                        y_scroll_pos = window.pageYOffset,
                        scroll_pos_test = 80;

                    // Only for tablet landscape up
                    if (window_width >= widthbreak) {
                        if (y_scroll_pos > scroll_pos_test && navchange == false) {
                            navchange = true;
                            $('#sections-menu-wide').removeClass('nav-display-show').addClass('nav-display-hide');
                            $('#logo-in-nav').addClass('nav-display-show').removeClass('nav-display-hide');
                        } else if (y_scroll_pos <= 0) {
                            navchange = false;
                            if (!$('#section-menu-btn').hasClass('active')) {
                                $('#logo-in-nav').removeClass('nav-display-show').addClass('nav-display-hide');
                                $('#sections-menu-wide').addClass('nav-display-show').removeClass('nav-display-hide');
                            }
                        }
                    }

                    if ($("#main-sections-nav").hasClass('active')) {
                        calcSubnavPosition();
                    }
                });
            } else if (!isHomepage || isMobileDevice) {

                var timeOutTime = 50,
                    scrollHeight = 150;

                if (isMobileDevice) {
                    scrollHeight = 30;
                    timeOutTime = 25;
                }
                $(window).scroll(function () {
                    if (!$('#section-menu-btn').hasClass('active')) {

                        /* show and hide nav on scroll */
                        var currentPos = $(this).scrollTop();

                        if (currentPos + 80 < scrollPos || currentPos === 0) {
                            var copyPos = currentPos;
                            setTimeout(function () {
                                var lastPos = $(this).scrollTop();
                                if (copyPos - lastPos > scrollHeight && !$('#wp-header').hasClass('no-scroll-peek') || currentPos === 0) {
                                    nav.showNav();
                                    scrollPos = currentPos;
                                }
                            }, timeOutTime);
                        } else if (currentPos - 80 > scrollPos && currentPos > 50 + notificationOffset) {

                            nav.hideNav();
                            scrollPos = currentPos;
                        }

                        // hide user menu drop downs if opened
                        $('#user-menu').removeClass('nav-user-show');
                        $('.sign-up-buttons').removeClass('nav-user-show');
                    }

                    if ($("#main-sections-nav").hasClass('active')) {
                        calcSubnavPosition();
                    }
                });
            }

            $(window).resize(function () {
                //remove standard dropdowns
                nav.closeDropdowns();
                //resize site menu, if open
                if ($("body").hasClass("left-menu")) {
                    $("#main-sections-nav").css("height", $(window).height() - 45);
                }
            });

            $(document).ready(function () {
                // wp_pb.register('nav', 'force-show', function() {
                nav.showNav();
                // });
            });
        },

        setIdentity: function setIdentity() {

            var idp;
            nav.getIdentityProvider = function () {
                return idp;
            };
            nav.setIdentityProvider = function (provider) {
                var ef = function ef() {}; //empty function
                idp = {};
                // we'll pad any missing portion with empty function
                idp.name = provider.name || "";
                idp.getUserId = provider.getUserId || ef;
                idp.getUserMenu = provider.getUserMenu || ef;
                idp.getSignInLink = provider.getSignInLink || ef;
                idp.getRegistrationLink = provider.getRegistrationLink || ef;
                idp.isUserLoggedIn = provider.isUserLoggedIn || ef;
                idp.isUserSubscriber = provider.isUserSubscriber || ef;

                idp.render = provider.render || function () {
                    if (idp.isUserLoggedIn()) {
                        $("#nav-user .username").text(idp.getUserId());

                        nav.setIdentityMenu(idp.getUserMenu());
                        $("#nav-user, #user-menu").removeClass("hidden");

                        if (idp.isUserSubscriber() === "0") {
                            $('#user-menu ul li:first-child').after($('#nav-subscribe').clone());
                            $("#user-menu  #nav-subscribe").removeClass("hidden");
                        }

                        $('#logged-in-status').addClass('logged-in');

                        $(".nav-sign-in").addClass("hidden");
                        $("#nav-subscribe").addClass("hidden");
                        $("#nav-subscribe-mobile").addClass("hidden");
                    } else {

                        $("#sign-in-link").attr("href", idp.getSignInLink() + "&nid=top_pb_signin");
                        $(".nav-sign-in").removeClass("hidden");

                        $("#nav-subscribe").removeClass("hidden");
                        $("#nav-subscribe-mobile").removeClass("hidden");
                    }
                };

                //let's render
                nav.renderIdentity();
            };

            nav.renderIdentity = function (callback) {
                callback = callback || function () {};
                if (idp) {
                    // the user might not have configured any identity. So check for it.
                    idp.render();
                }
                callback(idp);
            };

            /*
             * Using the provded API, set up the default identity provider as TWP
             */

            // if the identity component were set as hidden from PageBuilder admin
            // set a flag so that we don't process login at all
            var showIdentity = $("#nav-user").data("show-identity");

            // default Identity
            var current = window.location.href.split("?")[0];
            var twpIdentity = {
                name: "TWP",
                getUserId: function getUserId() {
                    var username = TWP.Util.User.getUserName();
                    var userid = TWP.Util.User.getUserId();
                    if (typeof username == "string" && username.length > 0) {
                        return username;
                    } else {
                        return userid;
                    }
                },
                getUserMenu: function getUserMenu() {
                    return [{ "title": "Profile", "href": TWP.signin.profileurl + current + '&refresh=true' }, { "title": "Log out", "href": TWP.signin.logouturl_page }];
                },
                getSignInLink: function getSignInLink() {
                    return TWP.signin.loginurl_page + current;
                },
                getRegistrationLink: function getRegistrationLink() {
                    return TWP.signin.registrationurl_page + current;
                },
                isUserSubscriber: function isUserSubscriber() {
                    sub = document.cookie.match(/rplsb=([0-9]+)/) ? RegExp.$1 : '';
                    var sub = document.cookie.match(/rplsb=([0-9]+)/) ? RegExp.$1 : '';
                    return sub;
                },
                isUserLoggedIn: function isUserLoggedIn() {
                    return TWP.Util.User ? TWP.Util.User.getAuthentication() : false;
                }
            };

            // If we are showing identity then set the default identity provider to TWP.
            //   User can overide this whenever they want.
            //
            // In TWP, identity user interface needs to processed after the fact that all other javascript has been loaded.
            //   But the js resources are loaded asynchronously and it doesn't have any callbacks hooks. So we watch for it.
            if (showIdentity) {
                //try to load TWP only if we are showing Identity.
                var init = new Date().getTime();
                (function checkTWP() {
                    // if there's already idp set, then don't try to load TWP.
                    if (!nav.getIdentityProvider()) {
                        if (TWP && TWP.signin && TWP.Util) {
                            // make sure TWP has been loaded.
                            nav.setIdentityProvider(twpIdentity);
                            nav.renderIdentity();
                        } else {
                            var now = new Date().getTime();
                            // after 3 seconds, if TWP indentity hasn't been loaded. Let's just stop.
                            // if (now - init < 3 * 1000) {
                            // if it hasn't been loaded, we wait few milliseconds and try again.
                            window.setTimeout(function () {
                                checkTWP();
                            }, 200);
                            // }
                        }
                    }
                })();
            }
        }
    };

    /*
     * Detects if it's a mobile device
     */
    function isMobile() {
        if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
        // || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Kindle/i) || navigator.userAgent.match(/Windows Phone/i)) {
            return true;
        } else {
            return false;
        }
    }

    /*
     * Position sub navigation verticaly centered, 
     *   relative to main navigation
     */
    function calcSubnavPosition() {
        $("#sections-menu-off-canvas > ul > li").each(function () {
            if (!$("#main-sections-nav").hasClass("active")) {
                return;
            }
            if ($(this).hasClass('has-sub')) {
                var movetop = $(this).find('ul').height() / 2 - 10,
                    offsetY = $(this).offset().top - $(window).scrollTop();
                if (offsetY < 94) {
                    movetop = 0;
                } else if (offsetY - movetop < 95) {
                    movetop = offsetY - 95;
                }
                $(this).find('ul').css('top', '-' + movetop + 'px');
            }
        });
    }

    wpHeader.init();
    wpHeader.setupNav();
    wpHeader.setScrollEvents();
    wpHeader.setIdentity();
})(jQuery, window);

},{}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//features > sharebars > top-share-bar > render.js - stolen straight from
(function () {
    try {
        var socialTools = {
            myRoot: '.top-sharebar-wrapper',
            init: function init() {
                $('.pb-f-sharebars-top-share-bar').each(function (index, root) {
                    //vertical-sticky-top-sharebar has no mobile view
                    if (!TWPHead.desktop && !$(root).find('.top-sharebar-wrapper').data('pb-prevent-ajax') && $(root).find('.vertical-sticky-top-sharebar').size() == 0) {
                        var contentUriPath = $(root).find('.top-sharebar-wrapper').data('pb-canonical-url');
                        if (contentUriPath.indexOf('.washingtonpost.com') >= 0) {
                            $.ajax({
                                url: '/pb/api/v2/render/feature',
                                dataType: 'json',
                                data: {
                                    id: $(root)[0].id,
                                    uri: window.location.pathname,
                                    contentUri: contentUriPath,
                                    desktop: TWPHead.desktop,
                                    mobile: TWPHead.mobile
                                },
                                cache: true,
                                jsonCallback: 'wpTopShareBarAjax',
                                success: function success(data) {
                                    $(root).empty();
                                    $(root).append($(data.rendering).children());
                                    socialTools.originalInit();
                                },
                                error: function error(data) {
                                    socialTools.originalInit();
                                }
                            });
                        } else {
                            socialTools.originalInit();
                        }
                        $(root).find('.top-sharebar-wrapper').data('pb-prevent-ajax', 'true');
                    } else {
                        socialTools.originalInit();
                    }
                });
            },
            originalInit: function originalInit(myRoot) {
                var self = this;
                myRoot = myRoot || this.myRoot;
                var $myRoot = $(myRoot);

                //handle sticky behavior
                if ($myRoot.hasClass('sticky-top-sharebar')) {
                    stickyHorizontalShareBar.init();
                }

                $myRoot.each(function (index, myRootElement) {
                    //handle vertical-sticky behavior for each element that is vertical-sticky
                    if ($(myRootElement).hasClass('vertical-sticky-top-sharebar')) {
                        stickyVerticalShareBar.init($(myRootElement));
                    }
                    if (wp_pb.StaticMethods.staticPostShare) {
                        wp_pb.StaticMethods.staticPostShare.init($(myRootElement), $(myRootElement).data('postshare'));
                    }
                    var $root = $(myRootElement),
                        $individualTool = $('.tool:not(.more, .read-later-bookmark, .read-later-list)', $root),
                        $socialToolsWrapper = $('.social-tools-wrapper', $root),
                        $socialToolsMoreBtn = $('.tool.more', $socialToolsWrapper),
                        $socialToolsAdditional = $('.social-tools-additional', $root),
                        width = window.innerWidth > 0 ? window.innerWidth : screen.width,
                        isMobile = mobile_browser === 1 && width < 480 ? true : false;

                    $socialToolsMoreBtn.off('click').on('click', this, function (ev) {
                        $socialToolsMoreBtn.hide();
                        $socialToolsAdditional.show('fast', function (ev) {
                            $root.addClass("expanded");
                            $('.social-tools', $socialToolsAdditional).animate({
                                "margin-left": 0
                            }, 4250);
                        }).addClass('more-open'); //end addtl show
                    }); //end more click
                    $individualTool.bind({
                        click: function click(event) {
                            //event.stopPropagation();
                            var shareType = $(this).attr('class');
                            shareType = typeof shareType != 'undefined' ? shareType.split(" ")[0].trim() : '';
                            self.trackTraffic('share.' + shareType, shareType + '_bar');
                        }
                    });
                    if (wp_pb && wp_pb.BrowserInfo && wp_pb.BrowserInfo.tablet) {
                        $root.addClass("tablet");
                    }
                    //vertical-sticky-top-sharebar has no mobile-view
                    if (TWPHead.mobile && $root.find('.vertical-sticky-top-sharebar').size() > 0) {
                        var calcMobileIcons = function calcMobileIcons() {
                            var width = $root.find('.social-tools-wrapper').width() - 5;
                            var shareIconWidth = Math.ceil($root.find('.social-tools-primary .social-tools .tool').first().outerWidth(true));
                            $root.find('.social-tools-primary .social-tools .tool.more').hide();
                            var allShare = $root.find('.social-tools-primary .social-tools .tool:not(.more), .social-tools-additional .social-tools .tool').hide();
                            if ($root.find('.social-tools-readlater').length > 0) {
                                width = width - Math.ceil($root.find('.social-tools-readlater').width());
                            }
                            var numShare = Math.floor(width / shareIconWidth);
                            for (var int = 0; int < allShare.length; int++) {
                                try {
                                    if (int < numShare) {
                                        $(allShare.get(int)).fadeIn();
                                    } else {
                                        $(allShare.get(int)).hide();
                                    }
                                } catch (e) {}
                            }
                        };
                        $(window).resize(function () {
                            calcMobileIcons();
                        });
                        calcMobileIcons();
                    } else {
                        $root.find('.social-tools-primary .social-tools .tool').fadeIn();
                    }
                    $root.removeClass("unprocessed");
                });
                if (typeof wp_pb.StaticMethods.initReadLater == 'function') {
                    wp_pb.StaticMethods.initReadLater($myRoot, 'top-share-bar');
                }
            },
            trackTraffic: function trackTraffic(name, eVar27) {
                if (typeof window.sendDataToOmniture === 'function') {
                    var omnitureVars = {
                        "eVar1": _typeof(window.s) == 'object' && s && s.eVar1,
                        "eVar2": _typeof(window.s) == 'object' && s && s.eVar2,
                        "eVar8": _typeof(window.s) == 'object' && s && s.eVar8,
                        "eVar17": _typeof(window.s) == 'object' && s && s.eVar17,
                        "eVar27": eVar27
                    };
                    try {
                        sendDataToOmniture(name, 'event6', omnitureVars);
                    } catch (e) {}
                }
            }
        };

        var stickyVerticalShareBar = {
            init: function init($myRoot) {
                $myRoot.closest('.pb-f-sharebars-top-share-bar').insertBefore('#pb-root');
                if (window.innerWidth > 992) {
                    //center vertically [+25px for half the header-v2]
                    $myRoot.css({ top: ($(window).height() - $myRoot.outerHeight() + 25) / 2 + 'px' });
                    $myRoot.animate({ left: '-1px' });
                    $(window).resize(function () {
                        $myRoot.animate({ top: ($(window).height() - $myRoot.outerHeight() + 25) / 2 + 'px' }, 50);
                    });
                }

                //handle content collision
                stickyVerticalShareBar.enableCollisionDetection($myRoot);
                wp_pb.register('sticky-vertical-sharebar', 'collides_with_main_content', function (collides) {
                    $myRoot.closest('.pb-f-sharebars-top-share-bar').css('opacity', collides ? '0' : '');
                });

                //handle magnet strip
                wp_pb.register('magnet', 'start_open', function () {
                    $myRoot.animate({ top: ($(window).height() - $myRoot.outerHeight() + $('.pb-f-page-magnet .pb-module-area').height() + 25) / 2 + 'px' }, 50);
                });
                wp_pb.register('magnet', 'start_close', function () {
                    $myRoot.animate({ top: ($(window).height() - $myRoot.outerHeight() + 25) / 2 + 'px' }, 50);
                });

                //handle left-side hamburger menu
                wp_pb.register('nav', 'menu_start_open', function () {
                    $myRoot.hide();
                    $myRoot.css('left', '-' + $myRoot.outerWidth() + 'px');
                });
                wp_pb.register('nav', 'menu_finish_close', function () {
                    if (window.innerWidth > 992) {
                        setTimeout(function () {
                            $myRoot.show();
                            $myRoot.animate({ left: '-1px' });
                        }, 100);
                    }
                });
            },
            enableCollisionDetection: function (supported) {
                var INTERVAL_MS = 600;
                var MAX_INTERVALS = 3;
                var intervalCount = 0;

                return function ($myRoot) {
                    var job;

                    if (!supported || intervalCount > MAX_INTERVALS) return;

                    job = setInterval(function () {
                        var $sb = $myRoot.closest('.pb-f-sharebars-top-share-bar');
                        var $sbw = $sb.find('.top-sharebar-wrapper');
                        var $mc = $('html').hasClass('gallery_story') ? $('.pb-f-gallery-gallery') : $('#main-content');
                        var oldcollides = $sb.data('__mccollides');
                        var newcollides = { 'value': undefined };

                        if (!$sb.length || !$sbw.length || !$mc.length) {
                            // kill interval since document no longer supports this feature
                            clearInterval(job);
                        } else {
                            newcollides.value = collision($mc[0], $sbw[0]);

                            if (!oldcollides || newcollides.value !== oldcollides.value) {
                                wp_pb.report('sticky-vertical-sharebar', 'collides_with_main_content', newcollides.value);
                                $sb.data('__mccollides', { 'value': newcollides.value });
                            }
                        }
                    }, INTERVAL_MS);

                    intervalCount++;

                    function collision(element1, element2) {
                        var rect1 = element1.getBoundingClientRect(),
                            rect2 = element2.getBoundingClientRect();

                        return !(rect1.top > rect2.bottom || rect1.right < rect2.left || rect1.bottom < rect2.top || rect1.left > rect2.right);
                    }
                };
            }('getBoundingClientRect' in document.documentElement)
        };

        var stickyHorizontalShareBar = {
            setElmTop: function setElmTop($sharebarElm, y) {
                var style = y ? 'translate3d(0px, ' + y + 'px, 0px)' : 'initial';
                $sharebarElm.css({
                    'transform': style
                });
            },
            navMenuToggle: function navMenuToggle($sharebarElm) {
                wp_pb.register('nav', 'finish_open', function () {
                    this.setElmTop($sharebarElm, 0);
                }, this);
                wp_pb.register('nav', 'finish_close', function () {
                    this.setElmTop($sharebarElm, -50);
                }, this);
                wp_pb.register('magnet', 'start_open', function () {
                    //this.setElmTop($sharebarElm, 115);
                }, this);
            },
            fixedPosition: function fixedPosition($sharebarElm, sharebarTop) {
                var currentTop = $(window).scrollTop();
                if (currentTop > sharebarTop) {
                    if (!$sharebarElm.hasClass('top-sharebar-fixed')) {
                        $sharebarElm.addClass('top-sharebar-fixed');
                        wp_pb.report('sticky-top-sharebar', 'sharebar_fixed', true);
                    }
                } else {
                    $sharebarElm.removeClass('top-sharebar-fixed');
                    wp_pb.report('sticky-top-sharebar', 'sharebar_unfixed', true);
                }

                if ($(".shareBar-follow-modal").css('display') == 'block') {
                    if ($('#wp-header').height() > 0) {
                        $(".shareBar-follow-modal").addClass('fixedModalNav').removeClass('fixedModal');
                    } else {
                        $(".shareBar-follow-modal").addClass('fixedModal').removeClass('fixedModalNav');
                    }
                }
            },
            moveOutOfRoot: function moveOutOfRoot($sharebarElm) {
                //This is hacky!! Have to move leaderboard and sharebar outside of pb-root if it has max-width.
                var $pbRoot = $('#pb-root');
                if ($pbRoot.css('max-width') !== 'none') {
                    var $sharebarRoot = $sharebarElm.parent();
                    var $leaderboard = $('.pb-f-ad-leaderboard');
                    $sharebarRoot.find('.sticky-top-sharebar').css('padding-top', '55px');
                    $pbRoot.before($sharebarRoot);
                    $pbRoot.before($leaderboard);
                }
            },
            detectMobileForSMS: function detectMobileForSMS() {
                if (mobile_browser) {
                    var shareString = '';
                    if (windows_browser) {
                        shareString = 'sms://?body=';
                    } else if (android_browser || android233_browser) {
                        shareString = 'sms:?body=';
                    }

                    if (shareString.length > 0) {
                        $('.pb-f-sharebars-top-share-bar .sms-share-device.unprocessed').each(function () {
                            $(this).attr('onclick', $(this).attr('onclick').replace(/sms:\?&body=/g, shareString));
                            $(this).removeClass('unprocessed');
                        });
                    } else {
                        //iOS is used as default and does not require change
                        $('.pb-f-sharebars-top-share-bar .sms-share-device.unprocessed').removeClass('unprocessed');
                    }
                }
            },
            init: function init() {
                var $sharebarElm = $('.sticky-top-sharebar'),
                    self = this;
                if (!$sharebarElm.length) return;
                this.moveOutOfRoot($sharebarElm);
                var sharebarTop = $sharebarElm.offset().top;
                var $header = $('#wp-header');
                if ($header.css('position') === 'fixed' && $(window).scrollTop() > sharebarTop) {
                    this.fixedPosition($sharebarElm, sharebarTop);
                }
                $(window).off('scroll.sharebar').on('scroll.sharebar', function () {
                    self.fixedPosition($sharebarElm, sharebarTop);
                });
                $(document).ready(function () {
                    self.navMenuToggle($sharebarElm);
                });

                this.detectMobileForSMS();
            }
        };

        var userId = document.cookie.match(/wapo_login_id=([^;]+)/) ? RegExp.$1 : '';
        var userSecureId = document.cookie.match(/wapo_secure_login_id=([^;]+)/) ? RegExp.$1 : '';
        var userAgent = navigator.userAgent;

        var follow = {

            init: function init() {

                var userSignedIn = userId !== '' ? true : false,
                    userApiUrl = "",
                    jsonData = {},
                    getUserData = true,
                    followed = []; // Check which categories are followed

                $("#shareBar-follow").removeClass('hide');

                // Get user data
                if (userSignedIn) {
                    userApiUrl = "https://follow.washingtonpost.com/Follow/api/user";
                    jsonData = {
                        washPostId: userId,
                        wapoLoginID: userId,
                        wapoSecureID: userSecureId,
                        userAgent: userAgent
                    };
                } else if (localStorage.getItem('wp_follow_modal_email')) {
                    userApiUrl = "https://follow.washingtonpost.com/Follow/api/anonymous-user"; // TO DO change
                    jsonData = {
                        emailId: localStorage.getItem('wp_follow_modal_email')
                    };
                } else {
                    getUserData = false; // Unanimous user, no data to fetch
                }

                if (getUserData) {

                    $.ajax({
                        type: 'POST',
                        url: userApiUrl,
                        contentType: 'application/json',
                        dataType: 'json',
                        data: JSON.stringify(jsonData),
                        success: function success(data) {
                            if (data.emailId) {
                                localStorage.setItem('wp_follow_modal_email', data.emailId);
                            }

                            if (data.tags) {
                                for (var i = 0, len = data.tags.length; i < len; i++) {
                                    if (data.tags[i].type === 'category') {
                                        followed.push(data.tags[i].slug);
                                    }
                                }
                            }

                            if (followed.indexOf($("#subtitle-follow").data('categorySlug')) >= 0) {
                                $("#shareBar-follow").addClass('following');
                                $("#shareBar-follow .followLbl").text('Following');
                            }
                        }
                    });
                }

                // Click follow button
                $("#shareBar-follow").on('click', function () {
                    var $this = $(this);
                    var endpoint = $this.hasClass('following') ? 'unfollow' : 'follow',
                        categorySlug = $this.data('categorySlug'),
                        categoryTitle = $this.data('categoryTitle'),
                        position = {};

                    position.top = 55;
                    position.left = 650;

                    function applyCallBack(data) {
                        // change button text
                        if (endpoint === 'follow') $this.addClass('following').find('.followLbl').text('Following');else $this.removeClass('following').find('.followLbl').text('Follow');

                        // send omniture events
                        if (endpoint === 'follow') {
                            s.sendDataToOmniture('Follow', 'event103', {
                                eVar1: s.eVar1,
                                eVar2: s.eVar2,
                                eVar26: 'fl_sharebar_topic_' + categorySlug.replace(/-/g, '')
                            });
                        } else {
                            s.sendDataToOmniture('Unfollow', 'event104', {
                                eVar1: s.eVar1,
                                eVar2: s.eVar2,
                                eVar26: 'fl_sharebar_topic_' + categorySlug.replace(/-/g, '')
                            });
                        }
                    }

                    var data = {
                        categorySlug: categorySlug,
                        categoryTitle: categoryTitle,
                        signedIn: userSignedIn,
                        endpoint: endpoint,
                        callBack: applyCallBack
                    };

                    // Follow
                    if (endpoint === 'follow') {
                        data.position = position;

                        if (localStorage.getItem('wp_follow_modal_seen') !== 'true' || !localStorage.getItem('wp_follow_modal_email')) {
                            var tagData = {
                                "tag": {
                                    "slug": categorySlug,
                                    "type": "category"
                                }
                            };

                            // Get pip description: TO DO this will be moved to site service later
                            $.ajax({
                                type: 'POST',
                                url: "https://follow.washingtonpost.com/Follow/api/tag",
                                contentType: 'application/json',
                                dataType: 'json',
                                data: JSON.stringify(tagData),
                                success: function success(result) {
                                    data.categoryDesc = result.tag.description;
                                    follow.displayPip(data);
                                },
                                error: function error(reason) {
                                    follow.displayPip(data);
                                }
                            });
                        } else {
                            data.email = localStorage.getItem('wp_follow_modal_email');

                            follow.followApi(data);
                        }
                    } else {
                        // Unfollow
                        follow.unfollowApi(data);
                    }

                    return false;
                });

                if (typeof Hammer === 'function' && wp_pb.BrowserInfo.mobile_browser) {
                    try {
                        var hammertime = new Hammer($('#shareBar-follow')[0], {
                            prevent_mouseevents: true
                        });
                        hammertime.on("tap", handleTap);
                    } catch (err) {}
                }

                /* hammer.js tap */

                function handleTap(ev) {
                    ev.gesture.preventDefault();
                    ev.gesture.stopPropagation();
                    $(ev.gesture.target).click();
                    $(ev.gesture.target).blur();
                }
            },

            displayPip: function displayPip(data) {

                var modal = $('.shareBar-follow-modal');

                if (data.signedIn === false) {
                    modal.find('.not-signed-In.before').removeClass('hide');
                    modal.find('.not-signed-In.after').addClass('hide');
                    modal.find('.signed-In').addClass('hide');

                    if (localStorage.getItem('wp_follow_modal_email')) {
                        modal.find('#follow-modal-input').val(localStorage.getItem('wp_follow_modal_email'));
                    }
                } else {
                    modal.find('.not-signed-In').addClass('hide');
                    modal.find('.signed-In').removeClass('hide');

                    data.position.top += 20;
                }

                modal.find('.category-desc').text(data.categoryDesc ? data.categoryDesc : "");

                // set correct position
                modal.css('top', data.position.top);
                modal.css('left', data.position.left);

                if ($('#wp-header').css('position') === 'fixed') {
                    if ($('#wp-header').height() > 0) {
                        modal.addClass('fixedModalNav');
                    } else {
                        modal.addClass('fixedModal');
                    }
                }

                modal.jqm({
                    overlayClass: 'sharebar-follow-modal',
                    overlay: 0,
                    onHide: function onHide(hash) {
                        modal.find('.sign-up').off('click');
                        modal.find('.follow-modal-close').off('click');
                        modal.find('.got-it').off('click');

                        hash.w.hide() && hash.o && hash.o.remove();
                        return true;
                    }
                });

                // Close modal
                modal.find('.sign-up').click(function () {
                    var email = modal.find('#follow-modal-input').val();
                    var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;

                    if (email === '' || !re.test(email)) {
                        $(".invalid-email").show();
                    } else {
                        $(".invalid-email").hide();
                        data.email = email;

                        localStorage.setItem('wp_follow_modal_email', email);

                        follow.followApi(data, function () {
                            modal.find('.not-signed-In.before').addClass('hide');
                            modal.find('.not-signed-In.after').removeClass('hide');
                        });
                    }
                });

                modal.find('.follow-modal-close').click(function () {
                    modal.jqmHide();
                });

                modal.find('.got-it').click(function () {
                    modal.jqmHide();
                });

                if (data.signedIn) {
                    follow.followApi(data, function () {
                        if (localStorage.getItem('wp_follow_modal_seen') !== 'true') {
                            modal.jqmShow();
                            localStorage.setItem('wp_follow_modal_seen', 'true');
                        }
                    });
                } else {
                    if (localStorage.getItem('wp_follow_modal_seen') !== 'true' || !localStorage.getItem('wp_follow_modal_email')) {

                        modal.jqmShow();

                        s.sendDataToOmniture('Follow', 'event101', {
                            eVar1: s.eVar1,
                            eVar2: s.eVar2,
                            eVar26: 'fl_sharebar_topic_' + data.categorySlug.replace(/-/g, '')
                        });

                        localStorage.setItem('wp_follow_modal_seen', 'true');
                    } else {
                        data.email = localStorage.getItem('wp_follow_modal_email');

                        follow.followApi(data);
                    }
                }
            },

            followApi: function followApi(data, callBack) {
                var serviceBase = "https://follow.washingtonpost.com",
                    jsonData = {
                    washPostId: userId,
                    tags: []
                };

                // user is not signed in
                if (data.email && data.signedIn === false) {
                    serviceBase += "/Follow/api/anonymous-follow";

                    jsonData.emailId = data.email;

                    jsonData.tags = [{
                        slug: data.categorySlug,
                        type: 'category'
                    }];
                } else {
                    serviceBase += "/Follow/api/follow";

                    jsonData.tags = [{
                        slug: data.categorySlug,
                        title: data.categoryTitle,
                        level: 1,
                        type: 'category'
                    }];
                }

                $.ajax({
                    type: 'POST',
                    url: serviceBase,
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(jsonData),
                    success: function success(result) {
                        if (result.status === true) {
                            data.callBack(data);
                            if (callBack) {
                                callBack();
                            }
                        }
                    }
                });
            },

            unfollowApi: function unfollowApi(data) {
                var serviceBase = "https://follow.washingtonpost.com";

                var tags = [{
                    slug: data.categorySlug,
                    title: data.categoryTitle,
                    level: 1,
                    type: 'category'
                }];

                var jsonData = {
                    washPostId: userId,
                    wapoLoginID: userId,
                    wapoSecureID: userSecureId,
                    userAgent: userAgent,
                    tags: tags
                };

                if (data.signedIn) {
                    serviceBase += "/Follow/api/unfollow";
                } else {
                    serviceBase += "/Follow/api/anonymous-unfollow";
                    jsonData.emailId = localStorage.getItem('wp_follow_modal_email');
                }

                $.ajax({
                    type: 'POST',
                    url: serviceBase,
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(jsonData),
                    success: function success(responce) {
                        if (responce.status === true && data.callBack) data.callBack(responce);
                    }
                });
            },

            localStorageAvailable: function localStorageAvailable() {
                var test = 'test';
                try {
                    localStorage.setItem(test, test);
                    localStorage.removeItem(test);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        };

        /**
         * Utilities START
         * Note: Same code in sharebars\utlity-bar
         */
        var textResizer = {
            currIncrementMax: 9,
            currIncrementUnit: 2,
            currIncrementIndex: 0,
            init: function init(myRoot, resizeableElementList, clickElement) {
                myRoot = myRoot || '#article-body article, .related-story, .liveblog-intro, #liveblog-story-list .description, #full-recipe .article-content';
                resizeableElementList = resizeableElementList || 'p, li';
                clickElement = clickElement || '.tool.textresizer';
                this.root = $(myRoot);
                this.resizeableElements = $(resizeableElementList, this.root);

                // add "Next up" lable to the resizable element's list
                if ($(".related-story").prev('h3').length > 0) {
                    this.resizeableElements.push($('.related-story').prev('h3'));
                    this.resizeableElements.push($('.related-story h4 a'));
                }
                $(clickElement).on('click', this, this.resize);
            },
            resize: function resize(event) {
                var currObj = event.data;
                if (currObj.currIncrementIndex == currObj.currIncrementMax) {
                    currObj.currIncrementIndex = 0;
                    currObj.currIncrementUnit = currObj.currIncrementUnit == 2 ? -2 : 2;
                }
                currObj.currIncrementIndex = currObj.currIncrementIndex + 1;
                currObj.resizeableElements.each(function () {
                    elm = $(this);
                    currSize = parseFloat(elm.css('font-size'), 5);
                    var result = currSize + currObj.currIncrementUnit;
                    elm.css('font-size', result);
                    wp_pb.report('textresizer', 'resized', result);
                });
            }
        };

        var trackTraffic = function trackTraffic(name) {
            if (typeof window.sendDataToOmniture === 'function') {
                var omnitureVars = {
                    "eVar1": _typeof(window.s) == 'object' && s && s.eVar1,
                    "eVar2": _typeof(window.s) == 'object' && s && s.eVar2,
                    "eVar8": _typeof(window.s) == 'object' && s && s.eVar8,
                    "eVar17": _typeof(window.s) == 'object' && s && s.eVar17,
                    "eVar27": name
                };
                try {
                    sendDataToOmniture(name + '.click', 'event6', omnitureVars);
                } catch (e) {}
            }
        };
        $('.social-tools-wrapper .tool.textresizer, .social-tools-wrapper .tool.print').bind('click', function () {
            var name = $(this).attr('class').split(" ")[0].trim();
            trackTraffic(name);
        });

        /**
         * Utilities END
         */

        // Turn off the experience

        // $(window.document).on('abtest-ready', function(e, ABT) {

        //     var test = ABT.get('follow-powerPostTop');

        //     if (test.is('sharebar')) {
        //         follow.init();
        //     }
        // });

        /*
         * POPOUT code for later var $article = $('#article-topper'); // START:
         * Social share pop-out var $socialToolsMoreBtn = $('.social-tools
         * .more',$article), $socialToolsPopOut =
         * $('.social-tools.pop-out',$article) ;
         * $socialToolsMoreBtn.on('click',function(ev){ var targetTop =
         * $socialToolsMoreBtn.position().top +
         * $socialToolsMoreBtn.outerHeight()-1-14; var targetLeft =
         * $socialToolsMoreBtn.position().left-1-3;
         * $socialToolsPopOut.css({"top":targetTop,"left":targetLeft});
         * $socialToolsPopOut.toggle(); });
         * $socialToolsPopOut.on('mouseout',function(ev){
         * $socialToolsPopOut.toggle(); }); // END: Social share pop-out
         */

        window.TWP = TWP || {};
        TWP.SocialTools = TWP.SocialTools || socialTools;
        TWP.SocialTools.init();

        TWP.TextResizer = TWP.TextResizer || textResizer;
        TWP.TextResizer.init();

        var tablet = isMobile.tablet();

        window.VisitorSegment && VisitorSegment('tablet', function () {
            return tablet && $(window).width() > 768;
        });
    } catch (err) {}
})();

},{}],5:[function(require,module,exports){
'use strict';

var iframe = require('./iframe.js');
var twitterFollowButtonModules = require('./twitter-follow.js');
var pbHeaderModule = require('./pbHeader.js');
var pbSocialTools = require('./pbSocialTools.js');

//Adds the return url to the subscribe action
var setupSubscribeBtn = function setupSubscribeBtn() {
	var $subscribe = $('#nav-subscribe'),
	    href = $subscribe.attr('href'),
	    pageLocation = window.encodeURI(window.location.href);
	$subscribe.attr('href', href + pageLocation);
};
//Drop in your init file
setupSubscribeBtn();

},{"./iframe.js":2,"./pbHeader.js":3,"./pbSocialTools.js":4,"./twitter-follow.js":6}],6:[function(require,module,exports){
"use strict";

window.twttr = function (d, s, id) {
  var t,
      js,
      fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);
  return window.twttr || (t = { _e: [], ready: function ready(f) {
      t._e.push(f);
    } });
}(document, "script", "twitter-wjs");

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYmFzZS5qcyIsInNyYy9qcy9wZy10ZW1wbGF0ZS9pZnJhbWUuanMiLCJzcmMvanMvcGctdGVtcGxhdGUvcGJIZWFkZXIuanMiLCJzcmMvanMvcGctdGVtcGxhdGUvcGJTb2NpYWxUb29scy5qcyIsInNyYy9qcy9wZy10ZW1wbGF0ZS9wb3N0R3JhcGhpY3NUZW1wbGF0ZS5qcyIsInNyYy9qcy9wZy10ZW1wbGF0ZS90d2l0dGVyLWZvbGxvdy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSx1QkFBdUIsUUFBUSx1Q0FBUixDQUEzQjs7Ozs7QUNBQyxhQUFXOztBQUVSO0FBQ0EsUUFBSSxPQUFPLEVBQVg7O0FBRUE7QUFDQSxXQUFPLEdBQVAsR0FBYSxPQUFPLEdBQVAsSUFBYztBQUN2QixnQkFBUTtBQURlLEtBQTNCO0FBR0EsV0FBTyxHQUFQLENBQVcsTUFBWCxHQUFvQixPQUFPLEdBQVAsQ0FBVyxNQUFYLElBQXFCLEVBQXpDO0FBQ0EsV0FBTyxHQUFQLENBQVcsTUFBWCxDQUFrQixJQUFsQixHQUF5QixJQUF6Qjs7QUFFQSxRQUFJLENBQUMsS0FBSyxhQUFOLElBQXVCLE9BQU8sS0FBSyxhQUFaLEtBQThCLFdBQXpELEVBQXFFO0FBQ2pFLGFBQUssYUFBTCxHQUFxQixVQUFTLEdBQVQsRUFBYTtBQUM5QixnQkFBSSxZQUFZLEVBQWhCO0FBQUEsZ0JBQ0ksU0FBUyxFQURiO0FBQUEsZ0JBRUksT0FGSjtBQUFBLGdCQUdJLEdBSEo7QUFJQSxnQkFBSSxHQUFKLEVBQVM7QUFDTCxvQkFBSSxJQUFJLE9BQUosQ0FBWSxHQUFaLE1BQXFCLENBQUMsQ0FBMUIsRUFBNkI7QUFDekIsZ0NBQVksSUFBSSxLQUFKLENBQVUsR0FBVixFQUFlLENBQWYsQ0FBWjtBQUNBLHdCQUFJLFNBQUosRUFBZTtBQUNYLDRCQUFJLFVBQVUsT0FBVixDQUFrQixHQUFs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QUFRLFdBQVcsSUFBWCxDQUFnQixNQUFoQixDQURUO0FBQUEsS0FFQyxlQUFlLE9BQU8sU0FBUCxDQUFpQixPQUFPLFFBQVAsQ0FBZ0IsSUFBakMsQ0FGaEI7QUFHQyxZQUFXLElBQVgsQ0FBZ0IsTUFBaEIsRUFBd0IsT0FBTyxZQUEvQjtBQUNELENBTEQ7QUFNQTtBQUNBOzs7OztBQ2JBLE9BQU8sS0FBUCxHQUFnQixVQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLEVBQWhCLEVBQW9CO0FBQ2xDLE1BQUksQ0FBSjtBQUFBLE1BQU8sRUFBUDtBQUFBLE1BQVcsTUFBTSxFQUFFLG9CQUFGLENBQXVCLENBQXZCLEVBQTBCLENBQTFCLENBQWpCO0FBQ0EsTUFBSSxFQUFFLGNBQUYsQ0FBaUIsRUFBakIsQ0FBSixFQUEwQjtBQUMxQixPQUFLLEVBQUUsYUFBRixDQUFnQixDQUFoQixDQUFMLENBQXlCLEdBQUcsRUFBSCxHQUFRLEVBQVI7QUFDekIsS0FBRyxHQUFILEdBQVEseUNBQVI7QUFDQSxNQUFJLFVBQUosQ0FBZSxZQUFmLENBQTRCLEVBQTVCLEVBQWdDLEdBQWhDO0FBQ0EsU0FBTyxPQUFPLEtBQVAsS0FBaUIsSUFBSSxFQUFFLElBQUksRUFBTixFQUFVLE9BQU8sZUFBVSxDQUFWLEVBQWE7QUFBRSxRQUFFLEVBQUYsQ0FBSyxJQUFMLENBQVUsQ0FBVjtBQUFjLEtBQTlDLEVBQXJCLENBQVA7QUFDRCxDQVBlLENBT2QsUUFQYyxFQU9KLFFBUEksRUFPTSxhQVBOLENBQWhCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBwb3N0R3JhcGhpY3NUZW1wbGF0ZSA9IHJlcXVpcmUoJy4vcGctdGVtcGxhdGUvcG9zdEdyYXBoaWNzVGVtcGxhdGUuanMnKTtcblxuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gQWxsIHV0aWxpdHkgZnVuY3Rpb25zIHNob3VsZCBhdHRhY2ggdGhlbXNlbHZlcyB0byB0aGlzIG9iamVjdC5cbiAgICB2YXIgdXRpbCA9IHt9O1xuXG4gICAgLy8gVGhpcyBjb2RlIGFzc3VtZXMgaXQgaXMgcnVubmluZyBpbiBhIGJyb3dzZXIgY29udGV4dFxuICAgIHdpbmRvdy5UV1AgPSB3aW5kb3cuVFdQIHx8IHtcbiAgICAgICAgTW9kdWxlOiB7fVxuICAgIH07XG4gICAgd2luZG93LlRXUC5Nb2R1bGUgPSB3aW5kb3cuVFdQLk1vZHVsZSB8fCB7fTtcbiAgICB3aW5kb3cuVFdQLk1vZHVsZS51dGlsID0gdXRpbDtcblxuICAgIGlmICghdXRpbC5nZXRQYXJhbWV0ZXJzIHx8IHR5cGVvZiB1dGlsLmdldFBhcmFtZXRlcnMgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgdXRpbC5nZXRQYXJhbWV0ZXJzID0gZnVuY3Rpb24odXJsKXtcbiAgICAgICAgICAgIHZhciBwYXJhbUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSB7fSxcbiAgICAgICAgICAgICAgICBrdlBhaXJzLFxuICAgICAgICAgICAgICAgIHRtcDtcbiAgICAgICAgICAgIGlmICh1cmwpIHtcbiAgICAgICAgICAgICAgICBpZiAodXJsLmluZGV4T2YoJz8nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1MaXN0ID0gdXJsLnNwbGl0KCc/JylbMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbUxpc3QuaW5kZXhPZignJicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga3ZQYWlycyA9IHBhcmFtTGlzdC5zcGxpdCgnJicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrdlBhaXJzID0gW3BhcmFtTGlzdF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBhID0gMDsgYSA8IGt2UGFpcnMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoa3ZQYWlyc1thXS5pbmRleE9mKCc9JykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcCA9IGt2UGFpcnNbYV0uc3BsaXQoJz0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW3RtcFswXV0gPSB1bmVzY2FwZSh0bXBbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBoZWlnaHQgb2YgdGhlIGlmcmFtZSBpZiB0aGlzIHBhZ2UgaXMgaWZyYW1lJ2QuXG4gICAgLy8gTk9URTogVGhpcyAqKnJlcXVpcmVzKiogdGhlIGlmcmFtZSdzIHNyYyBwcm9wZXJ0eSB0byB1c2UgYSBsb2NhdGlvblxuICAgIC8vIHdpdGhvdXQgaXRzIHByb3RvY29sLiBVc2luZyBhIHByb3RvY29sIHdpbGwgbm90IHdvcmsuXG4gICAgLy9cbiAgICAvLyBlLmcuIDxpZnJhbWUgZnJhbWVib3JkZXI9XCIwXCIgc2Nyb2xsaW5nPVwibm9cIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBoZWlnaHQ6NjAwcHg7XCIgc3JjPVwiLy93d3cud2FzaGluZ3RvbnBvc3QuY29tL2dyYXBoaWNzL25hdGlvbmFsL2NlbnN1cy1jb21tdXRlLW1hcC8/dGVtcGxhdGU9aWZyYW1lXCI+PC9pZnJhbWU+XG4gICAgdXRpbC5jaGFuZ2VJZnJhbWVIZWlnaHQgPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyBMb2NhdGlvbiAqd2l0aG91dCogcHJvdG9jb2wgYW5kIHNlYXJjaCBwYXJhbWV0ZXJzXG4gICAgICAgIHZhciBwYXJ0aWFsTG9jYXRpb24gPSAod2luZG93LmxvY2F0aW9uLm9yaWdpbi5yZXBsYWNlKHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCwgJycpKSArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcblxuICAgICAgICAvLyBCdWlsZCB1cCBhIHNlcmllcyBvZiBwb3NzaWJsZSBDU1Mgc2VsZWN0b3Igc3RyaW5nc1xuICAgICAgICB2YXIgc2VsZWN0b3JzID0gW107XG5cbiAgICAgICAgLy8gQWRkIHRoZSBVUkwgYXMgaXQgaXMgKGFkZGluZyBpbiB0aGUgc2VhcmNoIHBhcmFtZXRlcnMpXG4gICAgICAgIHNlbGVjdG9ycy5wdXNoKCdpZnJhbWVbc3JjPVwiJyArIHBhcnRpYWxMb2NhdGlvbiArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKyAnXCJdJyk7XG5cbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZVt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGVuZ3RoIC0gMV0gPT09ICcvJykge1xuICAgICAgICAgICAgLy8gSWYgdGhlIFVSTCBoYXMgYSB0cmFpbGluZyBzbGFzaCwgYWRkIGEgdmVyc2lvbiB3aXRob3V0IGl0XG4gICAgICAgICAgICAvLyAoYWRkaW5nIGluIHRoZSBzZWFyY2ggcGFyYW1ldGVycylcbiAgICAgICAgICAgIHNlbGVjdG9ycy5wdXNoKCdpZnJhbWVbc3JjPVwiJyArIChwYXJ0aWFsTG9jYXRpb24uc2xpY2UoMCwgLTEpICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCkgKyAnXCJdJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgVVJMIGRvZXMgKm5vdCogaGF2ZSBhIHRyYWlsaW5nIHNsYXNoLCBhZGQgYSB2ZXJzaW9uIHdpdGhcbiAgICAgICAgICAgIC8vIGl0IChhZGRpbmcgaW4gdGhlIHNlYXJjaCBwYXJhbWV0ZXJzKVxuICAgICAgICAgICAgc2VsZWN0b3JzLnB1c2goJ2lmcmFtZVtzcmM9XCInICsgcGFydGlhbExvY2F0aW9uICsgJy8nICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCArICdcIl0nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNlYXJjaCBmb3IgdGhvc2Ugc2VsZWN0b3JzIGluIHRoZSBwYXJlbnQgcGFnZSwgYW5kIGFkanVzdCB0aGUgaGVpZ2h0XG4gICAgICAgIC8vIGFjY29yZGluZ2x5LlxuICAgICAgICB2YXIgJGlmcmFtZSA9ICQod2luZG93LnRvcC5kb2N1bWVudCkuZmluZChzZWxlY3RvcnMuam9pbignLCcpKTtcbiAgICAgICAgdmFyIGggPSAkKCdib2R5Jykub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgICAgICRpZnJhbWUuY3NzKHsnaGVpZ2h0JyA6IGggKyAncHgnfSk7XG4gICAgfTtcblxuICAgIC8vIGZyb20gaHR0cDovL2Rhdmlkd2Fsc2gubmFtZS9qYXZhc2NyaXB0LWRlYm91bmNlLWZ1bmN0aW9uXG4gICAgdXRpbC5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgICAgICB2YXIgdGltZW91dDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKCFpbW1lZGlhdGUpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICAgICAgICBpZiAoY2FsbE5vdykgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGlmcmFtZSBjb2RlXG4gICAgICAgIHZhciBwYXJhbXMgPSB1dGlsLmdldFBhcmFtZXRlcnMoZG9jdW1lbnQuVVJMKTtcbiAgICAgICAgaWYgKHBhcmFtc1sndGVtcGxhdGUnXSAmJiBwYXJhbXNbJ3RlbXBsYXRlJ10gPT09ICdpZnJhbWUnKSB7XG4gICAgICAgICAgICAvLyBUT0RPIFdoeSBkbyB3ZSBuZWVkIHRoaXM/IE5vYm9keSBrbm93cy5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZG9tYWluID0gJ3dhc2hpbmd0b25wb3N0LmNvbSc7XG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdpZnJhbWUnKS5zaG93KCkuY3NzKCdkaXNwbGF5JywnYmxvY2snKTtcbiAgICAgICAgICAgIGlmIChwYXJhbXNbJ2dyYXBoaWNfaWQnXSl7XG4gICAgICAgICAgICAgICAgJCgnIycgKyBwYXJhbXNbJ2dyYXBoaWNfaWQnXSkuc2libGluZ3MoKS5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkKCcjcGdjb250ZW50LCAucGdBcnRpY2xlJykuc2libGluZ3MoKS5oaWRlKCk7XG5cbiAgICAgICAgICAgIC8vIENPUlMgbGltaXRhdGlvbnNcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PT0gd2luZG93LnRvcC5sb2NhdGlvbi5ob3N0bmFtZSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXNpemVJZnJhbWUgPSB1dGlsLmRlYm91bmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5jaGFuZ2VJZnJhbWVIZWlnaHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjUwKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyByZXNwb25zaXZlIHBhcnRcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBXaHkgMTAwMG1zPyBUaGlzIGlzIG5vdCByZWxpYWJsZS5cbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlsLmNoYW5nZUlmcmFtZUhlaWdodCgpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIHJlc2l6ZUlmcmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxufS5jYWxsKHRoaXMpKTtcbiIsIihmdW5jdGlvbiAoJCwgd2luZG93KSB7XG5cbiAgICB2YXIgY29yZSA9IHdpbmRvdy53cF9wYiA9IHdpbmRvdy53cF9wYiB8fCB7fTtcbiAgICB2YXIgbmF2ID0gY29yZS5uYXYgPSBjb3JlLm5hdiB8fCB7fTtcblxuICAgIHZhciB3cEhlYWRlciA9IHtcblxuXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvLyBoaWRlIG5hdiBvbiBJRSA4IGJyb3dzZXJzXG4gICAgICAgICAgICBpZigkKCcjcGFnZScpLmhhc0NsYXNzKCdpZTgnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICogTW92ZSBoZWFkZXIgZmVhdHVyZSBvdXRzaWRlIG9mIHBiLWNvbnRhaW5lciBcbiAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiggJChcIiNwYi1yb290IC5wYi1mLXBhZ2UtaGVhZGVyLXYyXCIpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRoZWFkZXIgPSAkKFwiLnBiLWYtcGFnZS1oZWFkZXItdjJcIik7XG4gICAgICAgICAgICAgICAgICAgICQoXCIjcGItcm9vdFwiKS5iZWZvcmUoICRoZWFkZXIgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIERldGVjdCBJRSBicm93c2VycywgYWRkIGNsYXNzZXNcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAod2luZG93LkFjdGl2ZVhPYmplY3QgfHwgXCJBY3RpdmVYT2JqZWN0XCIgaW4gd2luZG93KSB7XG4gICAgICAgICAgICAgICAgICAkKFwiI21haW4tc2VjdGlvbnMtbmF2XCIpLmFkZENsYXNzKFwiaWVcIik7XG4gICAgICAgICAgICAgICAgICAkKFwiI3dwLWhlYWRlclwiKS5hZGRDbGFzcyhcImllXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICogTmF2IG1lbnUgaXRlbXMgY2xpY2sgdHJhY2tpbmcgY29kZVxuICAgICAgICAgICAgICAgICAqICAgLSBsZWZ0IG5hdiBpdGVtcyBmb3JtYXR0OiBtZW51X25hdl97e25hdi1tZW51LWl0ZW0tbmFtZX19XG4gICAgICAgICAgICAgICAgICogICAtIHRvcCBuYXYgaXRlbXMgZm9ybWF0dDogIHRvcF9uYXZfe3tuYXYtbWVudS1pdGVtLW5hbWV9fVxuICAgICAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAgICAgLy8gbGVmdCBuYXZcbiAgICAgICAgICAgICAgICAkKFwiI3NlY3Rpb25zLW1lbnUtb2ZmLWNhbnZhcyB1bC5zaWRlLW5hdiBsaVwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcygnbmF2LXNjcmVlbnJlYWRlci1saW5rJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9ICQodGhpcykuZmluZCgnPmEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVRleHQgPSBpdGVtLmh0bWwoKS5yZXBsYWNlKC9cXHMrL2csICcnKS5yZXBsYWNlKC9cXCYvZywnLScpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1MaW5rID0gaXRlbS5hdHRyKCdocmVmJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoJCh0aGlzKS5oYXNDbGFzcygnbWFpbi1uYXYnKSkgeyAvLyBtYWluIG5hdiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmF0dHIoJ2hyZWYnLCBpdGVtTGluayArIFwiP25pZD1tZW51X25hdl9cIisgaXRlbVRleHQgICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoJCh0aGlzKS5oYXNDbGFzcygnc3ViLW5hdi1pdGVtJykpIHsgLy8gc3ViIG5hdiBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFpbkl0ZW0gPSQodGhpcykucGFyZW50cygnLm1haW4tbmF2JykuZmluZCgnPmEnKS50ZXh0KCkucmVwbGFjZSgvXFxzKy9nLCAnJykucmVwbGFjZSgvXFwmL2csJy0nKS50b0xvd2VyQ2FzZSgpIDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uYXR0cignaHJlZicsIGl0ZW1MaW5rICsgXCI/bmlkPW1lbnVfbmF2X1wiKyBtYWluSXRlbSArJy0nKyBpdGVtVGV4dCApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyB0b3AgbmF2XG4gICAgICAgICAgICAgICAgJChcIiNzZWN0aW9ucy1tZW51LXdpZGUgbGlcIikuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gJCh0aGlzKS5maW5kKCdhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1UZXh0ID0gaXRlbS5odG1sKCkucmVwbGFjZSgvXFxzKy9nLCAnJykucmVwbGFjZSgvXFwmL2csJy0nKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtTGluayA9IGl0ZW0uYXR0cignaHJlZicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5hdHRyKCdocmVmJywgaXRlbUxpbmsgKyBcIj9uaWQ9dG9wX25hdl9cIisgaXRlbVRleHQpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FTkQgaXRlbXMgY2xpY2sgdHJhY2tpbmctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBcbiAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAqIFNlYXJjaCBmaWVsZCBhbmQgYnV0dG9uIGZ1bmN0aW9uYWxpdHlcbiAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VhcmNoSWNvbkhvdmVyZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2VhcmNoIGZpZWxkIGFuZCBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgJCgnI3NlYXJjaC1idG4nKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKCdjbG9zZWQnKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnY2xvc2VkJykuYWRkQ2xhc3MoJ29wZW5lZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2gtZmllbGQnKS5yZW1vdmVDbGFzcygnY2xvc2VkJykuYWRkQ2xhc3MoJ29wZW5lZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2gtZmllbGQnKS5mb2N1cygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoJCh0aGlzKS5oYXNDbGFzcygnb3BlbmVkJykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjc2VhcmNoLWZvcm1cIikuc3VibWl0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIjc2VhcmNoLWJ0blwiKS5iaW5kKFwibW91c2VvdmVyXCIsZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKCdvcGVuZWQnKSkgIHNlYXJjaEljb25Ib3ZlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSkuYmluZChcIm1vdXNlb3V0XCIsZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKCdvcGVuZWQnKSkgIHNlYXJjaEljb25Ib3ZlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2gtZmllbGQnKS5ibHVyKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKCdvcGVuZWQnKSAmJiAhc2VhcmNoSWNvbkhvdmVyZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ29wZW5lZCcpLmFkZENsYXNzKCdjbG9zZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoLWJ0bicpLnJlbW92ZUNsYXNzKCdvcGVuZWQnKS5hZGRDbGFzcygnY2xvc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoXCIjc2VhcmNoLWZvcm0sICNuYXYtc2VhcmNoLW1vYmlsZVwiKS5zdWJtaXQoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKCQodGhpcykuZmluZCgnaW5wdXRbdHlwZT10ZXh0XScpLnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICBzLnNlbmREYXRhVG9PbW5pdHVyZSgnU2VhcmNoIFN1Ym1pdCcsJ2V2ZW50MicseydlVmFyMzgnOiQodGhpcykuZmluZCgnaW5wdXRbdHlwZT10ZXh0XScpLnZhbCgpLCdlVmFyMSc6cy5wYWdlTmFtZX0pO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2goZSkge31cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFbmQgU2VhcmNoIGZpZWxkIGFuZCBidXR0b24gZnVuY3Rpb25hbGl0eSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgKiBMaXN0IGl0ZW1zIGhvdmVyIGV2ZW50cyAmIHN0eWxlc1xuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVXNlciBzdHN0dXMgYnV0dG9ucyBob3ZlcnNcbiAgICAgICAgICAgICAgICAgICAgJChcIiNsb2dnZWQtaW4tc3RhdHVzIC5uYXYtc2lnbi1pblwiKS5ob3ZlcihmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjbmF2LXN1YnNjcmliZScpLmFkZENsYXNzKCdzaWduSW4taG92ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI25hdi1zdWJzY3JpYmUnKS5yZW1vdmVDbGFzcygnc2lnbkluLWhvdmVyJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNlY3Rpb25zIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAkKFwiI3NlY3Rpb25zLW1lbnUtb2ZmLWNhbnZhcyBsaSBhXCIpLmhvdmVyKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2hvdmVyLW5hbWUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuYWRkQ2xhc3MoJ3VuaG92ZXItbGlzdCcpO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdob3Zlci1uYW1lJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLnJlbW92ZUNsYXNzKCd1bmhvdmVyLWxpc3QnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnI25hdi11c2VyJykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyN1c2VyLW1lbnUnKS50b2dnbGVDbGFzcygnbmF2LXVzZXItc2hvdycpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcjc2V0dGluZ3MtbmF2LWJ0bicpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoJCgnI2xvZ2dlZC1pbi1zdGF0dXMnKS5oYXNDbGFzcygnbG9nZ2VkLWluJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjdXNlci1tZW51JykudG9nZ2xlQ2xhc3MoJ25hdi11c2VyLXNob3cnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNpZ24tdXAtYnV0dG9ucycpLnRvZ2dsZUNsYXNzKCduYXYtdXNlci1zaG93Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRlbGF5SG92ZXIgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNtYWluLXNlY3Rpb25zLW5hdlwiKS5hZGRDbGFzcygnc3ViTmF2aWdhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKFwiaG92ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH0sIDc1KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcubWFpbi1uYXYnKS5ob3ZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGF5SG92ZXIoJCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhcImhvdmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNtYWluLXNlY3Rpb25zLW5hdlwiKS5yZW1vdmVDbGFzcygnc3ViTmF2aWdhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoJCggd2luZG93ICkud2lkdGgoKSA8PSA0ODApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5tYWluLW5hdicpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAgJCh0aGlzKS5maW5kKCcubWFpbi1uYXYtaXRlbScpLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRW5kIExpc3QgaXRlbXMgaG92ZXIgZXZlbnRzICYgc3R5bGVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXR1cE5hdjogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICQuZm4uYXBwZW5kTGlua0l0ZW1zID0gZnVuY3Rpb24obGlua3MsIHN1cnJvdW5kaW5nVGFnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHN1cnJvdW5kaW5nVGFnID0gc3Vycm91bmRpbmdUYWcgfHwgXCI8bGk+XCI7XG4gICAgICAgICAgICAgICAgJC5lYWNoKGxpbmtzLCBmdW5jdGlvbihpLCBsaW5rKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhID0gJChcIjxhPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmsudGl0bGUpIHsgYS50ZXh0KGxpbmsudGl0bGUpOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rLmh0bWwpIHsgYS5odG1sKGxpbmsuaHRtbCk7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmsuaHJlZikgeyBhLmF0dHIoXCJocmVmXCIsIGxpbmsuaHJlZik7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmsuYXR0cikgeyBhLmF0dHIobGluay5hdHRyKTsgfVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHN1cnJvdW5kaW5nVGFnKS5hcHBlbmQoYSkuYWRkQ2xhc3MobGluay5zZWxlY3RlZCA/IFwic2VsZWN0ZWRcIiA6IFwiXCIpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBuYXYuc2V0SWRlbnRpdHlNZW51ID0gZnVuY3Rpb24gKG1lbnUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9ICQoXCIjdXNlci1tZW51IHVsXCIpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hpbGRyZW4oJ2xpJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRMaW5rSXRlbXMobWVudSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBuYXYuY2xvc2VEcm9wZG93bnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKFwiI3dwLWhlYWRlciAuZHJvcGRvd24tdHJpZ2dlci5hY3RpdmVcIikuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgICAgICAkKFwiI1wiKyQodGhpcykuZGF0YShcIm1lbnVcIikpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAkKFwiLmxlYWRlcmJvYXJkXCIpLnJlbW92ZUNsYXNzKFwiaGlkZUFkXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgbmF2LnNob3dOYXYgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGlmICh0eXBlb2Ygd2luZG93LndwX3BiID09ICdvYmplY3QnICYmIHR5cGVvZiB3aW5kb3cud3BfcGIucmVwb3J0ID09ICdmdW5jdGlvbidcbiAgICAgICAgICAgIC8vICAgICAmJiAoJChcIiN3cC1oZWFkZXJcIikuaGFzQ2xhc3MoXCJiYXItaGlkZGVuXCIpKSkge1xuICAgICAgICAgICAgaWYgKCQoXCIjd3AtaGVhZGVyXCIpLmhhc0NsYXNzKFwiYmFyLWhpZGRlblwiKSkge1xuXG4gICAgICAgICAgICAgIC8vIHdwX3BiLnJlcG9ydCgnbmF2JywgJ3N0YXJ0X29wZW4nLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKFwiI3dwLWhlYWRlclwiKS5yZW1vdmVDbGFzcyhcImJhci1oaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgLy8gd3BfcGIucmVwb3J0KCduYXYnLCAnZmluaXNoX29wZW4nLCB0cnVlKTtcbiAgICAgICAgICAgICAgIH0sIDI1MCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgICAgbmF2LmhpZGVOYXYgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBpZiAodHlwZW9mIHdpbmRvdy53cF9wYiA9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygd2luZG93LndwX3BiLnJlcG9ydCA9PSAnZnVuY3Rpb24nIFxuICAgICAgICAgIC8vICAgICYmICghJChcIiN3cC1oZWFkZXJcIikuaGFzQ2xhc3MoXCJiYXItaGlkZGVuXCIpKSApIHtcbiAgICAgICAgICBpZiAoISQoXCIjd3AtaGVhZGVyXCIpLmhhc0NsYXNzKFwiYmFyLWhpZGRlblwiKSl7XG5cbiAgICAgICAgICAgIC8vIHdwX3BiLnJlcG9ydCgnbmF2JywgJ3N0YXJ0X2Nsb3NlJywgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIC8vIHdwX3BiLnJlcG9ydCgnbmF2JywgJ2ZpbmlzaF9jbG9zZScsIHRydWUpO1xuICAgICAgICAgICAgICAkKFwiI3dwLWhlYWRlclwiKS5hZGRDbGFzcyhcImJhci1oaWRkZW5cIik7XG4gICAgICAgICAgICB9LCAyNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07IFxuXG4gICAgICAgICAgICAvLyBhY3RpdmF0ZSBzaXRlIG1lbnUgd2l0aCBjdXN0b20gYWN0aW9uc1xuICAgICAgICAgICAgJChcIi5zZWN0aW9uLW1lbnUtYnRuXCIpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgIGlmKCQoJ2h0bWwnKS5oYXNDbGFzcygnZHJhd2JyaWRnZS11cCcpKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBfY2xpY2tFbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tZW51RWxlbWVudCA9ICQoXCIjbWFpbi1zZWN0aW9ucy1uYXZcIik7XG5cbiAgICAgICAgICAgICAgICBpZihfbWVudUVsZW1lbnQuaGFzQ2xhc3MoXCJhY3RpdmVcIikpIHtcblxuICAgICAgICAgICAgICAgICAgICAkKFwiYm9keVwiKS5yZW1vdmVDbGFzcyhcImxlZnQtbWVudSBsZWZ0LW1lbnUtcGJcIik7XG4gICAgICAgICAgICAgICAgICAgIF9jbGlja0VsZW1lbnQucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIF9tZW51RWxlbWVudC5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAodHlwZW9mIHdpbmRvdy53cF9wYiA9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygd2luZG93LndwX3BiLnJlcG9ydCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB3cF9wYi5yZXBvcnQoJ25hdicsICdtZW51X3N0YXJ0X2Nsb3NlJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIHdwX3BiLnJlcG9ydCgnbmF2JywgJ21lbnVfZmluaXNoX2Nsb3NlJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB9LCA1MDApO1xuICAgICAgICAgICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIF9tZW51RWxlbWVudC5jc3MoXCJoZWlnaHRcIiwgJCh3aW5kb3cpLmhlaWdodCgpIC0gNDUpO1xuICAgICAgICAgICAgICAgICAgICAkKFwiYm9keVwiKS5hZGRDbGFzcyhcImxlZnQtbWVudSBsZWZ0LW1lbnUtcGJcIik7XG4gICAgICAgICAgICAgICAgICAgIF9jbGlja0VsZW1lbnQuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIF9tZW51RWxlbWVudC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAodHlwZW9mIHdpbmRvdy53cF9wYiA9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygd2luZG93LndwX3BiLnJlcG9ydCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB3cF9wYi5yZXBvcnQoJ25hdicsICdtZW51X3N0YXJ0X29wZW4nLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgd3BfcGIucmVwb3J0KCduYXYnLCAnbWVudV9maW5pc2hfb3BlbicsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhbGNTdWJuYXZQb3NpdGlvbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0U2Nyb2xsRXZlbnRzOiBmdW5jdGlvbigpIHsgXG4gICAgICAgICAgICB2YXIgaXNIb21lcGFnZSA9ICQoXCIjbG9nby1pbi1uYXZcIikuaGFzQ2xhc3MoJ2hvbWVQYWdlJyksXG4gICAgICAgICAgICAgICAgc2Nyb2xsUG9zID0gJCh0aGlzKS5zY3JvbGxUb3AoKSA/ICQodGhpcykuc2Nyb2xsVG9wKCkgOiAwLFxuICAgICAgICAgICAgICAgIGlzTW9iaWxlRGV2aWNlID0gaXNNb2JpbGUoKSxcblxuXG4gICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkJhciA9ICQoJy5wYi1mLXBhZ2Utbm90aWZpY2F0aW9uLWJhcicpLFxuICAgICAgICAgICAgICBub3RpZmljYXRpb25PZmZzZXQgPSAwO1xuICAgICAgICAgICAgICAgIGlmKG5vdGlmaWNhdGlvbkJhci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uT2Zmc2V0ID0gbm90aWZpY2F0aW9uQmFyLm91dGVySGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGlmKCBpc0hvbWVwYWdlICkge1xuICAgICAgICAgICAgICAgICQoJyNsb2dvLWluLW5hdicpLnJlbW92ZUNsYXNzKCduYXYtZGlzcGxheS1zaG93JykuYWRkQ2xhc3MoJ25hdi1kaXNwbGF5LWhpZGUnKTtcblxuICAgICAgICAgICAgICAgICQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5hdmNoYW5nZSA9IGZhbHNlLCBcbiAgICAgICAgICAgICAgICAgICAgd2lkdGhicmVhayA9IDc2OCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvd193aWR0aCA9ICQod2luZG93KS53aWR0aCgpLFxuICAgICAgICAgICAgICAgICAgICAgIHlfc2Nyb2xsX3BvcyA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxfcG9zX3Rlc3QgPSA4MDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IGZvciB0YWJsZXQgbGFuZHNjYXBlIHVwXG4gICAgICAgICAgICAgICAgICAgIGlmICggd2luZG93X3dpZHRoID49IHdpZHRoYnJlYWsgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih5X3Njcm9sbF9wb3MgPiBzY3JvbGxfcG9zX3Rlc3QgJiYgbmF2Y2hhbmdlID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2Y2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjc2VjdGlvbnMtbWVudS13aWRlJykucmVtb3ZlQ2xhc3MoJ25hdi1kaXNwbGF5LXNob3cnKS5hZGRDbGFzcygnbmF2LWRpc3BsYXktaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNsb2dvLWluLW5hdicpLmFkZENsYXNzKCduYXYtZGlzcGxheS1zaG93JykucmVtb3ZlQ2xhc3MoJ25hdi1kaXNwbGF5LWhpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoeV9zY3JvbGxfcG9zIDw9IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2Y2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCAhJCgnI3NlY3Rpb24tbWVudS1idG4nKS5oYXNDbGFzcygnYWN0aXZlJykgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNsb2dvLWluLW5hdicpLnJlbW92ZUNsYXNzKCduYXYtZGlzcGxheS1zaG93JykuYWRkQ2xhc3MoJ25hdi1kaXNwbGF5LWhpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3NlY3Rpb25zLW1lbnUtd2lkZScpLmFkZENsYXNzKCduYXYtZGlzcGxheS1zaG93JykucmVtb3ZlQ2xhc3MoJ25hdi1kaXNwbGF5LWhpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZigkKFwiI21haW4tc2VjdGlvbnMtbmF2XCIpLmhhc0NsYXNzKCdhY3RpdmUnKSkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGNTdWJuYXZQb3NpdGlvbigpOyBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNIb21lcGFnZSB8fCBpc01vYmlsZURldmljZSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRpbWVPdXRUaW1lID0gNTAsIHNjcm9sbEhlaWdodCA9IDE1MDtcblxuICAgICAgICAgICAgICAgIGlmKGlzTW9iaWxlRGV2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbEhlaWdodCA9IDMwO1xuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0VGltZSA9IDI1O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKHdpbmRvdykuc2Nyb2xsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZighJCgnI3NlY3Rpb24tbWVudS1idG4nKS5oYXNDbGFzcygnYWN0aXZlJykpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLyogc2hvdyBhbmQgaGlkZSBuYXYgb24gc2Nyb2xsICovXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFBvcyA9ICQodGhpcykuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggKGN1cnJlbnRQb3MgKyA4MCkgPCBzY3JvbGxQb3MgfHwgY3VycmVudFBvcyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3B5UG9zID0gY3VycmVudFBvcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RQb3MgPSAgJCh0aGlzKS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoKCAoY29weVBvcyAgLSBsYXN0UG9zKSA+IHNjcm9sbEhlaWdodCAmJiAhJCgnI3dwLWhlYWRlcicpLmhhc0NsYXNzKCduby1zY3JvbGwtcGVlaycpKSB8fCBjdXJyZW50UG9zID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2LnNob3dOYXYoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFBvcyA9IGN1cnJlbnRQb3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aW1lT3V0VGltZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCAoY3VycmVudFBvcyAtIDgwKSA+IHNjcm9sbFBvcyAmJiBjdXJyZW50UG9zID4gNTAgKyBub3RpZmljYXRpb25PZmZzZXQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2LmhpZGVOYXYoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxQb3MgPSBjdXJyZW50UG9zO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBoaWRlIHVzZXIgbWVudSBkcm9wIGRvd25zIGlmIG9wZW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3VzZXItbWVudScpLnJlbW92ZUNsYXNzKCduYXYtdXNlci1zaG93Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuc2lnbi11cC1idXR0b25zJykucmVtb3ZlQ2xhc3MoJ25hdi11c2VyLXNob3cnKTtcbiAgICAgICAgICAgICAgICAgICAgfSAgIFxuXG4gICAgICAgICAgICAgICAgICAgIGlmKCQoXCIjbWFpbi1zZWN0aW9ucy1uYXZcIikuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsY1N1Ym5hdlBvc2l0aW9uKCk7IFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9yZW1vdmUgc3RhbmRhcmQgZHJvcGRvd25zXG4gICAgICAgICAgICBuYXYuY2xvc2VEcm9wZG93bnMoKTtcbiAgICAgICAgICAgIC8vcmVzaXplIHNpdGUgbWVudSwgaWYgb3BlblxuICAgICAgICAgICAgaWYoJChcImJvZHlcIikuaGFzQ2xhc3MoXCJsZWZ0LW1lbnVcIikpe1xuICAgICAgICAgICAgICAkKFwiI21haW4tc2VjdGlvbnMtbmF2XCIpLmNzcyhcImhlaWdodFwiLCAkKHdpbmRvdykuaGVpZ2h0KCkgLSA0NSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyB3cF9wYi5yZWdpc3RlcignbmF2JywgJ2ZvcmNlLXNob3cnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgbmF2LnNob3dOYXYoKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIHNldElkZW50aXR5OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGlkcDsgXG4gICAgICAgICAgICBuYXYuZ2V0SWRlbnRpdHlQcm92aWRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlkcDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBuYXYuc2V0SWRlbnRpdHlQcm92aWRlciA9IGZ1bmN0aW9uIChwcm92aWRlcikge1xuICAgICAgICAgICAgICAgIHZhciBlZiA9IGZ1bmN0aW9uICgpIHt9OyAvL2VtcHR5IGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgaWRwID0ge307XG4gICAgICAgICAgICAgICAgLy8gd2UnbGwgcGFkIGFueSBtaXNzaW5nIHBvcnRpb24gd2l0aCBlbXB0eSBmdW5jdGlvblxuICAgICAgICAgICAgICAgIGlkcC5uYW1lID0gcHJvdmlkZXIubmFtZSB8fCBcIlwiO1xuICAgICAgICAgICAgICAgIGlkcC5nZXRVc2VySWQgPSBwcm92aWRlci5nZXRVc2VySWQgfHwgZWY7XG4gICAgICAgICAgICAgICAgaWRwLmdldFVzZXJNZW51ID0gcHJvdmlkZXIuZ2V0VXNlck1lbnUgfHwgZWY7XG4gICAgICAgICAgICAgICAgaWRwLmdldFNpZ25JbkxpbmsgPSBwcm92aWRlci5nZXRTaWduSW5MaW5rIHx8IGVmO1xuICAgICAgICAgICAgICAgIGlkcC5nZXRSZWdpc3RyYXRpb25MaW5rID0gcHJvdmlkZXIuZ2V0UmVnaXN0cmF0aW9uTGluayB8fCBlZjtcbiAgICAgICAgICAgICAgICBpZHAuaXNVc2VyTG9nZ2VkSW4gPSBwcm92aWRlci5pc1VzZXJMb2dnZWRJbiB8fCBlZjtcbiAgICAgICAgICAgICAgICBpZHAuaXNVc2VyU3Vic2NyaWJlciA9IHByb3ZpZGVyLmlzVXNlclN1YnNjcmliZXIgfHwgZWY7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWRwLnJlbmRlciA9IHByb3ZpZGVyLnJlbmRlciB8fCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZHAuaXNVc2VyTG9nZ2VkSW4oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNuYXYtdXNlciAudXNlcm5hbWVcIikudGV4dChpZHAuZ2V0VXNlcklkKCkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBuYXYuc2V0SWRlbnRpdHlNZW51KGlkcC5nZXRVc2VyTWVudSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjbmF2LXVzZXIsICN1c2VyLW1lbnVcIikucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBpZHAuaXNVc2VyU3Vic2NyaWJlcigpID09PSBcIjBcIiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjdXNlci1tZW51IHVsIGxpOmZpcnN0LWNoaWxkJykuYWZ0ZXIoJCgnI25hdi1zdWJzY3JpYmUnKS5jbG9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3VzZXItbWVudSAgI25hdi1zdWJzY3JpYmVcIikucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNsb2dnZWQtaW4tc3RhdHVzJykuYWRkQ2xhc3MoJ2xvZ2dlZC1pbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLm5hdi1zaWduLWluXCIpLmFkZENsYXNzKFwiaGlkZGVuXCIpOyAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNuYXYtc3Vic2NyaWJlXCIpLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNuYXYtc3Vic2NyaWJlLW1vYmlsZVwiKS5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNzaWduLWluLWxpbmtcIikuYXR0cihcImhyZWZcIiwgaWRwLmdldFNpZ25JbkxpbmsoKStcIiZuaWQ9dG9wX3BiX3NpZ25pblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIubmF2LXNpZ24taW5cIikucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjbmF2LXN1YnNjcmliZVwiKS5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIjbmF2LXN1YnNjcmliZS1tb2JpbGVcIikucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvL2xldCdzIHJlbmRlclxuICAgICAgICAgICAgICAgIG5hdi5yZW5kZXJJZGVudGl0eSgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbmF2LnJlbmRlcklkZW50aXR5ID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoaWRwKSB7IC8vIHRoZSB1c2VyIG1pZ2h0IG5vdCBoYXZlIGNvbmZpZ3VyZWQgYW55IGlkZW50aXR5LiBTbyBjaGVjayBmb3IgaXQuXG4gICAgICAgICAgICAgICAgICAgIGlkcC5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soaWRwKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgKiBVc2luZyB0aGUgcHJvdmRlZCBBUEksIHNldCB1cCB0aGUgZGVmYXVsdCBpZGVudGl0eSBwcm92aWRlciBhcyBUV1BcbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUgaWRlbnRpdHkgY29tcG9uZW50IHdlcmUgc2V0IGFzIGhpZGRlbiBmcm9tIFBhZ2VCdWlsZGVyIGFkbWluXG4gICAgICAgICAgICAvLyBzZXQgYSBmbGFnIHNvIHRoYXQgd2UgZG9uJ3QgcHJvY2VzcyBsb2dpbiBhdCBhbGxcbiAgICAgICAgICAgIHZhciBzaG93SWRlbnRpdHkgPSAkKFwiI25hdi11c2VyXCIpLmRhdGEoXCJzaG93LWlkZW50aXR5XCIpO1xuXG4gICAgICAgICAgICAvLyBkZWZhdWx0IElkZW50aXR5XG4gICAgICAgICAgICB2YXIgY3VycmVudCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KFwiP1wiKVswXTtcbiAgICAgICAgICAgIHZhciB0d3BJZGVudGl0eSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIlRXUFwiLFxuICAgICAgICAgICAgICAgIGdldFVzZXJJZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXNlcm5hbWUgPSBUV1AuVXRpbC5Vc2VyLmdldFVzZXJOYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1c2VyaWQgPSBUV1AuVXRpbC5Vc2VyLmdldFVzZXJJZCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHVzZXJuYW1lID09IFwic3RyaW5nXCIgJiYgdXNlcm5hbWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1c2VybmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlcmlkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBnZXRVc2VyTWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgeyBcInRpdGxlXCI6IFwiUHJvZmlsZVwiLCBcImhyZWZcIjogVFdQLnNpZ25pbi5wcm9maWxldXJsICsgY3VycmVudCArICcmcmVmcmVzaD10cnVlJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBcInRpdGxlXCI6IFwiTG9nIG91dFwiLCBcImhyZWZcIjogVFdQLnNpZ25pbi5sb2dvdXR1cmxfcGFnZSB9XG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBnZXRTaWduSW5MaW5rOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBUV1Auc2lnbmluLmxvZ2ludXJsX3BhZ2UgKyBjdXJyZW50O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZ2V0UmVnaXN0cmF0aW9uTGluazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVFdQLnNpZ25pbi5yZWdpc3RyYXRpb251cmxfcGFnZSArIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpc1VzZXJTdWJzY3JpYmVyOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgICAgICAgICAgICAgc3ViID0gKGRvY3VtZW50LmNvb2tpZS5tYXRjaCgvcnBsc2I9KFswLTldKykvKSkgPyBSZWdFeHAuJDEgOiAnJzsgXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWIgPSAoZG9jdW1lbnQuY29va2llLm1hdGNoKC9ycGxzYj0oWzAtOV0rKS8pKSA/IFJlZ0V4cC4kMSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3ViO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaXNVc2VyTG9nZ2VkSW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChUV1AuVXRpbC5Vc2VyKSA/IFRXUC5VdGlsLlVzZXIuZ2V0QXV0aGVudGljYXRpb24oKSA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIElmIHdlIGFyZSBzaG93aW5nIGlkZW50aXR5IHRoZW4gc2V0IHRoZSBkZWZhdWx0IGlkZW50aXR5IHByb3ZpZGVyIHRvIFRXUC5cbiAgICAgICAgICAgIC8vICAgVXNlciBjYW4gb3ZlcmlkZSB0aGlzIHdoZW5ldmVyIHRoZXkgd2FudC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBJbiBUV1AsIGlkZW50aXR5IHVzZXIgaW50ZXJmYWNlIG5lZWRzIHRvIHByb2Nlc3NlZCBhZnRlciB0aGUgZmFjdCB0aGF0IGFsbCBvdGhlciBqYXZhc2NyaXB0IGhhcyBiZWVuIGxvYWRlZC5cbiAgICAgICAgICAgIC8vICAgQnV0IHRoZSBqcyByZXNvdXJjZXMgYXJlIGxvYWRlZCBhc3luY2hyb25vdXNseSBhbmQgaXQgZG9lc24ndCBoYXZlIGFueSBjYWxsYmFja3MgaG9va3MuIFNvIHdlIHdhdGNoIGZvciBpdC5cbiAgICAgICAgICAgIGlmIChzaG93SWRlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICAvL3RyeSB0byBsb2FkIFRXUCBvbmx5IGlmIHdlIGFyZSBzaG93aW5nIElkZW50aXR5LlxuICAgICAgICAgICAgICAgIHZhciBpbml0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uIGNoZWNrVFdQKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUncyBhbHJlYWR5IGlkcCBzZXQsIHRoZW4gZG9uJ3QgdHJ5IHRvIGxvYWQgVFdQLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIW5hdi5nZXRJZGVudGl0eVByb3ZpZGVyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUV1AgJiYgVFdQLnNpZ25pbiAmJiBUV1AuVXRpbCkgeyAvLyBtYWtlIHN1cmUgVFdQIGhhcyBiZWVuIGxvYWRlZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXYuc2V0SWRlbnRpdHlQcm92aWRlcih0d3BJZGVudGl0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2LnJlbmRlcklkZW50aXR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZnRlciAzIHNlY29uZHMsIGlmIFRXUCBpbmRlbnRpdHkgaGFzbid0IGJlZW4gbG9hZGVkLiBMZXQncyBqdXN0IHN0b3AuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgKG5vdyAtIGluaXQgPCAzICogMTAwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCBoYXNuJ3QgYmVlbiBsb2FkZWQsIHdlIHdhaXQgZmV3IG1pbGxpc2Vjb25kcyBhbmQgdHJ5IGFnYWluLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNoZWNrVFdQKCk7IH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICAqIERldGVjdHMgaWYgaXQncyBhIG1vYmlsZSBkZXZpY2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc01vYmlsZSAgKCkge1xuICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BbmRyb2lkL2kpXG4gICAgICB8fCBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC93ZWJPUy9pKVxuICAgICAgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvaVBob25lL2kpXG4gICAgICAvLyB8fCBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9pUGFkL2kpXG4gICAgICB8fCBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9pUG9kL2kpXG4gICAgICB8fCBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9CbGFja0JlcnJ5L2kpXG4gICAgICB8fCBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9LaW5kbGUvaSlcbiAgICAgIHx8IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1dpbmRvd3MgUGhvbmUvaSkgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gICAgLypcbiAgICAgKiBQb3NpdGlvbiBzdWIgbmF2aWdhdGlvbiB2ZXJ0aWNhbHkgY2VudGVyZWQsIFxuICAgICAqICAgcmVsYXRpdmUgdG8gbWFpbiBuYXZpZ2F0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gY2FsY1N1Ym5hdlBvc2l0aW9uKCkge1xuICAgICAgICAkKFwiI3NlY3Rpb25zLW1lbnUtb2ZmLWNhbnZhcyA+IHVsID4gbGlcIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJChcIiNtYWluLXNlY3Rpb25zLW5hdlwiKS5oYXNDbGFzcyhcImFjdGl2ZVwiKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAgICAgICBpZigkKHRoaXMpLmhhc0NsYXNzKCdoYXMtc3ViJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgbW92ZXRvcCA9ICgkKHRoaXMpLmZpbmQoJ3VsJykuaGVpZ2h0KCkvMiAtIDEwKSxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0WSA9ICQodGhpcykub2Zmc2V0KCkudG9wIC0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuICAgICAgICAgICAgICAgICAgICBpZihvZmZzZXRZIDwgOTQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmV0b3AgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYob2Zmc2V0WSAtIG1vdmV0b3AgPCA5NSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZXRvcCA9IG9mZnNldFkgLSA5NTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJ3VsJykuY3NzKCd0b3AnLCAnLScrbW92ZXRvcCsncHgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgd3BIZWFkZXIuaW5pdCgpO1xuICAgIHdwSGVhZGVyLnNldHVwTmF2KCk7XG4gICAgd3BIZWFkZXIuc2V0U2Nyb2xsRXZlbnRzKCk7XG4gICAgd3BIZWFkZXIuc2V0SWRlbnRpdHkoKTtcbiAgICBcbn0oalF1ZXJ5LCB3aW5kb3cpKTsiLCIvL2ZlYXR1cmVzID4gc2hhcmViYXJzID4gdG9wLXNoYXJlLWJhciA+IHJlbmRlci5qcyAtIHN0b2xlbiBzdHJhaWdodCBmcm9tXG4oZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgdmFyIHNvY2lhbFRvb2xzID0ge1xuICAgICAgICBteVJvb3Q6ICcudG9wLXNoYXJlYmFyLXdyYXBwZXInLFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkKCcucGItZi1zaGFyZWJhcnMtdG9wLXNoYXJlLWJhcicpLmVhY2goZnVuY3Rpb24oaW5kZXgsIHJvb3QpIHtcbiAgICAgICAgICAgIC8vdmVydGljYWwtc3RpY2t5LXRvcC1zaGFyZWJhciBoYXMgbm8gbW9iaWxlIHZpZXdcbiAgICAgICAgICAgICAgaWYgKCFUV1BIZWFkLmRlc2t0b3AgJiYgISQocm9vdCkuZmluZCgnLnRvcC1zaGFyZWJhci13cmFwcGVyJykuZGF0YSgncGItcHJldmVudC1hamF4JykgJiYgJChyb290KS5maW5kKCcudmVydGljYWwtc3RpY2t5LXRvcC1zaGFyZWJhcicpLnNpemUoKSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRlbnRVcmlQYXRoID0gJChyb290KS5maW5kKCcudG9wLXNoYXJlYmFyLXdyYXBwZXInKS5kYXRhKCdwYi1jYW5vbmljYWwtdXJsJyk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRlbnRVcmlQYXRoLmluZGV4T2YoJy53YXNoaW5ndG9ucG9zdC5jb20nKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOicvcGIvYXBpL3YyL3JlbmRlci9mZWF0dXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOidqc29uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICQocm9vdClbMF0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpOiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudFVyaTogY29udGVudFVyaVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVza3RvcDogVFdQSGVhZC5kZXNrdG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vYmlsZTogVFdQSGVhZC5tb2JpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZTp0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbkNhbGxiYWNrOid3cFRvcFNoYXJlQmFyQWpheCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOmZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJChyb290KS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAkKHJvb3QpLmFwcGVuZCgkKGRhdGEucmVuZGVyaW5nKS5jaGlsZHJlbigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc29jaWFsVG9vbHMub3JpZ2luYWxJbml0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNvY2lhbFRvb2xzLm9yaWdpbmFsSW5pdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc29jaWFsVG9vbHMub3JpZ2luYWxJbml0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQocm9vdCkuZmluZCgnLnRvcC1zaGFyZWJhci13cmFwcGVyJykuZGF0YSgncGItcHJldmVudC1hamF4JywndHJ1ZScpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNvY2lhbFRvb2xzLm9yaWdpbmFsSW5pdCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgb3JpZ2luYWxJbml0OiBmdW5jdGlvbihteVJvb3QpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIG15Um9vdCA9IG15Um9vdCB8fCB0aGlzLm15Um9vdDtcbiAgICAgICAgICAgIHZhciAkbXlSb290ID0gJChteVJvb3QpO1xuXG4gICAgICAgICAgICAvL2hhbmRsZSBzdGlja3kgYmVoYXZpb3JcbiAgICAgICAgICAgIGlmICgkbXlSb290Lmhhc0NsYXNzKCdzdGlja3ktdG9wLXNoYXJlYmFyJykpIHtcbiAgICAgICAgICAgICAgc3RpY2t5SG9yaXpvbnRhbFNoYXJlQmFyLmluaXQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJG15Um9vdC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBteVJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICAgIC8vaGFuZGxlIHZlcnRpY2FsLXN0aWNreSBiZWhhdmlvciBmb3IgZWFjaCBlbGVtZW50IHRoYXQgaXMgdmVydGljYWwtc3RpY2t5XG4gICAgICAgICAgICAgIGlmICgkKG15Um9vdEVsZW1lbnQpLmhhc0NsYXNzKCd2ZXJ0aWNhbC1zdGlja3ktdG9wLXNoYXJlYmFyJykpIHtcbiAgICAgICAgICAgICAgICBzdGlja3lWZXJ0aWNhbFNoYXJlQmFyLmluaXQoJChteVJvb3RFbGVtZW50KSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAod3BfcGIuU3RhdGljTWV0aG9kcy5zdGF0aWNQb3N0U2hhcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgd3BfcGIuU3RhdGljTWV0aG9kcy5zdGF0aWNQb3N0U2hhcmUuaW5pdCgkKG15Um9vdEVsZW1lbnQpLCAkKG15Um9vdEVsZW1lbnQpLmRhdGEoJ3Bvc3RzaGFyZScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyICRyb290ID0gJChteVJvb3RFbGVtZW50KSxcbiAgICAgICAgICAgICAgICAgICAgJGluZGl2aWR1YWxUb29sID0gJCgnLnRvb2w6bm90KC5tb3JlLCAucmVhZC1sYXRlci1ib29rbWFyaywgLnJlYWQtbGF0ZXItbGlzdCknLCAkcm9vdCksXG4gICAgICAgICAgICAgICAgICAgICRzb2NpYWxUb29sc1dyYXBwZXIgPSAkKCcuc29jaWFsLXRvb2xzLXdyYXBwZXInLCAkcm9vdCksXG4gICAgICAgICAgICAgICAgICAgICRzb2NpYWxUb29sc01vcmVCdG4gPSAkKCcudG9vbC5tb3JlJywgJHNvY2lhbFRvb2xzV3JhcHBlciksXG4gICAgICAgICAgICAgICAgICAgICRzb2NpYWxUb29sc0FkZGl0aW9uYWwgPSAkKCcuc29jaWFsLXRvb2xzLWFkZGl0aW9uYWwnLCAkcm9vdCksXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gKHdpbmRvdy5pbm5lcldpZHRoID4gMCkgPyB3aW5kb3cuaW5uZXJXaWR0aCA6IHNjcmVlbi53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaXNNb2JpbGUgPSAobW9iaWxlX2Jyb3dzZXIgPT09IDEgJiYgd2lkdGggPCA0ODApID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgJHNvY2lhbFRvb2xzTW9yZUJ0bi5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgdGhpcywgZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNvY2lhbFRvb2xzTW9yZUJ0bi5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICRzb2NpYWxUb29sc0FkZGl0aW9uYWwuc2hvdygnZmFzdCcsIGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdC5hZGRDbGFzcyhcImV4cGFuZGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnNvY2lhbC10b29scycsICRzb2NpYWxUb29sc0FkZGl0aW9uYWwpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luLWxlZnRcIjogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgNDI1MCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmFkZENsYXNzKCdtb3JlLW9wZW4nKTsgLy9lbmQgYWRkdGwgc2hvd1xuICAgICAgICAgICAgICAgIH0pOyAvL2VuZCBtb3JlIGNsaWNrXG4gICAgICAgICAgICAgICAgJGluZGl2aWR1YWxUb29sLmJpbmQoe1xuICAgICAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2hhcmVUeXBlID0gJCh0aGlzKS5hdHRyKCdjbGFzcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmVUeXBlID0gKHR5cGVvZiBzaGFyZVR5cGUgIT0gJ3VuZGVmaW5lZCcpID8gc2hhcmVUeXBlLnNwbGl0KFwiIFwiKVswXS50cmltKCkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhY2tUcmFmZmljKCdzaGFyZS4nICsgc2hhcmVUeXBlLCBzaGFyZVR5cGUgKyAnX2JhcicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHdwX3BiICYmIHdwX3BiLkJyb3dzZXJJbmZvICYmIHdwX3BiLkJyb3dzZXJJbmZvLnRhYmxldCkge1xuICAgICAgICAgICAgICAgICAgICAkcm9vdC5hZGRDbGFzcyhcInRhYmxldFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy92ZXJ0aWNhbC1zdGlja3ktdG9wLXNoYXJlYmFyIGhhcyBubyBtb2JpbGUtdmlld1xuICAgICAgICAgICAgICAgIGlmIChUV1BIZWFkLm1vYmlsZSAmJiAkcm9vdC5maW5kKCcudmVydGljYWwtc3RpY2t5LXRvcC1zaGFyZWJhcicpLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgIHZhciBjYWxjTW9iaWxlSWNvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gJHJvb3QuZmluZCgnLnNvY2lhbC10b29scy13cmFwcGVyJykud2lkdGgoKS01O1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2hhcmVJY29uV2lkdGggPSAgTWF0aC5jZWlsKCRyb290LmZpbmQoJy5zb2NpYWwtdG9vbHMtcHJpbWFyeSAuc29jaWFsLXRvb2xzIC50b29sJykuZmlyc3QoKS5vdXRlcldpZHRoKHRydWUpKTtcbiAgICAgICAgICAgICAgICAgICAgJHJvb3QuZmluZCgnLnNvY2lhbC10b29scy1wcmltYXJ5IC5zb2NpYWwtdG9vbHMgLnRvb2wubW9yZScpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFsbFNoYXJlICA9ICRyb290LmZpbmQoJy5zb2NpYWwtdG9vbHMtcHJpbWFyeSAuc29jaWFsLXRvb2xzIC50b29sOm5vdCgubW9yZSksIC5zb2NpYWwtdG9vbHMtYWRkaXRpb25hbCAuc29jaWFsLXRvb2xzIC50b29sJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoJHJvb3QuZmluZCgnLnNvY2lhbC10b29scy1yZWFkbGF0ZXInKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB3aWR0aC1NYXRoLmNlaWwoJHJvb3QuZmluZCgnLnNvY2lhbC10b29scy1yZWFkbGF0ZXInKS53aWR0aCgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgbnVtU2hhcmUgPSBNYXRoLmZsb29yKHdpZHRoL3NoYXJlSWNvbldpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaW50ID0gMDsgaW50IDwgYWxsU2hhcmUubGVuZ3RoOyBpbnQrKykge1xuICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50IDwgbnVtU2hhcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJChhbGxTaGFyZS5nZXQoaW50KSkuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAkKGFsbFNoYXJlLmdldChpbnQpKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgJCggd2luZG93ICkucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxjTW9iaWxlSWNvbnMoKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgY2FsY01vYmlsZUljb25zKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICRyb290LmZpbmQoJy5zb2NpYWwtdG9vbHMtcHJpbWFyeSAuc29jaWFsLXRvb2xzIC50b29sJykuZmFkZUluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRyb290LnJlbW92ZUNsYXNzKFwidW5wcm9jZXNzZWRcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd3BfcGIuU3RhdGljTWV0aG9kcy5pbml0UmVhZExhdGVyID09ICdmdW5jdGlvbicpe1xuICAgICAgICAgICAgICB3cF9wYi5TdGF0aWNNZXRob2RzLmluaXRSZWFkTGF0ZXIoJG15Um9vdCwgJ3RvcC1zaGFyZS1iYXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdHJhY2tUcmFmZmljOiBmdW5jdGlvbihuYW1lLCBlVmFyMjcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93LnNlbmREYXRhVG9PbW5pdHVyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHZhciBvbW5pdHVyZVZhcnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIFwiZVZhcjFcIjogKHR5cGVvZiB3aW5kb3cucyA9PSAnb2JqZWN0JykgJiYgcyAmJiBzLmVWYXIxLFxuICAgICAgICAgICAgICAgICAgICBcImVWYXIyXCI6ICh0eXBlb2Ygd2luZG93LnMgPT0gJ29iamVjdCcpICYmIHMgJiYgcy5lVmFyMixcbiAgICAgICAgICAgICAgICAgICAgXCJlVmFyOFwiOiAodHlwZW9mIHdpbmRvdy5zID09ICdvYmplY3QnKSAmJiBzICYmIHMuZVZhcjgsXG4gICAgICAgICAgICAgICAgICAgIFwiZVZhcjE3XCI6ICh0eXBlb2Ygd2luZG93LnMgPT0gJ29iamVjdCcpICYmIHMgJiYgcy5lVmFyMTcsXG4gICAgICAgICAgICAgICAgICAgIFwiZVZhcjI3XCI6IGVWYXIyN1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZERhdGFUb09tbml0dXJlKG5hbWUsICdldmVudDYnLCBvbW5pdHVyZVZhcnMpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHN0aWNreVZlcnRpY2FsU2hhcmVCYXIgPSB7XG4gICAgICAgIGluaXQgOiBmdW5jdGlvbigkbXlSb290KSB7XG4gICAgICAgICAgJG15Um9vdC5jbG9zZXN0KCcucGItZi1zaGFyZWJhcnMtdG9wLXNoYXJlLWJhcicpLmluc2VydEJlZm9yZSgnI3BiLXJvb3QnKTtcbiAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPiA5OTIpIHtcbiAgICAgICAgICAgIC8vY2VudGVyIHZlcnRpY2FsbHkgWysyNXB4IGZvciBoYWxmIHRoZSBoZWFkZXItdjJdXG4gICAgICAgICAgICAkbXlSb290LmNzcyh7dG9wOiAoKCQod2luZG93KS5oZWlnaHQoKS0kbXlSb290Lm91dGVySGVpZ2h0KCkrMjUpLzIpKydweCd9KTtcbiAgICAgICAgICAgICRteVJvb3QuYW5pbWF0ZSh7bGVmdDogJy0xcHgnfSk7XG4gICAgICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAkbXlSb290LmFuaW1hdGUoe3RvcDogKCgkKHdpbmRvdykuaGVpZ2h0KCktJG15Um9vdC5vdXRlckhlaWdodCgpKzI1KS8yKSsncHgnfSw1MCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL2hhbmRsZSBjb250ZW50IGNvbGxpc2lvblxuICAgICAgICAgICAgICAgIHN0aWNreVZlcnRpY2FsU2hhcmVCYXIuZW5hYmxlQ29sbGlzaW9uRGV0ZWN0aW9uKCRteVJvb3QpO1xuICAgICAgICAgICAgICAgIHdwX3BiLnJlZ2lzdGVyKCdzdGlja3ktdmVydGljYWwtc2hhcmViYXInLCAnY29sbGlkZXNfd2l0aF9tYWluX2NvbnRlbnQnLCBmdW5jdGlvbihjb2xsaWRlcykge1xuICAgICAgICAgICAgICAgICAgICAkbXlSb290LmNsb3Nlc3QoJy5wYi1mLXNoYXJlYmFycy10b3Atc2hhcmUtYmFyJykuY3NzKCdvcGFjaXR5JywgY29sbGlkZXMgPyAnMCcgOiAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvL2hhbmRsZSBtYWduZXQgc3RyaXBcbiAgICAgICAgICB3cF9wYi5yZWdpc3RlcignbWFnbmV0JywgJ3N0YXJ0X29wZW4nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgJG15Um9vdC5hbmltYXRlKHt0b3A6ICgoJCh3aW5kb3cpLmhlaWdodCgpLSRteVJvb3Qub3V0ZXJIZWlnaHQoKSskKCcucGItZi1wYWdlLW1hZ25ldCAucGItbW9kdWxlLWFyZWEnKS5oZWlnaHQoKSsyNSkvMikrJ3B4J30sNTApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHdwX3BiLnJlZ2lzdGVyKCdtYWduZXQnLCAnc3RhcnRfY2xvc2UnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgJG15Um9vdC5hbmltYXRlKHt0b3A6ICgoJCh3aW5kb3cpLmhlaWdodCgpLSRteVJvb3Qub3V0ZXJIZWlnaHQoKSsyNSkvMikrJ3B4J30sNTApO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy9oYW5kbGUgbGVmdC1zaWRlIGhhbWJ1cmdlciBtZW51XG4gICAgICAgICAgd3BfcGIucmVnaXN0ZXIoJ25hdicsICdtZW51X3N0YXJ0X29wZW4nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgJG15Um9vdC5oaWRlKCk7XG4gICAgICAgICAgICAkbXlSb290LmNzcygnbGVmdCcsICctJyArICRteVJvb3Qub3V0ZXJXaWR0aCgpICsgJ3B4Jyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgd3BfcGIucmVnaXN0ZXIoJ25hdicsICdtZW51X2ZpbmlzaF9jbG9zZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPiA5OTIpIHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICRteVJvb3Quc2hvdygpO1xuICAgICAgICAgICAgICAgICAgJG15Um9vdC5hbmltYXRlKHtsZWZ0OiAnLTFweCd9KTtcbiAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgICAgIGVuYWJsZUNvbGxpc2lvbkRldGVjdGlvbjogZnVuY3Rpb24oc3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIElOVEVSVkFMX01TID0gNjAwO1xuICAgICAgICAgICAgICAgIHZhciBNQVhfSU5URVJWQUxTID0gMztcbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJ2YWxDb3VudCA9IDA7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oJG15Um9vdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgam9iO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghc3VwcG9ydGVkIHx8IGludGVydmFsQ291bnQgPiBNQVhfSU5URVJWQUxTKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgam9iID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgJHNiID0gJG15Um9vdC5jbG9zZXN0KCcucGItZi1zaGFyZWJhcnMtdG9wLXNoYXJlLWJhcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyICRzYncgPSAkc2IuZmluZCgnLnRvcC1zaGFyZWJhci13cmFwcGVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgJG1jID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdnYWxsZXJ5X3N0b3J5JykgPyAkKCcucGItZi1nYWxsZXJ5LWdhbGxlcnknKSA6ICQoJyNtYWluLWNvbnRlbnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRjb2xsaWRlcyA9ICRzYi5kYXRhKCdfX21jY29sbGlkZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdjb2xsaWRlcyA9IHsgJ3ZhbHVlJzogdW5kZWZpbmVkIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggISRzYi5sZW5ndGggfHwgISRzYncubGVuZ3RoIHx8ICEkbWMubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGtpbGwgaW50ZXJ2YWwgc2luY2UgZG9jdW1lbnQgbm8gbG9uZ2VyIHN1cHBvcnRzIHRoaXMgZmVhdHVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoam9iKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Y29sbGlkZXMudmFsdWUgPSBjb2xsaXNpb24oJG1jWzBdLCAkc2J3WzBdKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggIW9sZGNvbGxpZGVzIHx8IG5ld2NvbGxpZGVzLnZhbHVlICE9PSBvbGRjb2xsaWRlcy52YWx1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3BfcGIucmVwb3J0KCdzdGlja3ktdmVydGljYWwtc2hhcmViYXInLCAnY29sbGlkZXNfd2l0aF9tYWluX2NvbnRlbnQnLCBuZXdjb2xsaWRlcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzYi5kYXRhKCdfX21jY29sbGlkZXMnLCB7ICd2YWx1ZSc6IG5ld2NvbGxpZGVzLnZhbHVlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgSU5URVJWQUxfTVMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsQ291bnQrKztcblxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBjb2xsaXNpb24oZWxlbWVudDEsIGVsZW1lbnQyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVjdDEgPSBlbGVtZW50MS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN0MiA9IGVsZW1lbnQyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN0MS50b3AgPiByZWN0Mi5ib3R0b20gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN0MS5yaWdodCA8IHJlY3QyLmxlZnQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN0MS5ib3R0b20gPCByZWN0Mi50b3AgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN0MS5sZWZ0ID4gcmVjdDIucmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KCAnZ2V0Qm91bmRpbmdDbGllbnRSZWN0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKVxuICAgIH07XG5cbiAgICB2YXIgc3RpY2t5SG9yaXpvbnRhbFNoYXJlQmFyID0ge1xuICAgICAgICBzZXRFbG1Ub3A6IGZ1bmN0aW9uKCRzaGFyZWJhckVsbSwgeSkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0geT8gJ3RyYW5zbGF0ZTNkKDBweCwgJyArIHkgKyAncHgsIDBweCknOidpbml0aWFsJztcbiAgICAgICAgICAgICRzaGFyZWJhckVsbS5jc3Moe1xuICAgICAgICAgICAgICAgICd0cmFuc2Zvcm0nOiBzdHlsZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG5hdk1lbnVUb2dnbGU6IGZ1bmN0aW9uKCRzaGFyZWJhckVsbSkge1xuICAgICAgICAgICAgd3BfcGIucmVnaXN0ZXIoJ25hdicsICdmaW5pc2hfb3BlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0RWxtVG9wKCRzaGFyZWJhckVsbSwgMCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIHdwX3BiLnJlZ2lzdGVyKCduYXYnLCAnZmluaXNoX2Nsb3NlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFbG1Ub3AoJHNoYXJlYmFyRWxtLCAtNTApO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICB3cF9wYi5yZWdpc3RlcignbWFnbmV0JywgJ3N0YXJ0X29wZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvL3RoaXMuc2V0RWxtVG9wKCRzaGFyZWJhckVsbSwgMTE1KTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBmaXhlZFBvc2l0aW9uOiBmdW5jdGlvbigkc2hhcmViYXJFbG0sIHNoYXJlYmFyVG9wKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50VG9wID4gc2hhcmViYXJUb3ApIHtcbiAgICAgICAgICAgICAgICBpZiAoISRzaGFyZWJhckVsbS5oYXNDbGFzcygndG9wLXNoYXJlYmFyLWZpeGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNoYXJlYmFyRWxtLmFkZENsYXNzKCd0b3Atc2hhcmViYXItZml4ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgd3BfcGIucmVwb3J0KCdzdGlja3ktdG9wLXNoYXJlYmFyJywgJ3NoYXJlYmFyX2ZpeGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc2hhcmViYXJFbG0ucmVtb3ZlQ2xhc3MoJ3RvcC1zaGFyZWJhci1maXhlZCcpO1xuICAgICAgICAgICAgICAgIHdwX3BiLnJlcG9ydCgnc3RpY2t5LXRvcC1zaGFyZWJhcicsICdzaGFyZWJhcl91bmZpeGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkKFwiLnNoYXJlQmFyLWZvbGxvdy1tb2RhbFwiKS5jc3MoJ2Rpc3BsYXknKSA9PSAnYmxvY2snKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQoJyN3cC1oZWFkZXInKS5oZWlnaHQoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgJChcIi5zaGFyZUJhci1mb2xsb3ctbW9kYWxcIikuYWRkQ2xhc3MoJ2ZpeGVkTW9kYWxOYXYnKS5yZW1vdmVDbGFzcygnZml4ZWRNb2RhbCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQoXCIuc2hhcmVCYXItZm9sbG93LW1vZGFsXCIpLmFkZENsYXNzKCdmaXhlZE1vZGFsJykucmVtb3ZlQ2xhc3MoJ2ZpeGVkTW9kYWxOYXYnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1vdmVPdXRPZlJvb3Q6IGZ1bmN0aW9uKCRzaGFyZWJhckVsbSkge1xuICAgICAgICAgICAgLy9UaGlzIGlzIGhhY2t5ISEgSGF2ZSB0byBtb3ZlIGxlYWRlcmJvYXJkIGFuZCBzaGFyZWJhciBvdXRzaWRlIG9mIHBiLXJvb3QgaWYgaXQgaGFzIG1heC13aWR0aC5cbiAgICAgICAgICAgIHZhciAkcGJSb290ID0gJCgnI3BiLXJvb3QnKTtcbiAgICAgICAgICAgIGlmICgkcGJSb290LmNzcygnbWF4LXdpZHRoJykgIT09ICdub25lJykge1xuICAgICAgICAgICAgICAgIHZhciAkc2hhcmViYXJSb290ID0gJHNoYXJlYmFyRWxtLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgIHZhciAkbGVhZGVyYm9hcmQgPSAkKCcucGItZi1hZC1sZWFkZXJib2FyZCcpO1xuICAgICAgICAgICAgICAgICRzaGFyZWJhclJvb3QuZmluZCgnLnN0aWNreS10b3Atc2hhcmViYXInKS5jc3MoJ3BhZGRpbmctdG9wJywgJzU1cHgnKTtcbiAgICAgICAgICAgICAgICAkcGJSb290LmJlZm9yZSgkc2hhcmViYXJSb290KTtcbiAgICAgICAgICAgICAgICAkcGJSb290LmJlZm9yZSgkbGVhZGVyYm9hcmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkZXRlY3RNb2JpbGVGb3JTTVM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKG1vYmlsZV9icm93c2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNoYXJlU3RyaW5nID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvd3NfYnJvd3Nlcikge1xuICAgICAgICAgICAgICAgICAgICBzaGFyZVN0cmluZyA9ICdzbXM6Ly8/Ym9keT0nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5kcm9pZF9icm93c2VyIHx8IGFuZHJvaWQyMzNfYnJvd3Nlcikge1xuICAgICAgICAgICAgICAgICAgICBzaGFyZVN0cmluZyA9ICdzbXM6P2JvZHk9JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2hhcmVTdHJpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAkKCcucGItZi1zaGFyZWJhcnMtdG9wLXNoYXJlLWJhciAuc21zLXNoYXJlLWRldmljZS51bnByb2Nlc3NlZCcpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ29uY2xpY2snLCAkKHRoaXMpLmF0dHIoJ29uY2xpY2snKS5yZXBsYWNlKC9zbXM6XFw/JmJvZHk9L2csIHNoYXJlU3RyaW5nKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCd1bnByb2Nlc3NlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvL2lPUyBpcyB1c2VkIGFzIGRlZmF1bHQgYW5kIGRvZXMgbm90IHJlcXVpcmUgY2hhbmdlXG4gICAgICAgICAgICAgICAgICAgICQoJy5wYi1mLXNoYXJlYmFycy10b3Atc2hhcmUtYmFyIC5zbXMtc2hhcmUtZGV2aWNlLnVucHJvY2Vzc2VkJykucmVtb3ZlQ2xhc3MoJ3VucHJvY2Vzc2VkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkc2hhcmViYXJFbG0gPSAkKCcuc3RpY2t5LXRvcC1zaGFyZWJhcicpLFxuICAgICAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKCEkc2hhcmViYXJFbG0ubGVuZ3RoKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLm1vdmVPdXRPZlJvb3QoJHNoYXJlYmFyRWxtKTtcbiAgICAgICAgICAgIHZhciBzaGFyZWJhclRvcCA9ICRzaGFyZWJhckVsbS5vZmZzZXQoKS50b3A7XG4gICAgICAgICAgICB2YXIgJGhlYWRlciA9ICQoJyN3cC1oZWFkZXInKTtcbiAgICAgICAgICAgIGlmICgkaGVhZGVyLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJyAmJiAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgPiBzaGFyZWJhclRvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZml4ZWRQb3NpdGlvbigkc2hhcmViYXJFbG0sIHNoYXJlYmFyVG9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC5zaGFyZWJhcicpLm9uKCdzY3JvbGwuc2hhcmViYXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpeGVkUG9zaXRpb24oJHNoYXJlYmFyRWxtLCBzaGFyZWJhclRvcCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYubmF2TWVudVRvZ2dsZSgkc2hhcmViYXJFbG0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZGV0ZWN0TW9iaWxlRm9yU01TKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHVzZXJJZCA9ICgoZG9jdW1lbnQuY29va2llLm1hdGNoKC93YXBvX2xvZ2luX2lkPShbXjtdKykvKSkgPyBSZWdFeHAuJDEgOiAnJyk7XG4gICAgdmFyIHVzZXJTZWN1cmVJZCA9ICgoZG9jdW1lbnQuY29va2llLm1hdGNoKC93YXBvX3NlY3VyZV9sb2dpbl9pZD0oW147XSspLykpID8gUmVnRXhwLiQxIDogJycpO1xuICAgIHZhciB1c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gICAgdmFyIGZvbGxvdyA9IHtcblxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIHVzZXJTaWduZWRJbiA9ICh1c2VySWQgIT09ICcnKSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB1c2VyQXBpVXJsID0gXCJcIixcbiAgICAgICAgICAgICAgICBqc29uRGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIGdldFVzZXJEYXRhID0gdHJ1ZSxcbiAgICAgICAgICAgICAgICBmb2xsb3dlZCA9IFtdOyAvLyBDaGVjayB3aGljaCBjYXRlZ29yaWVzIGFyZSBmb2xsb3dlZFxuXG4gICAgICAgICAgICAkKFwiI3NoYXJlQmFyLWZvbGxvd1wiKS5yZW1vdmVDbGFzcygnaGlkZScpO1xuXG4gICAgICAgICAgICAvLyBHZXQgdXNlciBkYXRhXG4gICAgICAgICAgICBpZiAodXNlclNpZ25lZEluKSB7XG4gICAgICAgICAgICAgICAgdXNlckFwaVVybCA9IFwiaHR0cHM6Ly9mb2xsb3cud2FzaGluZ3RvbnBvc3QuY29tL0ZvbGxvdy9hcGkvdXNlclwiO1xuICAgICAgICAgICAgICAgIGpzb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB3YXNoUG9zdElkOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIHdhcG9Mb2dpbklEOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIHdhcG9TZWN1cmVJRDogdXNlclNlY3VyZUlkLFxuICAgICAgICAgICAgICAgICAgICB1c2VyQWdlbnQ6IHVzZXJBZ2VudFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3cF9mb2xsb3dfbW9kYWxfZW1haWwnKSkge1xuICAgICAgICAgICAgICAgIHVzZXJBcGlVcmwgPSBcImh0dHBzOi8vZm9sbG93Lndhc2hpbmd0b25wb3N0LmNvbS9Gb2xsb3cvYXBpL2Fub255bW91cy11c2VyXCI7IC8vIFRPIERPIGNoYW5nZVxuICAgICAgICAgICAgICAgIGpzb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElkOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd3BfZm9sbG93X21vZGFsX2VtYWlsJylcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnZXRVc2VyRGF0YSA9IGZhbHNlOyAvLyBVbmFuaW1vdXMgdXNlciwgbm8gZGF0YSB0byBmZXRjaFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZ2V0VXNlckRhdGEpIHtcblxuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB1c2VyQXBpVXJsLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShqc29uRGF0YSksXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmVtYWlsSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnd3BfZm9sbG93X21vZGFsX2VtYWlsJywgZGF0YS5lbWFpbElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEudGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLnRhZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEudGFnc1tpXS50eXBlID09PSAnY2F0ZWdvcnknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3dlZC5wdXNoKGRhdGEudGFnc1tpXS5zbHVnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvbGxvd2VkLmluZGV4T2YoJChcIiNzdWJ0aXRsZS1mb2xsb3dcIikuZGF0YSgnY2F0ZWdvcnlTbHVnJykpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3NoYXJlQmFyLWZvbGxvd1wiKS5hZGRDbGFzcygnZm9sbG93aW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChcIiNzaGFyZUJhci1mb2xsb3cgLmZvbGxvd0xibFwiKS50ZXh0KCdGb2xsb3dpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDbGljayBmb2xsb3cgYnV0dG9uXG4gICAgICAgICAgICAkKFwiI3NoYXJlQmFyLWZvbGxvd1wiKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgICAgICAgIHZhciBlbmRwb2ludCA9ICgkdGhpcy5oYXNDbGFzcygnZm9sbG93aW5nJykgPyAndW5mb2xsb3cnIDogJ2ZvbGxvdycpLFxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeVNsdWcgPSAkdGhpcy5kYXRhKCdjYXRlZ29yeVNsdWcnKSxcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlUaXRsZSA9ICR0aGlzLmRhdGEoJ2NhdGVnb3J5VGl0bGUnKSxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gPSB7fTtcblxuICAgICAgICAgICAgICAgIHBvc2l0aW9uLnRvcCA9IDU1O1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uLmxlZnQgPSA2NTA7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBhcHBseUNhbGxCYWNrKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIGJ1dHRvbiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmRwb2ludCA9PT0gJ2ZvbGxvdycpXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnZm9sbG93aW5nJykuZmluZCgnLmZvbGxvd0xibCcpLnRleHQoJ0ZvbGxvd2luZycpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcygnZm9sbG93aW5nJykuZmluZCgnLmZvbGxvd0xibCcpLnRleHQoJ0ZvbGxvdycpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgb21uaXR1cmUgZXZlbnRzXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmRwb2ludCA9PT0gJ2ZvbGxvdycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMuc2VuZERhdGFUb09tbml0dXJlKCdGb2xsb3cnLCAnZXZlbnQxMDMnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZVZhcjE6IHMuZVZhcjEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZVZhcjI6IHMuZVZhcjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZVZhcjI2OiAnZmxfc2hhcmViYXJfdG9waWNfJyArIGNhdGVnb3J5U2x1Zy5yZXBsYWNlKC8tL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzLnNlbmREYXRhVG9PbW5pdHVyZSgnVW5mb2xsb3cnLCAnZXZlbnQxMDQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZVZhcjE6IHMuZVZhcjEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZVZhcjI6IHMuZVZhcjIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZVZhcjI2OiAnZmxfc2hhcmViYXJfdG9waWNfJyArIGNhdGVnb3J5U2x1Zy5yZXBsYWNlKC8tL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlTbHVnOiBjYXRlZ29yeVNsdWcsXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5VGl0bGU6IGNhdGVnb3J5VGl0bGUsXG4gICAgICAgICAgICAgICAgICAgIHNpZ25lZEluOiB1c2VyU2lnbmVkSW4sXG4gICAgICAgICAgICAgICAgICAgIGVuZHBvaW50OiBlbmRwb2ludCxcbiAgICAgICAgICAgICAgICAgICAgY2FsbEJhY2s6IGFwcGx5Q2FsbEJhY2tcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gRm9sbG93XG4gICAgICAgICAgICAgICAgaWYgKGVuZHBvaW50ID09PSAnZm9sbG93Jykge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLnBvc2l0aW9uID0gcG9zaXRpb247XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3cF9mb2xsb3dfbW9kYWxfc2VlbicpICE9PSAndHJ1ZScgfHwgIWxvY2FsU3RvcmFnZS5nZXRJdGVtKCd3cF9mb2xsb3dfbW9kYWxfZW1haWwnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhZ0RhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0YWdcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInNsdWdcIjogY2F0ZWdvcnlTbHVnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJjYXRlZ29yeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHBpcCBkZXNjcmlwdGlvbjogVE8gRE8gdGhpcyB3aWxsIGJlIG1vdmVkIHRvIHNpdGUgc2VydmljZSBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vZm9sbG93Lndhc2hpbmd0b25wb3N0LmNvbS9Gb2xsb3cvYXBpL3RhZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0YWdEYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jYXRlZ29yeURlc2MgPSByZXN1bHQudGFnLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cuZGlzcGxheVBpcChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9sbG93LmRpc3BsYXlQaXAoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmVtYWlsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dwX2ZvbGxvd19tb2RhbF9lbWFpbCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cuZm9sbG93QXBpKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gVW5mb2xsb3dcbiAgICAgICAgICAgICAgICAgICAgZm9sbG93LnVuZm9sbG93QXBpKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIEhhbW1lciA9PT0gJ2Z1bmN0aW9uJyAmJiB3cF9wYi5Ccm93c2VySW5mby5tb2JpbGVfYnJvd3Nlcikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoYW1tZXJ0aW1lID0gbmV3IEhhbW1lcigkKCcjc2hhcmVCYXItZm9sbG93JylbMF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZlbnRfbW91c2VldmVudHM6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGhhbW1lcnRpbWUub24oXCJ0YXBcIiwgaGFuZGxlVGFwKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGhhbW1lci5qcyB0YXAgKi9cblxuICAgICAgICAgICAgZnVuY3Rpb24gaGFuZGxlVGFwKGV2KSB7XG4gICAgICAgICAgICAgICAgZXYuZ2VzdHVyZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2Lmdlc3R1cmUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgJChldi5nZXN0dXJlLnRhcmdldCkuY2xpY2soKTtcbiAgICAgICAgICAgICAgICAkKGV2Lmdlc3R1cmUudGFyZ2V0KS5ibHVyKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcblxuICAgICAgICBkaXNwbGF5UGlwOiBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgIHZhciBtb2RhbCA9ICQoJy5zaGFyZUJhci1mb2xsb3ctbW9kYWwnKTtcblxuICAgICAgICAgICAgaWYgKGRhdGEuc2lnbmVkSW4gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgbW9kYWwuZmluZCgnLm5vdC1zaWduZWQtSW4uYmVmb3JlJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKCcubm90LXNpZ25lZC1Jbi5hZnRlcicpLmFkZENsYXNzKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgbW9kYWwuZmluZCgnLnNpZ25lZC1JbicpLmFkZENsYXNzKCdoaWRlJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dwX2ZvbGxvd19tb2RhbF9lbWFpbCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoJyNmb2xsb3ctbW9kYWwtaW5wdXQnKS52YWwobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dwX2ZvbGxvd19tb2RhbF9lbWFpbCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoJy5ub3Qtc2lnbmVkLUluJykuYWRkQ2xhc3MoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICBtb2RhbC5maW5kKCcuc2lnbmVkLUluJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcblxuICAgICAgICAgICAgICAgIGRhdGEucG9zaXRpb24udG9wICs9IDIwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtb2RhbC5maW5kKCcuY2F0ZWdvcnktZGVzYycpLnRleHQoZGF0YS5jYXRlZ29yeURlc2MgPyBkYXRhLmNhdGVnb3J5RGVzYyA6IFwiXCIpO1xuXG4gICAgICAgICAgICAvLyBzZXQgY29ycmVjdCBwb3NpdGlvblxuICAgICAgICAgICAgbW9kYWwuY3NzKCd0b3AnLCBkYXRhLnBvc2l0aW9uLnRvcCk7XG4gICAgICAgICAgICBtb2RhbC5jc3MoJ2xlZnQnLCBkYXRhLnBvc2l0aW9uLmxlZnQpO1xuXG4gICAgICAgICAgICBpZiAoJCgnI3dwLWhlYWRlcicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xuICAgICAgICAgICAgICAgIGlmICgkKCcjd3AtaGVhZGVyJykuaGVpZ2h0KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsLmFkZENsYXNzKCdmaXhlZE1vZGFsTmF2Jyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuYWRkQ2xhc3MoJ2ZpeGVkTW9kYWwnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1vZGFsLmpxbSh7XG4gICAgICAgICAgICAgICAgb3ZlcmxheUNsYXNzOiAnc2hhcmViYXItZm9sbG93LW1vZGFsJyxcbiAgICAgICAgICAgICAgICBvdmVybGF5OiAwLFxuICAgICAgICAgICAgICAgIG9uSGlkZTogZnVuY3Rpb24oaGFzaCkge1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5maW5kKCcuc2lnbi11cCcpLm9mZignY2xpY2snKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZCgnLmZvbGxvdy1tb2RhbC1jbG9zZScpLm9mZignY2xpY2snKTtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZCgnLmdvdC1pdCcpLm9mZignY2xpY2snKTtcblxuICAgICAgICAgICAgICAgICAgICBoYXNoLncuaGlkZSgpICYmIGhhc2gubyAmJiBoYXNoLm8ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBDbG9zZSBtb2RhbFxuICAgICAgICAgICAgbW9kYWwuZmluZCgnLnNpZ24tdXAnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW1haWwgPSBtb2RhbC5maW5kKCcjZm9sbG93LW1vZGFsLWlucHV0JykudmFsKCk7XG4gICAgICAgICAgICAgICAgdmFyIHJlID0gL1tBLVowLTkuXyUrLV0rQFtBLVowLTkuLV0rLltBLVpdezIsNH0vaWdtO1xuXG4gICAgICAgICAgICAgICAgaWYgKGVtYWlsID09PSAnJyB8fCAhcmUudGVzdChlbWFpbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgJChcIi5pbnZhbGlkLWVtYWlsXCIpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkKFwiLmludmFsaWQtZW1haWxcIikuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmVtYWlsID0gZW1haWw7XG5cbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3dwX2ZvbGxvd19tb2RhbF9lbWFpbCcsIGVtYWlsKTtcblxuICAgICAgICAgICAgICAgICAgICBmb2xsb3cuZm9sbG93QXBpKGRhdGEsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwuZmluZCgnLm5vdC1zaWduZWQtSW4uYmVmb3JlJykuYWRkQ2xhc3MoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQoJy5ub3Qtc2lnbmVkLUluLmFmdGVyJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG1vZGFsLmZpbmQoJy5mb2xsb3ctbW9kYWwtY2xvc2UnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBtb2RhbC5qcW1IaWRlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbW9kYWwuZmluZCgnLmdvdC1pdCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG1vZGFsLmpxbUhpZGUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoZGF0YS5zaWduZWRJbikge1xuICAgICAgICAgICAgICAgIGZvbGxvdy5mb2xsb3dBcGkoZGF0YSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd3BfZm9sbG93X21vZGFsX3NlZW4nKSAhPT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5qcW1TaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnd3BfZm9sbG93X21vZGFsX3NlZW4nLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd3BfZm9sbG93X21vZGFsX3NlZW4nKSAhPT0gJ3RydWUnIHx8ICFsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd3BfZm9sbG93X21vZGFsX2VtYWlsJykpIHtcblxuICAgICAgICAgICAgICAgICAgICBtb2RhbC5qcW1TaG93KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcy5zZW5kRGF0YVRvT21uaXR1cmUoJ0ZvbGxvdycsICdldmVudDEwMScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVWYXIxOiBzLmVWYXIxLFxuICAgICAgICAgICAgICAgICAgICAgICAgZVZhcjI6IHMuZVZhcjIsXG4gICAgICAgICAgICAgICAgICAgICAgICBlVmFyMjY6ICdmbF9zaGFyZWJhcl90b3BpY18nICsgZGF0YS5jYXRlZ29yeVNsdWcucmVwbGFjZSgvLS9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3dwX2ZvbGxvd19tb2RhbF9zZWVuJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmVtYWlsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dwX2ZvbGxvd19tb2RhbF9lbWFpbCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvbGxvdy5mb2xsb3dBcGkoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZvbGxvd0FwaTogZnVuY3Rpb24oZGF0YSwgY2FsbEJhY2spIHtcbiAgICAgICAgICAgIHZhciBzZXJ2aWNlQmFzZSA9IFwiaHR0cHM6Ly9mb2xsb3cud2FzaGluZ3RvbnBvc3QuY29tXCIsXG4gICAgICAgICAgICAgICAganNvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdhc2hQb3N0SWQ6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgdGFnczogW11cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyB1c2VyIGlzIG5vdCBzaWduZWQgaW5cbiAgICAgICAgICAgIGlmIChkYXRhLmVtYWlsICYmIGRhdGEuc2lnbmVkSW4gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgc2VydmljZUJhc2UgKz0gXCIvRm9sbG93L2FwaS9hbm9ueW1vdXMtZm9sbG93XCI7XG5cbiAgICAgICAgICAgICAgICBqc29uRGF0YS5lbWFpbElkID0gZGF0YS5lbWFpbDtcblxuICAgICAgICAgICAgICAgIGpzb25EYXRhLnRhZ3MgPSBbe1xuICAgICAgICAgICAgICAgICAgICBzbHVnOiBkYXRhLmNhdGVnb3J5U2x1ZyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3J5J1xuICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlQmFzZSArPSBcIi9Gb2xsb3cvYXBpL2ZvbGxvd1wiO1xuXG4gICAgICAgICAgICAgICAganNvbkRhdGEudGFncyA9IFt7XG4gICAgICAgICAgICAgICAgICAgIHNsdWc6IGRhdGEuY2F0ZWdvcnlTbHVnLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5jYXRlZ29yeVRpdGxlLFxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogMSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3J5J1xuICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICB1cmw6IHNlcnZpY2VCYXNlLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShqc29uRGF0YSksXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNhbGxCYWNrKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxCYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbEJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVuZm9sbG93QXBpOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgc2VydmljZUJhc2UgPSBcImh0dHBzOi8vZm9sbG93Lndhc2hpbmd0b25wb3N0LmNvbVwiO1xuXG4gICAgICAgICAgICB2YXIgdGFncyA9IFt7XG4gICAgICAgICAgICAgICAgc2x1ZzogZGF0YS5jYXRlZ29yeVNsdWcsXG4gICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEuY2F0ZWdvcnlUaXRsZSxcbiAgICAgICAgICAgICAgICBsZXZlbDogMSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcnknXG4gICAgICAgICAgICB9XTtcblxuICAgICAgICAgICAgdmFyIGpzb25EYXRhID0ge1xuICAgICAgICAgICAgICAgIHdhc2hQb3N0SWQ6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICB3YXBvTG9naW5JRDogdXNlcklkLFxuICAgICAgICAgICAgICAgIHdhcG9TZWN1cmVJRDogdXNlclNlY3VyZUlkLFxuICAgICAgICAgICAgICAgIHVzZXJBZ2VudDogdXNlckFnZW50LFxuICAgICAgICAgICAgICAgIHRhZ3M6IHRhZ3NcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChkYXRhLnNpZ25lZEluKSB7XG4gICAgICAgICAgICAgICAgc2VydmljZUJhc2UgKz0gXCIvRm9sbG93L2FwaS91bmZvbGxvd1wiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlQmFzZSArPSBcIi9Gb2xsb3cvYXBpL2Fub255bW91cy11bmZvbGxvd1wiO1xuICAgICAgICAgICAgICAgIGpzb25EYXRhLmVtYWlsSWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnd3BfZm9sbG93X21vZGFsX2VtYWlsJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIHVybDogc2VydmljZUJhc2UsXG4gICAgICAgICAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGpzb25EYXRhKSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25jZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uY2Uuc3RhdHVzID09PSB0cnVlICYmIGRhdGEuY2FsbEJhY2spXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNhbGxCYWNrKHJlc3BvbmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2NhbFN0b3JhZ2VBdmFpbGFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRlc3QgPSAndGVzdCc7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRlc3QsIHRlc3QpO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRlc3QpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVdGlsaXRpZXMgU1RBUlRcbiAgICAgKiBOb3RlOiBTYW1lIGNvZGUgaW4gc2hhcmViYXJzXFx1dGxpdHktYmFyXG4gICAgICovXG4gICAgdmFyIHRleHRSZXNpemVyID0ge1xuICAgICAgY3VyckluY3JlbWVudE1heDogOSxcbiAgICAgIGN1cnJJbmNyZW1lbnRVbml0OiAyLFxuICAgICAgY3VyckluY3JlbWVudEluZGV4OiAwLFxuICAgICAgaW5pdDogZnVuY3Rpb24obXlSb290LCByZXNpemVhYmxlRWxlbWVudExpc3QsIGNsaWNrRWxlbWVudCkge1xuICAgICAgICAgIG15Um9vdCA9IG15Um9vdCB8fCAnI2FydGljbGUtYm9keSBhcnRpY2xlLCAucmVsYXRlZC1zdG9yeSwgLmxpdmVibG9nLWludHJvLCAjbGl2ZWJsb2ctc3RvcnktbGlzdCAuZGVzY3JpcHRpb24sICNmdWxsLXJlY2lwZSAuYXJ0aWNsZS1jb250ZW50JztcbiAgICAgICAgICByZXNpemVhYmxlRWxlbWVudExpc3QgPSByZXNpemVhYmxlRWxlbWVudExpc3QgfHwgJ3AsIGxpJztcbiAgICAgICAgICBjbGlja0VsZW1lbnQgPSBjbGlja0VsZW1lbnQgfHwgJy50b29sLnRleHRyZXNpemVyJztcbiAgICAgICAgICB0aGlzLnJvb3QgPSAkKG15Um9vdCk7XG4gICAgICAgICAgdGhpcy5yZXNpemVhYmxlRWxlbWVudHMgPSAkKHJlc2l6ZWFibGVFbGVtZW50TGlzdCwgdGhpcy5yb290KTtcblxuICAgICAgICAgIC8vIGFkZCBcIk5leHQgdXBcIiBsYWJsZSB0byB0aGUgcmVzaXphYmxlIGVsZW1lbnQncyBsaXN0XG4gICAgICAgICAgaWYgKCQoXCIucmVsYXRlZC1zdG9yeVwiKS5wcmV2KCdoMycpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgdGhpcy5yZXNpemVhYmxlRWxlbWVudHMucHVzaCgkKCcucmVsYXRlZC1zdG9yeScpLnByZXYoJ2gzJykpO1xuICAgICAgICAgICAgICB0aGlzLnJlc2l6ZWFibGVFbGVtZW50cy5wdXNoKCQoJy5yZWxhdGVkLXN0b3J5IGg0IGEnKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgICQoY2xpY2tFbGVtZW50KS5vbignY2xpY2snLCB0aGlzLCB0aGlzLnJlc2l6ZSk7XG4gICAgICB9LFxuICAgICAgcmVzaXplOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIHZhciBjdXJyT2JqID0gZXZlbnQuZGF0YTtcbiAgICAgICAgICBpZiAoY3Vyck9iai5jdXJySW5jcmVtZW50SW5kZXggPT0gY3Vyck9iai5jdXJySW5jcmVtZW50TWF4KSB7XG4gICAgICAgICAgICAgIGN1cnJPYmouY3VyckluY3JlbWVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgY3Vyck9iai5jdXJySW5jcmVtZW50VW5pdCA9IChjdXJyT2JqLmN1cnJJbmNyZW1lbnRVbml0ID09IDIpID8gLTIgOiAyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJyT2JqLmN1cnJJbmNyZW1lbnRJbmRleCA9IGN1cnJPYmouY3VyckluY3JlbWVudEluZGV4ICsgMTtcbiAgICAgICAgICBjdXJyT2JqLnJlc2l6ZWFibGVFbGVtZW50cy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBlbG0gPSAkKHRoaXMpO1xuICAgICAgICAgICAgICBjdXJyU2l6ZSA9IHBhcnNlRmxvYXQoZWxtLmNzcygnZm9udC1zaXplJyksIDUpO1xuICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gY3VyclNpemUgKyBjdXJyT2JqLmN1cnJJbmNyZW1lbnRVbml0O1xuICAgICAgICAgICAgICBlbG0uY3NzKCdmb250LXNpemUnLCByZXN1bHQpO1xuICAgICAgICAgICAgICB3cF9wYi5yZXBvcnQoJ3RleHRyZXNpemVyJywgJ3Jlc2l6ZWQnLCByZXN1bHQpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICB9O1xuXG4gIHZhciB0cmFja1RyYWZmaWMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5zZW5kRGF0YVRvT21uaXR1cmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB2YXIgb21uaXR1cmVWYXJzID0ge1xuICAgICAgICAgICAgICBcImVWYXIxXCI6ICh0eXBlb2Ygd2luZG93LnMgPT0gJ29iamVjdCcpICYmIHMgJiYgcy5lVmFyMSxcbiAgICAgICAgICAgICAgXCJlVmFyMlwiOiAodHlwZW9mIHdpbmRvdy5zID09ICdvYmplY3QnKSAmJiBzICYmIHMuZVZhcjIsXG4gICAgICAgICAgICAgIFwiZVZhcjhcIjogKHR5cGVvZiB3aW5kb3cucyA9PSAnb2JqZWN0JykgJiYgcyAmJiBzLmVWYXI4LFxuICAgICAgICAgICAgICBcImVWYXIxN1wiOiAodHlwZW9mIHdpbmRvdy5zID09ICdvYmplY3QnKSAmJiBzICYmIHMuZVZhcjE3LFxuICAgICAgICAgICAgICBcImVWYXIyN1wiOiBuYW1lXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzZW5kRGF0YVRvT21uaXR1cmUobmFtZSArICcuY2xpY2snLCAnZXZlbnQ2Jywgb21uaXR1cmVWYXJzKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgfVxuICB9O1xuICAkKCcuc29jaWFsLXRvb2xzLXdyYXBwZXIgLnRvb2wudGV4dHJlc2l6ZXIsIC5zb2NpYWwtdG9vbHMtd3JhcHBlciAudG9vbC5wcmludCcpLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbmFtZSA9ICQodGhpcykuYXR0cignY2xhc3MnKS5zcGxpdChcIiBcIilbMF0udHJpbSgpO1xuICAgICAgdHJhY2tUcmFmZmljKG5hbWUpO1xuICB9KTtcblxuICAgIC8qKlxuICAgICAqIFV0aWxpdGllcyBFTkRcbiAgICAgKi9cblxuICAgIC8vIFR1cm4gb2ZmIHRoZSBleHBlcmllbmNlXG5cbiAgICAvLyAkKHdpbmRvdy5kb2N1bWVudCkub24oJ2FidGVzdC1yZWFkeScsIGZ1bmN0aW9uKGUsIEFCVCkge1xuXG4gICAgLy8gICAgIHZhciB0ZXN0ID0gQUJULmdldCgnZm9sbG93LXBvd2VyUG9zdFRvcCcpO1xuXG4gICAgLy8gICAgIGlmICh0ZXN0LmlzKCdzaGFyZWJhcicpKSB7XG4gICAgLy8gICAgICAgICBmb2xsb3cuaW5pdCgpO1xuICAgIC8vICAgICB9XG4gICAgLy8gfSk7XG5cbiAgICAvKlxuICAgICAqIFBPUE9VVCBjb2RlIGZvciBsYXRlciB2YXIgJGFydGljbGUgPSAkKCcjYXJ0aWNsZS10b3BwZXInKTsgLy8gU1RBUlQ6XG4gICAgICogU29jaWFsIHNoYXJlIHBvcC1vdXQgdmFyICRzb2NpYWxUb29sc01vcmVCdG4gPSAkKCcuc29jaWFsLXRvb2xzXG4gICAgICogLm1vcmUnLCRhcnRpY2xlKSwgJHNvY2lhbFRvb2xzUG9wT3V0ID1cbiAgICAgKiAkKCcuc29jaWFsLXRvb2xzLnBvcC1vdXQnLCRhcnRpY2xlKSA7XG4gICAgICogJHNvY2lhbFRvb2xzTW9yZUJ0bi5vbignY2xpY2snLGZ1bmN0aW9uKGV2KXsgdmFyIHRhcmdldFRvcCA9XG4gICAgICogJHNvY2lhbFRvb2xzTW9yZUJ0bi5wb3NpdGlvbigpLnRvcCArXG4gICAgICogJHNvY2lhbFRvb2xzTW9yZUJ0bi5vdXRlckhlaWdodCgpLTEtMTQ7IHZhciB0YXJnZXRMZWZ0ID1cbiAgICAgKiAkc29jaWFsVG9vbHNNb3JlQnRuLnBvc2l0aW9uKCkubGVmdC0xLTM7XG4gICAgICogJHNvY2lhbFRvb2xzUG9wT3V0LmNzcyh7XCJ0b3BcIjp0YXJnZXRUb3AsXCJsZWZ0XCI6dGFyZ2V0TGVmdH0pO1xuICAgICAqICRzb2NpYWxUb29sc1BvcE91dC50b2dnbGUoKTsgfSk7XG4gICAgICogJHNvY2lhbFRvb2xzUG9wT3V0Lm9uKCdtb3VzZW91dCcsZnVuY3Rpb24oZXYpe1xuICAgICAqICRzb2NpYWxUb29sc1BvcE91dC50b2dnbGUoKTsgfSk7IC8vIEVORDogU29jaWFsIHNoYXJlIHBvcC1vdXRcbiAgICAgKi9cblxuICAgICAgd2luZG93LlRXUCA9IFRXUCB8fCB7fTtcbiAgICAgIFRXUC5Tb2NpYWxUb29scyA9IFRXUC5Tb2NpYWxUb29scyB8fCBzb2NpYWxUb29scztcbiAgICAgIFRXUC5Tb2NpYWxUb29scy5pbml0KCk7XG5cbiAgICAgIFRXUC5UZXh0UmVzaXplciA9IFRXUC5UZXh0UmVzaXplciB8fCB0ZXh0UmVzaXplcjtcbiAgICAgIFRXUC5UZXh0UmVzaXplci5pbml0KCk7XG5cbiAgICAgIHZhciB0YWJsZXQgPSBpc01vYmlsZS50YWJsZXQoKTtcblxuICAgICAgd2luZG93LlZpc2l0b3JTZWdtZW50ICYmIFZpc2l0b3JTZWdtZW50KCd0YWJsZXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gKHRhYmxldCAmJiAkKHdpbmRvdykud2lkdGgoKSA+IDc2OCk7XG4gICAgICB9KTtcblxuICB9IGNhdGNoIChlcnIpIHtcbiAgfVxufSkoKTtcbiIsInZhciBpZnJhbWUgPSByZXF1aXJlKCcuL2lmcmFtZS5qcycpO1xudmFyIHR3aXR0ZXJGb2xsb3dCdXR0b25Nb2R1bGVzID0gcmVxdWlyZSgnLi90d2l0dGVyLWZvbGxvdy5qcycpO1xudmFyIHBiSGVhZGVyTW9kdWxlID0gcmVxdWlyZSgnLi9wYkhlYWRlci5qcycpO1xudmFyIHBiU29jaWFsVG9vbHMgPSByZXF1aXJlKCcuL3BiU29jaWFsVG9vbHMuanMnKTtcblxuLy9BZGRzIHRoZSByZXR1cm4gdXJsIHRvIHRoZSBzdWJzY3JpYmUgYWN0aW9uXG52YXIgc2V0dXBTdWJzY3JpYmVCdG4gPSBmdW5jdGlvbigpe1xuXHR2YXIgJHN1YnNjcmliZSA9ICQoJyNuYXYtc3Vic2NyaWJlJyksXG5cdFx0aHJlZiA9ICAkc3Vic2NyaWJlLmF0dHIoJ2hyZWYnKSxcblx0XHRwYWdlTG9jYXRpb24gPSB3aW5kb3cuZW5jb2RlVVJJKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblx0ICRzdWJzY3JpYmUuYXR0cignaHJlZicsIGhyZWYgKyBwYWdlTG9jYXRpb24pO1xufTtcbi8vRHJvcCBpbiB5b3VyIGluaXQgZmlsZVxuc2V0dXBTdWJzY3JpYmVCdG4oKTtcbiIsIndpbmRvdy50d3R0ciA9IChmdW5jdGlvbiAoZCwgcywgaWQpIHtcbiAgdmFyIHQsIGpzLCBmanMgPSBkLmdldEVsZW1lbnRzQnlUYWdOYW1lKHMpWzBdO1xuICBpZiAoZC5nZXRFbGVtZW50QnlJZChpZCkpIHJldHVybjtcbiAganMgPSBkLmNyZWF0ZUVsZW1lbnQocyk7IGpzLmlkID0gaWQ7XG4gIGpzLnNyYz0gXCJodHRwczovL3BsYXRmb3JtLnR3aXR0ZXIuY29tL3dpZGdldHMuanNcIjtcbiAgZmpzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGpzLCBmanMpO1xuICByZXR1cm4gd2luZG93LnR3dHRyIHx8ICh0ID0geyBfZTogW10sIHJlYWR5OiBmdW5jdGlvbiAoZikgeyB0Ll9lLnB1c2goZikgfSB9KTtcbn0oZG9jdW1lbnQsIFwic2NyaXB0XCIsIFwidHdpdHRlci13anNcIikpOyJdfQ==
