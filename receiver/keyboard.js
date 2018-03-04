var keyboard = {
  toCommand: function(keyCode) {
    switch (keyCode) {
      case 37:
      case 38:
        return 'prev';
      case 33:
        return 'prev:10';
      case 39:
      case 40:
        return 'next';
      case 34:
        return 'next:10';
      case 32:
        return 'pause';
      case 112: // F1
        return 'mark:red';
      case 113: // F2
        return 'mark:yellow';
      case 114: // F3
        return 'mark:green';
      case 115: // F4
        return 'mark:blue';
      case 48:
        return 'mark:0';
      case 49:
        return 'mark:1';
      case 50:
        return 'mark:2';
      case 51:
        return 'mark:3';
      case 52:
        return 'mark:4';
      case 53:
        return 'mark:5';
      case 46: // Del
        return 'mark:delete';
    }
  },

  commandPrompt: function() {
    var command = prompt('Photo dir/command', location.hash ? location.hash.substring(1) : '');
    if (command) location.hash = '#' + command;
  },

  onHammerLoaded: function () {
    var hammer = new Hammer(document.body);
    hammer.on('swiperight', function () {
      receiver.onCommand('prev');
    });
    hammer.on('swipeleft', function () {
      receiver.onCommand('next');
    });
    hammer.on('press', function () {
      keyboard.commandPrompt();
    });
  },

  init: function() {
    window.onkeydown = function (e) {
      if (e.which == 27) {
        keyboard.commandPrompt();
        return;
      }

      var command = keyboard.toCommand(e.which);
      if (command) {
        e.preventDefault();
        receiver.onCommand(command);
      }
    };

    document.write('<script src="//cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.4/hammer.min.js" onload="keyboard.onHammerLoaded()"></script>');
  }
};
