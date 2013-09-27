chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    id: 'mainWindow',
    bounds: {
      width: 1280,
      height: 1000
    }
  });
});