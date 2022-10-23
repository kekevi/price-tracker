const express = require('express')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const cors = require('cors')

const PORT_NUM = 3000
const PYTHON_EXEC = "/Users/siraire/.pyenv/versions/miniforge3/bin/python"
const SCRAPER_PATH = "/Users/siraire/Code/price-tracker/pricetracker/__main__.py"
const DEFAULT_CSV = "/Users/siraire/Code/price-tracker/track.csv"
// const SCRAPER_PATH = "/Users/siraire/Code/price-tracker/pricetracker/test.py"

const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

let scraperData = null
let lastScraped = null
let products = {}

// loads `products` from a csv
app.get('/load', (req, res) => {
  // const filepath = req.body.path
  const filepath = DEFAULT_CSV
  // fs.createReadStream(path.resolve(__dirname, filepath))
  //   .pipe(csv.parse({ headers: true }))
  //   .on('error', error => console.error(error))
  //   .on('data', row => {
  //     console.log(row)
  //   })
  //   .on('end', rowCount => console.log('parsed', rowCount, 'rows.'))
  const input = fs.readFileSync(path.resolve(__dirname, filepath))
  const rows = parse(input, {columns: true, relax_quotes: true, skip_empty_lines: true, escape: '\\'})
  products = {}
  rows.forEach(row => products[row.name] = ({
    name: row.name, 
    url: row.url,
    targetprice: row.targetprice,
    selector: row.selector
  }))

  // res.json(true)
  res.json(products)
})

// stores current `products` into the csv
app.get('/store', (req, res) => {
  const filepath = DEFAULT_CSV
  const writer = createCsvWriter({
    path: filepath,
    header: [
      {id: 'name', title: 'name'},
      {id: 'url', title: 'url'},
      {id: 'selector', title: 'selector'},
      {id: 'targetprice', title: 'targetprice'}
    ]
  })
  writer
    .writeRecords(Object.keys(products).map(key => products[key]))
    .then(() => res.json(true))
    .catch((e) => res.send(e))
})

app.get('/currentProducts', (req, res) => {
  res.json(products)
})

// add a new product to track, if name already exists, it'll replace it
app.post('/add', (req, res) => {
  const {name, url, targetprice, selector} = req.body
  products[name] = {name, url, targetprice, selector}
  res.json(products)
})

// remove a new product
app.get('/remove/:name', (req, res) => {
  const name = req.params.name
  delete products[name]
  res.json(products)
})

// get last scrape time
app.get('/cachedtime', (req, res) => {
  if (lastScraped) {
    res.json(lastScraped.toString())
  } else {
    res.json(false)
  }
})

// get last scraped prices
app.get('/cached', (req, res) => {
  if (scraperData) {
    res.json(scraperData)
  } else {
    res.json(false)
  }
})

// scrape again
app.get('/refresh', (req, res) => {
  // const filepath = req.body.path
  const filepath = DEFAULT_CSV

  const python = spawn(PYTHON_EXEC, [SCRAPER_PATH, path.resolve(__dirname, filepath)])
  python.stdout.on('data', (data) => {
    scraperData = JSON.parse(data.toString())
    lastScraped = new Date()
    console.log(scraperData)
    res.json(scraperData)
  })
  python.stderr.on('data', (data) => {
    console.error('error:', data.toString())
    res.json(false)
  })
})

const listener = app.listen(PORT_NUM, () => {
  console.log(`Server started on port ${listener.address().port}`)
})