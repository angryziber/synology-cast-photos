var sender = (function(self) {
  var input = document.querySelector('[name=prefix]')
  var random = document.querySelector('[name=random]')
  var cover = document.querySelector('[name=cover]')
  var interval = document.querySelector('[name=interval]')
  var status = document.getElementById('status')

  var accessToken = self.accessToken || localStorage['accessToken']
  if (!accessToken) {
    accessToken = prompt('Access Token (defined in backend config)')
    if (accessToken) localStorage['accessToken'] = accessToken
  }

  // input.typeahead({hint: true, highlight: true, minLength: 3}, {
  //   name: 'photo-dirs',
  //   displayKey: 'dir',
  //   source: function (dir, cb) {
  //     $.get(self.photoDirsSuggestUrl, {dir:dir, accessToken:accessToken}, function(data) {
  //       var values = data.trim().split('\n')
  //       cb($.map(values, function (value) {
  //         return {dir: value}
  //       }))
  //     })
  //   }
  // })

  chromecast.onMessage = function(ns, text) {
    var parts = text.split('|')
    if (parts.length == 1) status.textContent = text
    else status.innerHTML = '<a href="' + parts[1] + '">' + parts[0] + '</a>'
  }

  function sendCommand(cmd) {
    chromecast.message(cmd)
    status.textContent = cmd
  }

  self.sendPhotoDir = function() {
    sendCommand((random.checked ? 'rnd:' : 'seq:') + input.value)
  }

  // input.addEventListener('typeahead:selected', self.sendPhotoDir)
  input.addEventListener('keydown', e => {
    if (e.code == 'Enter') self.sendPhotoDir()
  })

  random.addEventListener('click', () => {
    sendCommand(random.checked ? 'rnd' : 'seq')
  })

  cover.addEventListener('click', () => {
    sendCommand(cover.checked ? 'style:cover' : 'style:contain')
  })

  interval.addEventListener('change', () => sendCommand('interval:' + interval.value))

  document.getElementById('prev').addEventListener('click', () => sendCommand('prev'))

  document.getElementById('next').addEventListener('click', () => sendCommand('next'))

  document.getElementById('prev-more').addEventListener('click', () => sendCommand('prev:10'))

  document.getElementById('next-more').addEventListener('click', () => sendCommand('next:10'))

  document.getElementById('pause').addEventListener('click', () => sendCommand('pause'))

  document.getElementById('photos').addEventListener('click', () => {
    sendCommand('photos:' + input.value)
    return false
  })

  document.getElementById('videos').addEventListener('click', () => {
    sendCommand('videos:' + input.value)
    return false
  })

  document.body.addEventListener('keydown', e => {
    if (e.target.tagName == 'INPUT') return

    var command = keyboard.toCommand(e.which)
    if (command) {
      e.preventDefault()
      sendCommand(command)
    }
  })

  return self
})(sender || {})
