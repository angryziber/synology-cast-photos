import {keyboard} from './keyboard.js'

export function Receiver(content) {
  if (navigator.userAgent.indexOf('CrKey') >= 0)
    initAsReceiver.call(this) // running under Chromecast - receive commands from Chromecast senders
  else
    initAsStandalone.call(this) // running as standalone web page - take commands from location hash

  window.onhashchange = () => {
    if (location.hash) this.onCommand(decodeURIComponent(location.hash.substring(1)))
  }
  setTimeout(onhashchange)

  function initAsReceiver() {
    const receiverManager = cast.receiver.CastReceiverManager.getInstance()
    const supports4k = receiverManager.canDisplayType('video/mp4', 'hev1.1.2.L150', 3840, 2160)
    console.log('4k: ' + supports4k, receiverManager.canDisplayType('video/mp4', 'hev1.1.2.L150', 3840, 2160))
    content.init4k(supports4k, supports4k && 3840, supports4k && 2160)

    this.messageBus = receiverManager.getCastMessageBus('urn:x-cast:message')
    this.messageBus.onMessage = e => this.onCommand(e.data)

    receiverManager.onSenderConnected = e => this.messageBus.send(e.senderId, 'state:' + JSON.stringify(content.state))

    const castConfig = new cast.receiver.CastReceiverManager.Config()
    castConfig.maxInactivity = 60000
    receiverManager.start(castConfig)
  }

  function initAsStandalone() {
    content.init4k(innerHeight * devicePixelRatio > 1080)
    keyboard.init()
  }

  this.broadcast = message => {
    if (this.messageBus) this.messageBus.broadcast(message)
  }

  this.onCommand = command => {
    let pos = command.indexOf(':')
    if (pos == -1) pos = command.length
    const [cmd, arg] = [command.substring(0, pos), command.substring(pos + 1)]
    let title = command

    if (cmd == 'url') {
      // allow switching of receiver to custom/local NAS
      if (!location.href.startsWith(arg)) location.href = arg
      return
    }
    else if (cmd == 'rnd') {
      if (arg) content.loadUrlsAndShow(arg, true)
      else content.random()
    }
    else if (cmd == 'seq') {
      if (arg) content.loadUrlsAndShow(arg, false)
      else content.sequential()
    }
    else if (cmd == 'interval') {
      content.state.interval = parseInt(arg)
      title = 'Interval: ' + arg + 's'
    }
    else if (cmd == 'mode') content.changeMode(arg)
    else if (cmd == 'style') content.changeStyle(arg)
    else if (cmd == 'show') content.show(arg)
    else if (cmd == 'hide') content.hide(arg)
    else if (cmd == 'prev') content.prev(arg)
    else if (cmd == 'next') content.next(arg)
    else if (cmd == 'pause') content.pause()
    else if (cmd == 'mark') content.mark(arg)
    else if (cmd == 'photos' || cmd == 'videos') {
      // backwards-compatibility with Android app
      content.show(cmd)
      this.onCommand(arg)
    }
    else content.loadUrlsAndShow(cmd)

    if (title) {
      content.title(title)
      this.broadcast(title)
    }
  }
}
