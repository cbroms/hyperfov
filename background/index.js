const express = require('express')
const cors = require('cors')
const app = express()
const port = 5454

app.use(express.json())
app.use(cors())

app.post('/visit/:url', (req, res) => {
    console.log(req.params.url)
    console.log(req.body)
    res.send(200)
})

app.post('/tabs/all', (req, res) => {
    console.log(req.body)
    res.send(200)
})

app.post('/tabs/new', (req, res) => {
    console.log(req.body)
    res.send(200)
})

app.get('/handshake', (req, res) => {
    res.send({ result: 'Hello World!' })
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})
