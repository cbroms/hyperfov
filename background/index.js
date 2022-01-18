const express = require('express')
const cors = require('cors')

const session = require('./database/session')

const app = express()
const port = 5454

app.use(express.json())
app.use(cors())

app.post('/visit/:url', (req, res) => {
    session.visitPage(req.params.url, req.body)
    res.send(200)
})

app.post('/tabs/all', (req, res) => {
    session.newSession(req.body)
    res.send(200)
})

app.post('/tabs/new', (req, res) => {
    session.addTab(req.body)
    res.send(200)
})

app.post('/tabs/active', (req, res) => {
    session.changeTab(req.body)
    res.send(200)
})

app.get('/handshake', (req, res) => {
    res.send({ result: 'Hello World!' })
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
