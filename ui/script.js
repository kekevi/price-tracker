const urlBox = document.getElementById('url')
const optionsBox = document.getElementById('optionsBox')
const inputBox = document.getElementById('inputName')

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

urlBox.addEventListener("input", () => {
    //alert(urlBox.value)
    if (urlBox.value == '') {
        optionsBox.style.display = 'none'
    } else {
        optionsBox.style.display = 'flex'
    }
})

function generateCard(url, inputName, targetPrice) {
    if (!url.includes('https://') && !url.includes('http://')) {
        url = 'http://' + url;
    }

    return htmlToElement(`
    <article class="card">
        <header>

        </header>
            <div class = "priceCardFlex">
                <div id = 'priceNameHeader'><a href="${url}">${inputName}</a></div>
                <p id="bodyText">Current Price: </p>
                <p id="bodyText">Target Price: $${targetPrice}</p>
            </div>
        </div>
    </article>
    `)
}

document.getElementById('optionsConfirm').addEventListener('click', () => {
    document.getElementById('grid-container').appendChild(generateCard(urlBox.value, inputBox.value, document.getElementById("targetPrice").value))
})