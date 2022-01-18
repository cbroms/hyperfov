const background = 'http://localhost:5454'
const awaitingCompletionQueue = {}

const state = {
    connected: false,
    retryConnectionIn: 0,
}

const post = async (path, data) => {
    // post request to background worker
    try {
        const res = await fetch(`${background}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        return res
    } catch {
        return { ok: false }
    }
}

const get = async (path) => {
    try {
        const res = await fetch(`${background}${path}`)
        return res
    } catch {
        return { ok: false }
    }
}

const getPageInfo = async (e) => {
    //   // get a given page's visits from history
    //   const visits = await browser.history.getVisits({ url: e.url });
    //   // we're only interested in the most recent entry for this page
    //   const res = visits.reduce((prev, curr) => {
    //     return prev.visitTime > curr.visitTime ? prev : curr;
    //   });
    //   console.log(res);
}

const setupListeners = async () => {
    /*
    NAVIGATION LISTENERS
    */
    browser.webNavigation.onCompleted.addListener(async (e) => {
        // fired each time the page reloads or changes
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation/onCompleted

        // add to the page's partial data
        if (awaitingCompletionQueue[e.url]) {
            const pageEventData = { ...awaitingCompletionQueue[e.url], ...e }

            // send the data to the background worker
            console.log(`HYPERFOV >> logging visit to ${e.url}`)
            await post(`/visit/${encodeURIComponent(e.url)}`, pageEventData)

            // now we have the data and can delete the url from the queue
            delete awaitingCompletionQueue[e.url]
        }
    })

    browser.webNavigation.onCommitted.addListener((e) => {
        // fired when a respose is received and the browser is switching
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webNavigation/onCommitted

        // mark this url as waiting for completion and save partial data
        awaitingCompletionQueue[e.url] = e
    })

    /* 
    TABS LISTENERS 
    */
    browser.tabs.onCreated.addListener(async (e) => {
        console.log(`HYPERFOV >> logging new tab ${e.id}`)
        await post(`/tabs/new`, e)
    })

    browser.tabs.onActivated.addListener(async (e) => {
        console.log(`HYPERFOV >> logging tab ${e.id} active`)
        await post(`/tabs/active`, e)
    })

    // get the current page's tab state
    console.log(`HYPERFOV >> logging tab state`)
    const tabs = await browser.tabs.query({})
    await post(`/tabs/all`, tabs)
}

const setupHyperfov = async () => {
    // handshake with background to make sure everything's setup
    const res = await get(`/handshake`)

    if (res.ok) {
        console.log('HYPERFOV >> connected to background worker')

        // we're connected, setup the listeners
        state.connected = true
        await setupListeners()
        console.log('HYPERFOV >> extension set up')
    } else {
        // the connection failed, try again in a little bit
        if (state.retryConnectionIn < 30) state.retryConnectionIn += 5
        console.log(
            `HYPERFOV >> cannot connect to background worker, trying again in ${state.retryConnectionIn}s`
        )
        setTimeout(
            async () => await setupHyperfov(),
            state.retryConnectionIn * 1000
        )
    }
}

setupHyperfov()
