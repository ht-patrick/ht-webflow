$( document ).ready(function() {
    

    console.log("update!");
    
    function in_production(){
      if (window.location.href.indexOf("content.hellotech.com") >= 0) 
      { return true; }
      else
      { return false; }
    }
    
    
    
    
    // Switch HT production domain to staging domain if the user is on contents.hellotech.com (staging) page
	if (!in_production()) {
		//console.log("This is staging!");
    
		var linkRewriter = function(a, b) {
          $('a[href*="' + a + '"]').each(function() {
            if($(this).attr('ignore_domain_switch') != "true")  {
              $(this).attr('href', $(this).attr('href').replace(a, b));
            }
            
          });	
       	};

    	linkRewriter('www.hellotech.com', 'htstaging.hellotech.com');
   		linkRewriter('//hellotech.com', '//htstaging.hellotech.com');
	}	
    
       
    // Turn FAQ title bold when active (initial weight = Book)
    $(".faq-trigger").click(function(){
      
      if($(this).siblings(".faq-content").height() == 0){
		$(this).find(".faq-headline").css("font-weight","500");
        
      }
      else{
		$(this).find(".faq-headline").css("font-weight","400");
      }
    });
    
    
    
    $("[year='now']").text(new Date().getFullYear());
    
    
    function postMessageToParent(data) {
      // For future additions, add a data-caller property to the containing div, e.g. <div data-caller="fooBarPage" />
      if (window.self !== window.top) {
        var callerIdElem = document.querySelector('[data-caller]');
        var callerIdValue = callerIdElem ? callerIdElem.dataset && callerIdElem.dataset.caller : null;
        var callerIdValue2 = $(".iframe-data-caller").text();
        data.caller = callerIdValue2 || callerIdValue || 'categorypage';
        window.parent.postMessage(data, '*');
      }
    }
    
    function goToExternalLocation(locationURL,is_newtab) {
      postMessageToParent({ type: 'goToExternalLocation', message:{ locationURL:locationURL, newTab: is_newtab }})
    }
    $("[external-link='true']").click(function(){
      goToExternalLocation($(this).attr("href"),false);
      return false;
    });
    
    function reportWindowSize() {
      var mainTagHeight = document.getElementById('page-wrapper');
      var defaultPageHeight = 5500;

      if (mainTagHeight) {
        postMessageToParent({ message: mainTagHeight.offsetHeight, type: 'height' });
      } else {
        /* guessing here */
        postMessageToParent({ message: defaultPageHeight, type: 'height' })
      }
    }
    setTimeout(function(){ reportWindowSize(); }, 1000);
    
    $("[update-height='on']").click(function(){
      setTimeout(function(){ reportWindowSize(); }, 1000);
      
    });
    
    function handleWindowSizeInterval(){
      // For very large pages the correct window height isn't being reported on page load
      var mainTagHeight = document.getElementById('page-wrapper');
      var defaultPageHeight = 5500;
      if (mainTagHeight && mainTagHeight.offsetHeight > defaultPageHeight){
        reportWindowSize();
      }
      return false;
    }
    
    // Notify parent that Webflow page has loaded
    function pageLoaded() {
      postMessageToParent({ message: true, type: 'loaded' })
    }
    
    // Fire this function on load
    function fireOnLoad() {
      reportWindowSize(); // Reports Webflow window size to parent page, on load
      pageLoaded(); // Notify parent that Webflow page has loaded
    }
    
    // Get access to iframe click events since we don't have direct access in our page wrapper
    function captureBodyClickEvent() {
      console.log("body clicked");
      postMessageToParent({ type: 'captureBodyClickEvent', message: '' })
    }
    
    fireOnLoad();
    window.addEventListener('resize', reportWindowSize);
    window.setInterval(handleWindowSizeInterval, 5000);
    
    
    // Report redirect URL and segment object to parent object
    function genericLinkAndTrackClick(URL,eventValue,pageType) {
      console.log("page type is: ",pageType);
      postMessageToParent(
        {  type: 'genericLinkAndTrackClick',
           message: {
             redirectUrl: URL,
             segment: { event: eventValue },
             pageType: pageType
           } 
        }
      );
    }
    
    $("body[iframed='true']").click(function(event){
    	captureBodyClickEvent();
      	
      	return false;
    });
    
    $("body[iframetest='true']").hover(function(event){
    	captureBodyClickEvent();
      	return false;
    });
  

    // Pass redirect URL and event name to parent page, on click
    $("a[segmentTracking='on']").click(function(event){
        event.stopPropagation();
        event.stopImmediatePropagation();
		genericLinkAndTrackClick($(this).attr("href"),$(this).attr("event"),$(this).attr("pageType"));
        fireOnLoad();
      	return false;
    });
    
     // Pass redirect URL and event name to parent page, on click
    $("a[segmentTracking='onNextJS']").click(function(event){
      var url = $(this).attr("href");
      
        event.stopPropagation();
        event.stopImmediatePropagation();
		
      window.top.location = url;
      
        fireOnLoad();
      	return false;
    });
    
    /*$("[phone-number='true']").click(function(event){
      	console.log($(this).next().text());
        event.stopPropagation();
        event.stopImmediatePropagation();
		callPhone($(this).next().text());
        fireOnLoad();
      	return false;
    });*/
    
   
    //Check if browser is safari so that we can assign phone numbers special tag to work on safari
    var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isSafari) {
        $("[phone-number='true']").attr("target","_parent");
    }
    
    
    // Report desired scroll value to parent page
    function anchorScrollBy (ScrollValue){
      postMessageToParent({ type: 'anchorScrollBy', message: ScrollValue });
      //console.log("anchor-call");
    }
    
    // ANCHORING
    //When user clicks an element with an anchor link attribute, scroll parent window to y-position of the anchor destination
    $("[anchor-link='true']").click(function(){
      anchorScrollBy($($(this).attr("href")).offset().top);
      setTimeout(function(){ reportWindowSize(); }, 1000);
      //console.log($($(this).attr("href")).offset().top);
    });
    
	// Scroll to top
    // This function forces the user's browser view to the top when they click the trigger element.
     $("[force-to-top='true']").click(function(){
      anchorScrollBy(0);
	  });
    
    $("[force-this-up='true']").click(function(){
      anchorScrollBy($(this).offset().top);
      console.log("position: ",$(this).offset().top);
    });
    
    // Add commas to integers
    $.fn.digits = function(){ 
        return this.each(function(){ 
            $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") ); 
        })
    }
    $("[comma='on']").digits();
    
    
    // Dynamic year display
    var currentYear = (new Date).getFullYear();
	$(".current-year").text( (new Date).getFullYear() );
    
    
    // For the iFramed homepage/all services page SKU sliders
    // Problem: When dragging the slider left/right, it counts as a CLICK event and triggers the redirect URL
    // Solution: Detect if it's a CLICK or DRAG event. Only trigger redirect URL if it's a CLICK event.
    $('.slider-card').on('mousedown', function (evt) {
      $('.slider-card').on('mouseup mousemove', function handler(evt) {
        if (evt.type === 'mouseup') {
          //click
          event.stopPropagation();
          event.stopImmediatePropagation();
          genericLinkAndTrackClick($(this).attr("href"),$(this).attr("event"),$(this).attr("pageType"));
          fireOnLoad();
          return false;
        }else{
        //drag
          //console.log("i dragged");
        }
        $('.slider-card').off('mouseup mousemove', handler);
      });
    });
    
    $('.cat--sku-card').on('mousedown', function (evt) {
      $('.cat--sku-card').on('mouseup mousemove', function handler(evt) {
        if (evt.type === 'mouseup') {
          //click
          event.stopPropagation();
          event.stopImmediatePropagation();
          genericLinkAndTrackClick($(this).attr("href"),$(this).attr("event"),$(this).attr("pageType"));
          fireOnLoad();
          return false;
        }else{
        //drag
          //console.log("i dragged");
        }
        $('.cat--sku-card').off('mouseup mousemove', handler);
      });
    });
    
   
    //Get current page's URL
   
   function getParentUrl() {
        var isInIframe = (parent !== window),
            parentUrl = null;

        if (isInIframe) {
            parentUrl = document.referrer;
        }

        return parentUrl;
    }
    //console.log("current page URL: "+ getParentUrl());
    
    
    //Get single query parameter from current page URL (ex. ?category=computer). Returns object containing param key + value
    
    function getQueryParams(url) {
      if(url != null){
        if(url.indexOf('?') != -1){
          //console.log("has params");
           const paramArr = url.slice(url.indexOf('?') + 1).split('&');
          const params = {};
          paramArr.map(param => {
              const [key, val] = param.split('=');
              params[key] = decodeURIComponent(val);
            //console.log("params[key]: " + params[key]);
           // console.log("key " + key);
            //console.log("val " + val);
          })

          return params;

        }
         else{
           //console.log("no params");
           return false;
         }
   	 }
        
    }
    
    
    // For any iframed page
    // Allow anchoring to a specific section on a page via page load
    // There should be a query in the URL being loaded: "?section=X" where X = the ID tag of an element on the page we want to anchor to
    // This does not work for sections that are hidden away via Tabs. 
    if (getQueryParams(getParentUrl()) 
        && 'section' in getQueryParams(getParentUrl())
        && getQueryParams(getParentUrl())['section']
        && getQueryParams(getParentUrl())['section'] != "undefined"
        && getQueryParams(getParentUrl())['section'] != ""
       ){
      var URL_param = getQueryParams(getParentUrl()).section;
      console.log(URL_param);
      
      setTimeout(function(){ anchorScrollBy($("#"+URL_param).offset().top); }, 200);
      setTimeout(function(){ anchorScrollBy($("#"+URL_param).offset().top); }, 400);
      //setTimeout(function(){ reportWindowSize(); }, 1000);
    }
    // For Service Category pages (iframed)
    // Get parent's URL's param value (key=category) 
      //console.log(getQueryParams(getParentUrl()));
    
    if (getQueryParams(getParentUrl()) 
        && 'category' in getQueryParams(getParentUrl())
        && getQueryParams(getParentUrl())['category']
        && getQueryParams(getParentUrl())['category'] != "undefined"
        && getQueryParams(getParentUrl())['category'] != ""
       ){
           //console.log("category is in params");
      // Get category param value
      var service_category_URL_param = getQueryParams(getParentUrl()).category;
      
      const service_category_param_value_check = [];
      // Inactivate all tabs
      $(".tabs--item").each(function(){
        $(this).removeClass("w--current");
        if($(this).attr("category") == service_category_URL_param){
          service_category_param_value_check.push(true);
        }
        else{
          service_category_param_value_check.push(false);
        }
      });
      
      // Activate desired tab
      if(service_category_param_value_check.includes(true)){
        $(".tabs--item[category="+service_category_URL_param+"]").addClass("w--current");
        if(!$('.tabs--item.w--current').is( ':first-child' )){
          $('.tabs--menu').animate({scrollLeft: $('.tabs--item.w--current').position().left + 75}, 500);
        }
        setTimeout(function(){ reportWindowSize(); }, 1000);
      }else{
        $(".tabs--item:first-child").addClass("w--current");
      }
      
    }
    
    
    
    // ATTEMPT: open a tab via link click
    
	$("a[open-tab]").click(function(){
      
      $(".w-tab-link[id="+$(this).attr("open-tab")+"]").parent().children(".w-tab-link").each(function(){
        $(this).removeClass("w--current");
        $(this).attr("tabindex","-1");
        $(this).attr("aria-selected","false");
      });
      
      $(".w-tab-link[id="+$(this).attr("open-tab")+"]").addClass("w--current");
      $(".w-tab-link[id="+$(this).attr("open-tab")+"]").removeAttr("tabindex");
      $(".w-tab-link[id="+$(this).attr("open-tab")+"]").attr("aria-selected","true");
      if(!$('.tabs--item.w--current').is( ':first-child' )){
        $('.tabs--menu').animate({scrollLeft: $('.tabs--item.w--current').position().left + 75}, 500);
      }
      
      
      $(".w-tab-pane[aria-labelledby="+$(this).attr("open-tab")+"]").parent().children(".w-tab-pane").each(function(){
        $(this).removeClass("w--tab-active");
      });
      
      $(".w-tab-pane[aria-labelledby="+$(this).attr("open-tab")+"]").addClass("w--tab-active");
      
       
      
      
      setTimeout(function(){ reportWindowSize(); }, 1000);
         
      
      
    });
   
    
    
    
    
    
    
    
    
    
  });