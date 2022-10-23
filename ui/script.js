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
        optionsBox.style.visibility = 'hidden'
    } else {
        optionsBox.style.visibility = 'visible'
    }
})

function generateCard(inputName, targetPrice) {
    return htmlToElement(`
    <article class="card">
        <header>
            <div class = "priceCompPill">Above Target Price</div>
            <div id = 'priceNameHeader'>${inputName}</div>
        </header>
            <div class = "optionsLabels">
                <p id="bodyText">Current Price: </p>
                <p id="bodyText">Target Price: $${targetPrice}</p>
                <p id="bodyText">Price Delta:</p>
            </div>
        </div>
            
    </article>
    `)
}

document.getElementById('optionsConfirm').addEventListener('click', () => {
    document.getElementById('grid-container').appendChild(generateCard(inputBox.value, document.getElementById("targetPrice").value))
})