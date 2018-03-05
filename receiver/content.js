function BaseContent(self) {
  self.urls = [];
  self.index = 0;
  self.status = document.getElementById('status');

  self.currentUrl = function() {
    return self.urls[self.index - 1];
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
}