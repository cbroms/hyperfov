console.log("hi");

const awaitingCompletionQueue = {};

const getPageInfo = async (e) => {
  //   // get a given page's visits from history
  //   const visits = await browser.history.getVisits({ url: e.url });
  //   // we're only interested in the most recent entry for this page
  //   const res = visits.reduce((prev, curr) => {
  //     return prev.visitTime > curr.visitTime ? prev : curr;
  //   });
  //   console.log(res);
};

browser.webNavigation.onCompleted.addListener(async (e) => {
  // fired each time the page reloads or changes
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation/onCompleted

  // add to the page's partial data
  if (awaitingCompletionQueue[e.url]) {
    const pageEventData = { ...awaitingCompletionQueue[e.url], ...e };

    // send the data to the background worker
    console.log(pageEventData);

    // now we have the data and can delete the url from the queue
    delete awaitingCompletionQueue[e.url];
  }
});

browser.webNavigation.onCommitted.addListener((e) => {
  // fired when a respose is received and the browser is switching
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation/onCommitted

  // mark this url as waiting for completion and save partial data
  awaitingCompletionQueue[e.url] = e;
});
