chrome.commands.onCommand.addListener(function(command) {
  if (command === 'helloworld') {
    // chrome.tabs.create({ url: 'https://www.github.com' });
    chrome.windows.create({ url: 'https://www.github.com', incognito: true });

  }
});
