//features > sharebars > top-share-bar > render.js - stolen straight from
(function() {
  try {
    var socialTools = {
        myRoot: '.top-sharebar-wrapper',
        init: function() {
          $('.pb-f-sharebars-top-share-bar').each(function(index, root) {
            //vertical-sticky-top-sharebar has no mobile view
              if (!TWPHead.desktop && !$(root).find('.top-sharebar-wrapper').data('pb-prevent-ajax') && $(root).find('.vertical-sticky-top-sharebar').size() == 0) {
                var contentUriPath = $(root).find('.top-sharebar-wrapper').data('pb-canonical-url');
                if (contentUriPath.indexOf('.washingtonpost.com') >= 0) {
                  $.ajax({
                        url:'/pb/api/v2/render/feature',
                        dataType:'json',
                        data: {
                          id: $(root)[0].id,
                            uri: window.location.pathname,
                            contentUri: contentUriPath,
                            desktop: TWPHead.desktop,
                            mobile: TWPHead.mobile
                        },
                        cache:true,
                        jsonCallback:'wpTopShareBarAjax',
                        success:function(data) {
                          $(root).empty();
                          $(root).append($(data.rendering).children());
                          socialTools.originalInit();
                        },
                        error:function(data){
                          socialTools.originalInit();
                        }
                    });
                } else {
                  socialTools.originalInit();
                }
                $(root).find('.top-sharebar-wrapper').data('pb-prevent-ajax','true');
              } else {
                socialTools.originalInit();
              }
            });
        },
        originalInit: function(myRoot) {
            var self = this;
            myRoot = myRoot || this.myRoot;
            var $myRoot = $(myRoot);

            //handle sticky behavior
            if ($myRoot.hasClass('sticky-top-sharebar')) {
              stickyHorizontalShareBar.init();
            }

            $myRoot.each(function(index, myRootElement) {
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
                    width = (window.innerWidth > 0) ? window.innerWidth : screen.width,
                    isMobile = (mobile_browser === 1 && width < 480) ? true : false;

                $socialToolsMoreBtn.off('click').on('click', this, function(ev) {
                    $socialToolsMoreBtn.hide();
                    $socialToolsAdditional.show('fast', function(ev) {
                        $root.addClass("expanded");
                        $('.social-tools', $socialToolsAdditional).animate({
                            "margin-left": 0
                        }, 4250);
                    }).addClass('more-open'); //end addtl show
                }); //end more click
                $individualTool.bind({
                    click: function(event) {
                        //event.stopPropagation();
                        var shareType = $(this).attr('class');
                        shareType = (typeof shareType != 'undefined') ? shareType.split(" ")[0].trim() : '';
                        self.trackTraffic('share.' + shareType, shareType + '_bar');
                    }
                });
                if (wp_pb && wp_pb.BrowserInfo && wp_pb.BrowserInfo.tablet) {
                    $root.addClass("tablet");
                }
                //vertical-sticky-top-sharebar has no mobile-view
                if (TWPHead.mobile && $root.find('.vertical-sticky-top-sharebar').size() > 0) {
                  var calcMobileIcons = function() {
                    var width = $root.find('.social-tools-wrapper').width()-5;
                    var shareIconWidth =  Math.ceil($root.find('.social-tools-primary .social-tools .tool').first().outerWidth(true));
                    $root.find('.social-tools-primary .social-tools .tool.more').hide();
                    var allShare  = $root.find('.social-tools-primary .social-tools .tool:not(.more), .social-tools-additional .social-tools .tool').hide();
                    if ($root.find('.social-tools-readlater').length > 0) {
                      width = width-Math.ceil($root.find('.social-tools-readlater').width());
                    }
                    var numShare = Math.floor(width/shareIconWidth);
                    for (var int = 0; int < allShare.length; int++) {
                      try {
                        if (int < numShare) {
                          $(allShare.get(int)).fadeIn();
                        } else {
                          $(allShare.get(int)).hide();
                        }
                      } catch (e) {
                      }
                    }
                  }
                  $( window ).resize(function() {
                    calcMobileIcons();
                  });
                  calcMobileIcons();
                } else {
                  $root.find('.social-tools-primary .social-tools .tool').fadeIn();
                }
                $root.removeClass("unprocessed");
            });
            if (typeof wp_pb.StaticMethods.initReadLater == 'function'){
              wp_pb.StaticMethods.initReadLater($myRoot, 'top-share-bar');
            }
        },
        trackTraffic: function(name, eVar27) {
            if (typeof window.sendDataToOmniture === 'function') {
                var omnitureVars = {
                    "eVar1": (typeof window.s == 'object') && s && s.eVar1,
                    "eVar2": (typeof window.s == 'object') && s && s.eVar2,
                    "eVar8": (typeof window.s == 'object') && s && s.eVar8,
                    "eVar17": (typeof window.s == 'object') && s && s.eVar17,
                    "eVar27": eVar27
                };
                try {
                    sendDataToOmniture(name, 'event6', omnitureVars);
                } catch (e) {}
            }
        }
    };

    var stickyVerticalShareBar = {
        init : function($myRoot) {
          $myRoot.closest('.pb-f-sharebars-top-share-bar').insertBefore('#pb-root');
          if (window.innerWidth > 992) {
            //center vertically [+25px for half the header-v2]
            $myRoot.css({top: (($(window).height()-$myRoot.outerHeight()+25)/2)+'px'});
            $myRoot.animate({left: '-1px'});
            $(window).resize(function() {
              $myRoot.animate({top: (($(window).height()-$myRoot.outerHeight()+25)/2)+'px'},50);
            });
          }

                //handle content collision
                stickyVerticalShareBar.enableCollisionDetection($myRoot);
                wp_pb.register('sticky-vertical-sharebar', 'collides_with_main_content', function(collides) {
                    $myRoot.closest('.pb-f-sharebars-top-share-bar').css('opacity', collides ? '0' : '');
                });

          //handle magnet strip
          wp_pb.register('magnet', 'start_open', function(){
            $myRoot.animate({top: (($(window).height()-$myRoot.outerHeight()+$('.pb-f-page-magnet .pb-module-area').height()+25)/2)+'px'},50);
          });
          wp_pb.register('magnet', 'start_close', function(){
            $myRoot.animate({top: (($(window).height()-$myRoot.outerHeight()+25)/2)+'px'},50);
          });

          //handle left-side hamburger menu
          wp_pb.register('nav', 'menu_start_open', function(){
            $myRoot.hide();
            $myRoot.css('left', '-' + $myRoot.outerWidth() + 'px');
          });
          wp_pb.register('nav', 'menu_finish_close', function(){
            if (window.innerWidth > 992) {
              setTimeout(function(){
                $myRoot.show();
                  $myRoot.animate({left: '-1px'});
              }, 100);
            }
          });
        },
            enableCollisionDetection: function(supported) {
                var INTERVAL_MS = 600;
                var MAX_INTERVALS = 3;
                var intervalCount = 0;

                return function($myRoot) {
                    var job;

                    if (!supported || intervalCount > MAX_INTERVALS) return;

                    job = setInterval(function() {
                        var $sb = $myRoot.closest('.pb-f-sharebars-top-share-bar');
                        var $sbw = $sb.find('.top-sharebar-wrapper');
                        var $mc = $('html').hasClass('gallery_story') ? $('.pb-f-gallery-gallery') : $('#main-content');
                        var oldcollides = $sb.data('__mccollides');
                        var newcollides = { 'value': undefined };

                        if ( !$sb.length || !$sbw.length || !$mc.length ) {
                            // kill interval since document no longer supports this feature
                            clearInterval(job);
                        } else {
                            newcollides.value = collision($mc[0], $sbw[0]);

                            if ( !oldcollides || newcollides.value !== oldcollides.value ) {
                                wp_pb.report('sticky-vertical-sharebar', 'collides_with_main_content', newcollides.value);
                                $sb.data('__mccollides', { 'value': newcollides.value });
                            }
                        }
                    }, INTERVAL_MS);

                    intervalCount++;

                    function collision(element1, element2) {
                        var rect1 = element1.getBoundingClientRect(),
                            rect2 = element2.getBoundingClientRect();

                        return !(
                            rect1.top > rect2.bottom ||
                            rect1.right < rect2.left ||
                            rect1.bottom < rect2.top ||
                            rect1.left > rect2.right
                        );
                    }
                }
            }( 'getBoundingClientRect' in document.documentElement )
    };

    var stickyHorizontalShareBar = {
        setElmTop: function($sharebarElm, y) {
            var style = y? 'translate3d(0px, ' + y + 'px, 0px)':'initial';
            $sharebarElm.css({
                'transform': style
            });
        },
        navMenuToggle: function($sharebarElm) {
            wp_pb.register('nav', 'finish_open', function() {
                this.setElmTop($sharebarElm, 0);
            }, this);
            wp_pb.register('nav', 'finish_close', function() {
                this.setElmTop($sharebarElm, -50);
            }, this);
            wp_pb.register('magnet', 'start_open', function() {
                //this.setElmTop($sharebarElm, 115);
            }, this);
        },
        fixedPosition: function($sharebarElm, sharebarTop) {
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
        moveOutOfRoot: function($sharebarElm) {
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
        detectMobileForSMS: function() {
            if (mobile_browser) {
                var shareString = '';
                if (windows_browser) {
                    shareString = 'sms://?body=';
                } else if (android_browser || android233_browser) {
                    shareString = 'sms:?body=';
                }

                if (shareString.length > 0) {
                    $('.pb-f-sharebars-top-share-bar .sms-share-device.unprocessed').each(function() {
                        $(this).attr('onclick', $(this).attr('onclick').replace(/sms:\?&body=/g, shareString));
                        $(this).removeClass('unprocessed');
                    });
                } else {
                    //iOS is used as default and does not require change
                    $('.pb-f-sharebars-top-share-bar .sms-share-device.unprocessed').removeClass('unprocessed');
                }
            }
        },
        init: function() {
            var $sharebarElm = $('.sticky-top-sharebar'),
                self = this;
            if (!$sharebarElm.length) return;
            this.moveOutOfRoot($sharebarElm);
            var sharebarTop = $sharebarElm.offset().top;
            var $header = $('#wp-header');
            if ($header.css('position') === 'fixed' && $(window).scrollTop() > sharebarTop) {
                this.fixedPosition($sharebarElm, sharebarTop);
            }
            $(window).off('scroll.sharebar').on('scroll.sharebar', function() {
                self.fixedPosition($sharebarElm, sharebarTop);
            });
            $(document).ready(function() {
                self.navMenuToggle($sharebarElm);
            });

            this.detectMobileForSMS();
        }
    };

    var userId = ((document.cookie.match(/wapo_login_id=([^;]+)/)) ? RegExp.$1 : '');
    var userSecureId = ((document.cookie.match(/wapo_secure_login_id=([^;]+)/)) ? RegExp.$1 : '');
    var userAgent = navigator.userAgent;

    var follow = {

        init: function() {

            var userSignedIn = (userId !== '') ? true : false,
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
                    success: function(data) {
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
            $("#shareBar-follow").on('click', function() {
                var $this = $(this);
                var endpoint = ($this.hasClass('following') ? 'unfollow' : 'follow'),
                    categorySlug = $this.data('categorySlug'),
                    categoryTitle = $this.data('categoryTitle'),
                    position = {};

                position.top = 55;
                position.left = 650;

                function applyCallBack(data) {
                    // change button text
                    if (endpoint === 'follow')
                        $this.addClass('following').find('.followLbl').text('Following');
                    else
                        $this.removeClass('following').find('.followLbl').text('Follow');

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
                            success: function(result) {
                                data.categoryDesc = result.tag.description;
                                follow.displayPip(data);
                            },
                            error: function(reason) {
                                follow.displayPip(data);
                            }
                        });
                    } else {
                        data.email = localStorage.getItem('wp_follow_modal_email');

                        follow.followApi(data);
                    }
                } else { // Unfollow
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

        displayPip: function(data) {

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
                onHide: function(hash) {
                    modal.find('.sign-up').off('click');
                    modal.find('.follow-modal-close').off('click');
                    modal.find('.got-it').off('click');

                    hash.w.hide() && hash.o && hash.o.remove();
                    return true;
                }
            });

            // Close modal
            modal.find('.sign-up').click(function() {
                var email = modal.find('#follow-modal-input').val();
                var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;

                if (email === '' || !re.test(email)) {
                    $(".invalid-email").show();
                } else {
                    $(".invalid-email").hide();
                    data.email = email;

                    localStorage.setItem('wp_follow_modal_email', email);

                    follow.followApi(data, function() {
                        modal.find('.not-signed-In.before').addClass('hide');
                        modal.find('.not-signed-In.after').removeClass('hide');
                    });
                }
            });

            modal.find('.follow-modal-close').click(function() {
                modal.jqmHide();
            });

            modal.find('.got-it').click(function() {
                modal.jqmHide();
            });

            if (data.signedIn) {
                follow.followApi(data, function() {
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

        followApi: function(data, callBack) {
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
                success: function(result) {
                    if (result.status === true) {
                        data.callBack(data);
                        if (callBack) {
                            callBack();
                        }
                    }
                }
            });
        },

        unfollowApi: function(data) {
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
                success: function(responce) {
                    if (responce.status === true && data.callBack)
                        data.callBack(responce);
                }
            });
        },

        localStorageAvailable: function() {
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
      init: function(myRoot, resizeableElementList, clickElement) {
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
      resize: function(event) {
          var currObj = event.data;
          if (currObj.currIncrementIndex == currObj.currIncrementMax) {
              currObj.currIncrementIndex = 0;
              currObj.currIncrementUnit = (currObj.currIncrementUnit == 2) ? -2 : 2;
          }
          currObj.currIncrementIndex = currObj.currIncrementIndex + 1;
          currObj.resizeableElements.each(function() {
              elm = $(this);
              currSize = parseFloat(elm.css('font-size'), 5);
              var result = currSize + currObj.currIncrementUnit;
              elm.css('font-size', result);
              wp_pb.report('textresizer', 'resized', result);
          });
      }
  };

  var trackTraffic = function(name) {
      if (typeof window.sendDataToOmniture === 'function') {
          var omnitureVars = {
              "eVar1": (typeof window.s == 'object') && s && s.eVar1,
              "eVar2": (typeof window.s == 'object') && s && s.eVar2,
              "eVar8": (typeof window.s == 'object') && s && s.eVar8,
              "eVar17": (typeof window.s == 'object') && s && s.eVar17,
              "eVar27": name
          };
          try {
              sendDataToOmniture(name + '.click', 'event6', omnitureVars);
          } catch (e) {}
      }
  };
  $('.social-tools-wrapper .tool.textresizer, .social-tools-wrapper .tool.print').bind('click', function() {
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

      window.VisitorSegment && VisitorSegment('tablet', function() {
          return (tablet && $(window).width() > 768);
      });

  } catch (err) {
  }
})();
