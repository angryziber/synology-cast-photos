var vk = (function(self) {
  var vkToken = self.vkToken || localStorage['vkToken'];
  var input = $('[name=audio]');

  self.tokenCallback = function(token) {
    vkToken = localStorage['vkToken'] = token;
  };

  function newToken(callback) {
    window.open('https://oauth.vk.com/authorize?client_id=' + self.clientId + '&scope=audio&redirect_uri=' +
      encodeURI(location.origin + '/sender/vk-callback.html') + '&display=popup&v=5.28&response_type=token', 'width=640,height=480');
  }

  function handleError(e) {
    console.log(e);
    if (e.error_code == 6) // too many rps
      return;
    if (e.error_code == 5) // token expired
      newToken();
    else
      alert(e.error_msg);
  }

  input.on('focus', function() {
    if (!vkToken)
      newToken();
  });

  input.typeahead({hint: true, highlight: true, minLength: 5}, {
    name: 'vk-audio',
    displayKey: 'name',
    source: function (q, cb) {
      $.getJSON('https://api.vk.com/method/audio.search?q=' + q + '&access_token=' + vkToken + '&auto_complete=true&callback=?', function(data) {
        if (data.error) {
          handleError(data.error);
          return;
        }

        function cleanAudioURL(url) {
          return url.replace(/\?extra.*/, '');
        }

        function extractNameAndUrl(item) {
          return {name: item.artist + ' - ' + item.title, url: cleanAudioURL(item.url)};
        }

        data.response.shift();
        var result = $.map(data.response, extractNameAndUrl);
        result.unshift({name: 'Play all "' + q + '"', items: result.slice()});
        cb(result);
      });
    }
  });

  input.on('typeahead:selected', function(e, item) {
    var items = item.items || [item];
    $.each(items, function(i, item) {
      sender.sendAudio(item.url, item.name);
    });
  });

  $('#audio-stop').on('click', function() {
    sender.sendAudio('stop');
  });

  $('#audio-prev').on('click', function() {
    sender.sendAudio('prev');
  });

  $('#audio-next').on('click', function() {
    sender.sendAudio('next');
  });

  return self;
})(vk || {});
