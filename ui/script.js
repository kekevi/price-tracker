// constants
const serverURL = (path) => `http://localhost:3000${path}`

// elements
const addbutton = document.getElementById('optionsConfirm')
const urlBox = document.getElementById('url')
const optionsBox = document.getElementById('optionsBox')
const inputBox = document.getElementById('inputName')
const targetpriceBox = document.getElementById('targetPrice')
const selectorBox = document.getElementById('selector')
const cachedtime = document.getElementById('cachedtime')

// variables
let scrapedData = {}
let products = {}

// helpers

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
 function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}


function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

function objectifyScrapedData(list) {
    res = {}
    if (list) {
        list.forEach(productData => {
            const { name, price, message } = productData
            res[productData.name] = {name, price, message}
        })
    }
    return res
}

// script
const urlBoxChanger = () => {
    //alert(urlBox.value)
    if (urlBox.value == '') {
        optionsBox.style.display = 'none'
    } else {
        optionsBox.style.display = 'flex'
    }
}
urlBox.addEventListener("input", urlBoxChanger)

function generateCard(url, name, price, targetprice) {
    /*if (!url.includes('https://') && !url.includes('http://')) {
        url = 'http://' + url;
    }*/

    if (price < targetprice) {
        var isDeal = true
    }

    const card = htmlToElement(`
    <article class="card">
        <header>
        </header>
            <div class = "priceCardFlex">
                <button class = "deleteButton" name="${name}">×</button>
                <p id = "priceNameHeader"><a href="${url}">${name}</a></p>
                <p class="bodyText ${isDeal ? "isDeal" : ''}">Current Price: $<span>${price === undefined ? 'Please Refresh' : price}</span></p>
                <p class="bodyText">Target Price: $${targetprice}</p>
            </div>
        </div>
    </article>
    `)

    card.addEventListener('click', async () => {
        let res = await fetch(serverURL('/remove/' + name))
        res = await res.json()
        products = res
        refreshCards()
    })

    return card
}

// document.getElementById('optionsConfirm').addEventListener('click', () => {
//     document.getElementById('grid-container').appendChild(generateCard(urlBox.value, inputBox.value, document.getElementById("targetPrice").value))
// })

// generate all cards based on the products 
const refreshCards = () => {
    const deck = document.getElementById('grid-container')
    while (deck.firstChild) {
        deck.removeChild(deck.firstChild);
    }
    Object.keys(products).forEach(name => deck.appendChild(generateCard(products[name]?.url, name, scrapedData[name]?.price, products[name]?.targetprice)))
}

document.getElementById('load-btn').addEventListener('click', async () => {
    let res = await fetch(serverURL('/load'))
    res = await res.json()
    products = res
    refreshCards()
})

document.getElementById('store-btn').addEventListener('click', async () => {
    let res = await fetch(serverURL('/store'))
    res = await res.json()
    if (res === false) {
        alert('Unable to store. See server logs.')
    }
})

const cachedButton = document.getElementById('cached-btn')
cachedButton.addEventListener('click', async () => {
    let res = await fetch(serverURL('/cached'))
    res = await res.json()
    if (res === false) {
        alert('Nothing in cache, please hit the black Refresh button.')
    }
    scrapedData = objectifyScrapedData(res)
    refreshCards()

    let time = await fetch(serverURL('/cachedtime'))
    time = await time.json()
    if (time === false) {
        cachedtime.innerText = 'n/a'
    } else {
        cachedtime.innerText = time
    }
})

document.getElementById('refresh-btn').addEventListener('click', async () => {
    let res = await fetch(serverURL('/refresh'))
    res = await res.json()
    if (res === false) {
        alert('Received a parse error. See server logs.')
        return
    }
    scrapedData = objectifyScrapedData(res)
    refreshCards()

    let time = await fetch(serverURL('/cachedtime'))
    time = await time.json()
    if (time === false) {
        cachedtime.innerText = 'n/a'
    } else {
        cachedtime.innerText = time
    }
})

const resetOptionsBox = () => {
    urlBox.value = ''
    urlBoxChanger()
    targetpriceBox.value = ''
    inputBox.value = ''
    selectorBox.value = ''
}

addbutton.addEventListener('click', async () => {
    const url = urlBox.value
    if (!isValidHttpUrl(url)) {
        alert('Invalid http(s) url. Please make sure to include the http(s):// scheme.')
        return
    }
    const name = inputBox.value
    if (!name) {
        alert('Please insert a name.')
        return
    }
    const targetprice = Number(targetpriceBox.value)
    const selector = selectorBox.value
    let res = await fetch(serverURL(`/add`), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            url,
            targetprice,
            selector
        })
    })
    res = await res.json()
    products = res
    refreshCards()
    resetOptionsBox()
})

// initial script
fetch(serverURL('/currentProducts')).then(async res => {
    products = await res.json()
    cachedButton.click()
})