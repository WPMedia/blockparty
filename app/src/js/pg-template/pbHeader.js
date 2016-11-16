(function ($, window) {

    var core = window.wp_pb = window.wp_pb || {};
    var nav = core.nav = core.nav || {};

    var wpHeader = {


        init: function() {

            // hide nav on IE 8 browsers
            if($('#page').hasClass('ie8')) {
                return;

            } else {

                /*
              * Move header feature outside of pb-container 
              */
                if( $("#pb-root .pb-f-page-header-v2").length ) {
                    var $header = $(".pb-f-page-header-v2");
                    $("#pb-root").before( $header );
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
                    if($(this).hasClass('nav-screenreader-link')) {
                        return;
                    }
                    var item = $(this).find('>a'),
                          itemText = item.html().replace(/\s+/g, '').replace(/\&/g,'-').toLowerCase(),
                          itemLink = item.attr('href');

                    if($(this).hasClass('main-nav')) { // main nav item
                        item.attr('href', itemLink + "?nid=menu_nav_"+ itemText  );
                    } else if ($(this).hasClass('sub-nav-item')) { // sub nav item
                        var mainItem =$(this).parents('.main-nav').find('>a').text().replace(/\s+/g, '').replace(/\&/g,'-').toLowerCase() ;
                        item.attr('href', itemLink + "?nid=menu_nav_"+ mainItem +'-'+ itemText );
                    }
                });

                // top nav
                $("#sections-menu-wide li").each(function () {
                    var item = $(this).find('a'),
                          itemText = item.html().replace(/\s+/g, '').replace(/\&/g,'-').toLowerCase(),
                          itemLink = item.attr('href');
                        item.attr('href', itemLink + "?nid=top_nav_"+ itemText);
                });

             // --------------------------------END items click tracking-----------------------------
        
             /*
              * Search field and button functionality
              */
              (function () {

                    var searchIconHovered;

                    // Search field and button
                    $('#search-btn').click(function(e) {
                        if($(this).hasClass('closed')) {

                            $(this).removeClass('closed').addClass('opened');
                            $('#search-field').removeClass('closed').addClass('opened');
                            $('#search-field').focus();

                        } else if($(this).hasClass('opened')){
                            $("#search-form").submit();
                        }
                    });

                    $("#search-btn").bind("mouseover",function() {
                        if($(this).hasClass('opened'))  searchIconHovered = true;
                    }).bind("mouseout",function() {
                        if($(this).hasClass('opened'))  searchIconHovered = false;
                    });

                    $('#search-field').blur(function(e) {
                         if($(this).hasClass('opened') && !searchIconHovered) {

                            $(this).removeClass('opened').addClass('closed');
                            $('#search-btn').removeClass('opened').addClass('closed');
                        }
                    });

                    $("#search-form, #nav-search-mobile").submit(function (event) {
                if ($(this).find('input[type=text]').val()) {
                try{
                    s.sendDataToOmniture('Search Submit','event2',{'eVar38':$(this).find('input[type=text]').val(),'eVar1':s.pageName});
                } catch(e) {}
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
                (function() {

                    var timer;

                    // User ststus buttons hovers
                    $("#logged-in-status .nav-sign-in").hover(function(e) {
                        $('#nav-subscribe').addClass('signIn-hover');
                    }, function(e) {
                        $('#nav-subscribe').removeClass('signIn-hover');
                    });

                    // Sections button
                    $("#sections-menu-off-canvas li a").hover(function(e) {
                        $(this).addClass('hover-name');
                        $(this).parent().addClass('unhover-list');
                    }, function(e) {
                        $(this).removeClass('hover-name');
                        $(this).parent().removeClass('unhover-list');
                    });

                    $('#nav-user').click(function(){
                        $('#user-menu').toggleClass('nav-user-show');
                    });

                    $('#settings-nav-btn').click(function() {
                        if($('#logged-in-status').hasClass('logged-in')) {
                            $('#user-menu').toggleClass('nav-user-show');
                        } else {
                            $('.sign-up-buttons').toggleClass('nav-user-show');
                        }
                    });

                    function delayHover (element) {
                    timer = setTimeout(function() {
                        $("#main-sections-nav").addClass('subNavigation');
                    $(element).addClass("hover");
                    }, 75);
                    };

                    $('.main-nav').hover(function() {
                        delayHover($(this));
                    }, function() {
                        $(this).removeClass("hover");
                        $("#main-sections-nav").removeClass('subNavigation');
                        clearTimeout(timer);
                    });

                    if($( window ).width() <= 480) {
                        $('.main-nav').click(function() {
                            location.href =  $(this).find('.main-nav-item').attr('href');
                        });
                    }
                })();

                // ------------------------------- End List items hover events & styles ----------------------
            }
        },

        setupNav: function() {

            $.fn.appendLinkItems = function(links, surroundingTag) {
                var element = this;
                surroundingTag = surroundingTag || "<li>";
                $.each(links, function(i, link) {
                    var a = $("<a>");
                    if (link.title) { a.text(link.title); }
                    if (link.html) { a.html(link.html); }
                    if (link.href) { a.attr("href", link.href); }
                    if (link.attr) { a.attr(link.attr); }
                    element.append(
                            $(surroundingTag).append(a).addClass(link.selected ? "selected" : "")
                    );
                });
                return this;
            };

            nav.setIdentityMenu = function (menu) {
                var element = $("#user-menu ul");
                element.children('li').remove();
                element.appendLinkItems(menu);
            };

            nav.closeDropdowns = function() {
                $("#wp-header .dropdown-trigger.active").each(function(){
                    $(this).removeClass("active");
                    $("#"+$(this).data("menu")).hide();
                });
                $(".leaderboard").removeClass("hideAd");
            }

          nav.showNav = function() {
            // if (typeof window.wp_pb == 'object' && typeof window.wp_pb.report == 'function'
            //     && ($("#wp-header").hasClass("bar-hidden"))) {
            if ($("#wp-header").hasClass("bar-hidden")) {

              // wp_pb.report('nav', 'start_open', true);

               setTimeout(function() {
                $("#wp-header").removeClass("bar-hidden");
                // wp_pb.report('nav', 'finish_open', true);
               }, 250);
            }
          };

            nav.hideNav = function() {
          // if (typeof window.wp_pb == 'object' && typeof window.wp_pb.report == 'function' 
          //    && (!$("#wp-header").hasClass("bar-hidden")) ) {
          if (!$("#wp-header").hasClass("bar-hidden")){

            // wp_pb.report('nav', 'start_close', true);

            setTimeout(function() {
              // wp_pb.report('nav', 'finish_close', true);
              $("#wp-header").addClass("bar-hidden");
            }, 250);
            }
          }; 

            // activate site menu with custom actions
            $(".section-menu-btn").click(function (event) {

                event.stopPropagation();
                event.preventDefault();

                if($('html').hasClass('drawbridge-up')){
                    return;
                }

                var _clickElement = $(this),
                        _menuElement = $("#main-sections-nav");

                if(_menuElement.hasClass("active")) {

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

        setScrollEvents: function() { 
            var isHomepage = $("#logo-in-nav").hasClass('homePage'),
                scrollPos = $(this).scrollTop() ? $(this).scrollTop() : 0,
                isMobileDevice = isMobile(),


              notificationBar = $('.pb-f-page-notification-bar'),
              notificationOffset = 0;
                if(notificationBar.length) {
                    notificationOffset = notificationBar.outerHeight();
                }


            if( isHomepage ) {
                $('#logo-in-nav').removeClass('nav-display-show').addClass('nav-display-hide');

                $(window).scroll(function() {

                    var navchange = false, 
                    widthbreak = 768,
                        window_width = $(window).width(),
                      y_scroll_pos = window.pageYOffset,
                      scroll_pos_test = 80;

                    // Only for tablet landscape up
                    if ( window_width >= widthbreak ) {
                        if(y_scroll_pos > scroll_pos_test && navchange == false) {
                            navchange = true;
                            $('#sections-menu-wide').removeClass('nav-display-show').addClass('nav-display-hide');
                            $('#logo-in-nav').addClass('nav-display-show').removeClass('nav-display-hide');
                        } else if (y_scroll_pos <= 0 ) {
                            navchange = false;
                            if ( !$('#section-menu-btn').hasClass('active') ) {
                                $('#logo-in-nav').removeClass('nav-display-show').addClass('nav-display-hide');
                                $('#sections-menu-wide').addClass('nav-display-show').removeClass('nav-display-hide');
                            }
                        }
                    }

                    if($("#main-sections-nav").hasClass('active')) { 
                        calcSubnavPosition(); 
                    }
                });
            } else if (!isHomepage || isMobileDevice) {

                var timeOutTime = 50, scrollHeight = 150;

                if(isMobileDevice) {
                    scrollHeight = 30;
                    timeOutTime = 25;
                }
                $(window).scroll(function() {
                    if(!$('#section-menu-btn').hasClass('active')) {

                        /* show and hide nav on scroll */
                        var currentPos = $(this).scrollTop();
                            
                        if( (currentPos + 80) < scrollPos || currentPos === 0) {
                            var copyPos = currentPos;
                            setTimeout(function() { 
                                var lastPos =  $(this).scrollTop();
                                if(( (copyPos  - lastPos) > scrollHeight && !$('#wp-header').hasClass('no-scroll-peek')) || currentPos === 0 ) {
                                    nav.showNav();
                                    scrollPos = currentPos;
                                }
                            }, timeOutTime);
                            
                        } else if ( (currentPos - 80) > scrollPos && currentPos > 50 + notificationOffset ) {
                            
                            nav.hideNav();
                            scrollPos = currentPos;
                        }

                        // hide user menu drop downs if opened
                        $('#user-menu').removeClass('nav-user-show');
                        $('.sign-up-buttons').removeClass('nav-user-show');
                    }   

                    if($("#main-sections-nav").hasClass('active')) { 
                        calcSubnavPosition(); 
                    }
                });
            }


        $(window).resize(function() {
            //remove standard dropdowns
            nav.closeDropdowns();
            //resize site menu, if open
            if($("body").hasClass("left-menu")){
              $("#main-sections-nav").css("height", $(window).height() - 45);
            }
        });

        $(document).ready(function () {
          // wp_pb.register('nav', 'force-show', function() {
              nav.showNav();
            // });
        });

        },

        setIdentity: function() {

            var idp; 
            nav.getIdentityProvider = function () {
                    return idp;
            };
            nav.setIdentityProvider = function (provider) {
                var ef = function () {}; //empty function
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

                        if( idp.isUserSubscriber() === "0" ) {
                            $('#user-menu ul li:first-child').after($('#nav-subscribe').clone());
                            $("#user-menu  #nav-subscribe").removeClass("hidden");
                        }

                        $('#logged-in-status').addClass('logged-in');
                        
                        $(".nav-sign-in").addClass("hidden");                        
                        $("#nav-subscribe").addClass("hidden");
                        $("#nav-subscribe-mobile").addClass("hidden");
                    } else {

                        $("#sign-in-link").attr("href", idp.getSignInLink()+"&nid=top_pb_signin");
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
                if (idp) { // the user might not have configured any identity. So check for it.
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
                getUserId: function () {
                    var username = TWP.Util.User.getUserName();
                    var userid = TWP.Util.User.getUserId();
                    if (typeof username == "string" && username.length > 0) {
                            return username;
                    } else {
                            return userid;
                    }
                },
                getUserMenu: function () {
                    return [
                        { "title": "Profile", "href": TWP.signin.profileurl + current + '&refresh=true' },
                        { "title": "Log out", "href": TWP.signin.logouturl_page }
                    ];
                },
                getSignInLink: function () {
                    return TWP.signin.loginurl_page + current;
                },
                getRegistrationLink: function () {
                    return TWP.signin.registrationurl_page + current;
                },
                isUserSubscriber: function (){
                    sub = (document.cookie.match(/rplsb=([0-9]+)/)) ? RegExp.$1 : ''; 
                    var sub = (document.cookie.match(/rplsb=([0-9]+)/)) ? RegExp.$1 : '';
                    return sub;
                },
                isUserLoggedIn: function () {
                    return (TWP.Util.User) ? TWP.Util.User.getAuthentication() : false;
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
                        if (TWP && TWP.signin && TWP.Util) { // make sure TWP has been loaded.
                            nav.setIdentityProvider(twpIdentity);
                            nav.renderIdentity();
                        } else {
                            var now = new Date().getTime();
                            // after 3 seconds, if TWP indentity hasn't been loaded. Let's just stop.
                            // if (now - init < 3 * 1000) {
                                // if it hasn't been loaded, we wait few milliseconds and try again.
                                window.setTimeout(function () { checkTWP(); }, 200);
                            // }
                        }
                    }
                }());
            }
        }
    };

    /*
     * Detects if it's a mobile device
     */
    function isMobile  () {
    if (navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      // || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Kindle/i)
      || navigator.userAgent.match(/Windows Phone/i) ) {
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
        $("#sections-menu-off-canvas > ul > li").each(function() {
      if (!$("#main-sections-nav").hasClass("active")) {
        return;
      }
            if($(this).hasClass('has-sub')) {
                var movetop = ($(this).find('ul').height()/2 - 10),
                    offsetY = $(this).offset().top - $(window).scrollTop();
                    if(offsetY < 94) {
                        movetop = 0;
                    } else if(offsetY - movetop < 95 ){
                        movetop = offsetY - 95;
                    }
              $(this).find('ul').css('top', '-'+movetop+'px');
            }
        });
    }

    wpHeader.init();
    wpHeader.setupNav();
    wpHeader.setScrollEvents();
    wpHeader.setIdentity();
    
}(jQuery, window));