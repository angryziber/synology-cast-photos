function BaseContent(self) {
  self.urls = [];
  self.index = 0;
  self.status = document.getElementById('status');
  self.supports4k = undefined;

  self.loadUrls = function(dir, random) {
    fetch(self.listUrl + '?dir=' + encodeURIComponent(dir)).then(res => {
      if (res.ok) return res.text();
      else throw new Error(res.status);
    }).then(result => {
      self.urls = result.trim().split('\n');
      self.urlsRandom = self.urlsSequential = null;
      if (random) self.random(); else self.sequential();
      self.title((random ? 'Random: ' : 'Sequential: ') + dir);
      self.index = 1;
      self.loadCurrent();
    }, e => self.title(e));
  };

  self.currentUrl = function() {
    return self.urls[self.index - 1];
  };

  self.nextUrl = function() {
    return self.urls[self.index];
  };

  self.random = function() {
    updateIndex(self.currentUrl(), self.urlsRandom || (self.urlsRandom = shuffle(self.urls.slice())));
  };

  self.sequential = function() {
    updateIndex(self.currentUrl(), self.urlsSequential || (self.urlsSequential = self.urls.slice().sort()));
  };

  function updateIndex(currentUrl, newUrls) {
    if (currentUrl) self.index = newUrls.indexOf(currentUrl) + 1;
    self.urls = newUrls;
    if (self.status)
      self.status.textContent = self.index + '/' + self.urls.length;
  }

  self.prev = function(by) {
    self.index -= parseInt(by || 1);
    if (self.index <= 0) self.index = self.urls.length;
    setTimeout(self.loadCurrent, 0);
  };

  self.next = function(by) {
    self.index += parseInt(by || 1);
    if (self.index > self.urls.length) self.index = 1;
    setTimeout(self.loadCurrent, 0);
  };
}