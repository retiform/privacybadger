var hasRun = false;

chrome.runtime.onConnect.addListener(
  function(port){

    port.onMessage.addListener(function(msg){
      //html for dialog window that pops up
      //TODO: i18n and templating for this.
      var dialog = '<div id="pbDialog" class="privacyBadgerDialog">' +
      '<div id="pbLogo"><img src="' + chrome.extension.getURL("icons/badger-48.png") + '"></div>'+
      '<h2>Privacy Badger Alert!</h2>' +
      '<div class="clear"></div>' +
      '<h3>Logging into ' + msg.whitelistDomain + ' can allow it to track you around the web.</h3>' +
      '<button class="pbButton default" id="allow_once">Only allow ' + msg.whitelistDomain + ' on ' + msg.currentDomain + '</button>' +
      '<button class="pbButton" id="allow_all">Always allow ' + msg.whitelistDomain + '</button>' +
      '<button class="pbButton" id="never">Continue blocking ' + msg.whitelistDomain + ' for now</button>' +
      '</div>';

      if(msg.action == "attemptWhitelist"){
        // Avoid running this dialog more than once per page, since that is
        // most likely to happen due to some horrible retry loop
        if(hasRun){ return; }
        hasRun = true;
        
        //Create a dialog box element and show it
        var body = document.getElementsByTagName('body')[0];
        var diagBox = document.createElement('div');
        diagBox.innerHTML = dialog;
        body.appendChild(diagBox);

        //add click handler to dialog buttons
        var buttons = document.getElementsByClassName("pbButton");
        for(var i =0; i < buttons.length; i++){
          var elem = buttons[i];   
          elem.addEventListener('click',function(e){
            var action = e.currentTarget.id;
            port.postMessage({action: action});

            diagBox.parentNode.removeChild(diagBox);
            for (var prop in diagBox) { delete diagBox[prop]; }
            document.removeEventListener('keydown', keypressListener);

            e.preventDefault();
          })
        }

        //keypress handlers
        var K_ENTER = 13;
        var K_TAB = 9;

        var keypressListener = function(e){
          switch(e.keyCode){
            case K_ENTER:
              e.preventDefault();
              document.getElementsByClassName("pbButton default")[0].click();
              break;
            /*case K_TAB:
              e.preventDefault();
              break;*/
            default:
              break;
          }
        };
        document.addEventListener('keydown', keypressListener);

      }
    });

  }
);
