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
  }
};
