const session = {
    graph: {
        nodes: {},
        actions: {},
        curNode: null,
    },
}

const ACTIONS = {
    FL_NT: 1, // follow link in new tab
    FL_ST: 2, // follow link in same tab
    BK: 3, // back arrow
    FW: 4, // forward arrow
    GE: 5, // generated link
    DI: 6, // direct to link
}

const componentsToKey = (url, tabId) => {
    return `${tabId}_${url}`
}

const keyToComponents = (key) => {
    const pieces = key.split('_')
    return { tabId: pieces[0], url: pieces[1] }
}

const newSession = (tabs) => {
    for (const tab of tabs) {
        console.log('HYPERFOV >> existing tab')

        const key = componentsToKey(tab.url, tab.id)

        if (tab.active) session.graph.curNode = key

        // add the page without a source (infer this later?)
        session.graph.nodes[key] = {
            url: tab.url,
            tab: tab.id,
            tabSequence: 0,
            exists: true,
        }

        // add an array to populate each of the tabs' actions
        session.graph.actions[tab.id] = []
    }
}

const addTab = (tab) => {
    console.log('HYPERFOV >> opened tab')
    const key = componentsToKey(tab.url, tab.id)

    session.graph.nodes[key] = {
        url: tab.url,
        tab: tab.id,
        tabSequence: 0,
        exists: true,
    }

    session.graph.actions[tab.id] = []
}

const changeTab = (tab) => {
    console.log('HYPERFOV >> changed tab activation')

    // find the node with this id that exists
    for (const key in session.graph.nodes) {
        if (
            key.split('_')[0] === tab.tabId &&
            session.graph.nodes[key].exists
        ) {
            session.graph.curNode = key
        }
    }
    // console.log(session)
}

const visitPage = (url, page) => {
    const validTransitionTypes = ['link', 'generated', 'typed']

    if (validTransitionTypes.includes(page.transitionType)) {
        console.log('HYPERFOV >> visited page')
        console.log(page)

        const key = componentsToKey(url, page.tabId)
        const action = { origin: session.graph.curNode, dest: key }

        if (page.transitionQualifiers.includes('forward_back')) {
            // the page already exists as a node; move the current position back to that node
            // note that the curNode's tabId must be equal to this page's tabId if back/forward was pressed
            // since those buttons only apply to the active tab

            // determine if this was a back/forward move
            const lastMove =
                session.graph.actions[page.tabId][
                    session.graph.actions[page.tabId].length - 1
                ]
            // it's a backward move if the last move for this tab was moving origin: key -> dest: curNode
            // it's a forward move otherwise
            if (
                lastMove.origin === key &&
                lastMove.dest === session.graph.curNode
            ) {
                // backward
                session.graph.actions[page.tabId].push({
                    action: BK,
                    ...action,
                })
            } else {
                // forward
                session.graph.actions[page.tabId].push({
                    action: FW,
                    ...action,
                })
            }

            // set the curNode to no longer exist as the page was wiped out
            session.graph.nodes[session.graph.curNode].exists = false
            // move the curNode key back/forward to the existing node
            session.graph.curNode = key
            // activate this existing node again
            session.graph.nodes[key].exists = true
        } else {
            // this is a new node; add it
            session.graph.nodes[key] = {
                url,
                tab: page.tabId,
                exists: true,
            }

            // get the curNode's tab id
            const curNode = keyToComponents(session.graph.curNode)

            // check if the page opened in a new tab or the same
            if (page.tabId === curNode.tabId) {
                // the active tabId and the new tabId are the same; this page wiped out the old one
                // set the old page node to no longer exist
                session.graph.nodes[session.graph.curNode].exists = false
                // set the new curNode to be this page
                session.graph.curNode = key

                if (page.transitionType === 'link')
                    session.graph.actions[page.tabId].push({
                        action: ACTIONS.FL_ST,
                        ...action,
                    })
                else if (page.transitionType === 'typed')
                    session.graph.actions[page.tabId].push({
                        action: ACTIONS.DI,
                        ...action,
                    })
                else if (page.transitionType === 'generated')
                    session.graph.actions[page.tabId].push({
                        action: ACTIONS.GE,
                        ...action,
                    })
            } else {
                // the new tabId is different than the old; this page was opened in a new tab
                session.graph.actions[page.tabId].push({
                    action: ACTIONS.FL_NT,
                    ...action,
                })
            }
        }
    }
}

module.exports = {
    newSession,
    addTab,
    changeTab,
    visitPage,
}
