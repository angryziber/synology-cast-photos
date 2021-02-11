export const keyboard = {
  toCommand(keyCode) {
    switch (keyCode) {
      case 'ArrowUp':
      case 'ArrowLeft': return 'prev'
      case 'PageUp': return 'prev:10'
      case 'ArrowDown':
      case 'ArrowRight': return 'next'
      case 'PageDown': return 'next:10'
      case 'Space': return 'pause'
      case 'F1': return 'mark:red'
      case 'F2': return 'mark:yellow'
      case 'F3': return 'mark:green'
      case 'F4': return 'mark:blue'
      case 'Digit0': return 'mark:0'
      case 'Digit1': return 'mark:1'
      case 'Digit2': return 'mark:2'
      case 'Digit3': return 'mark:3'
      case 'Digit4': return 'mark:4'
      case 'Digi5': return 'mark:5'
      case 'Delete': return 'mark:delete'
      case 'KeyM': return 'show:map'
      case 'KeyN': return 'hide:map'
    }
  },

  commandPrompt() {
    const command = prompt('Photo dir/command', location.hash ? decodeURIComponent(location.hash.substring(1)) : '')
    if (command) location.hash = '#' + command
  },

  onHammerLoaded() {
    const hammer = new Hammer(document.body)
    hammer.on('swiperight', function () {
      receiver.onCommand('prev')
    })
    hammer.on('swipeleft', function () {
      receiver.onCommand('next')
    })
    hammer.on('press', function () {
      keyboard.commandPrompt()
    })
  },

  init() {
    window.onkeydown = function (e) {
      if (e.code == 'Escape') {
        keyboard.commandPrompt()
        return
      }

      const command = keyboard.toCommand(e.code)
      if (command) {
        e.preventDefault()
        receiver.onCommand(command)
      }
    }

    const script = document.createElement('script')
    script.src = '//cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.4/hammer.min.js'
    script.onload = this.onHammerLoaded.bind(this)
    document.head.appendChild(script)
  }
}
