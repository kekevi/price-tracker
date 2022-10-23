from time import sleep
from typing import OrderedDict
import re
from enum import Enum
from requests_html import HTMLSession, AsyncHTMLSession, HTML
import json
import httpx
from bs4 import BeautifulSoup
from seleniumwire import webdriver
from selenium.webdriver.common.by import By

headers = OrderedDict([ 
    ('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'),
    ('Accept-Language', 'en-US,en;q=0.5'),
    ('Accept-Encoding', 'gzip, deflate'),
    ('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'),
])

class Conditions(Enum):
    OK = "No errors found."
    MISSING_PAGE = "Page cannot be found."
    MISSING_PRICE = "Price not found."

DEFAULT_WAIT_SEC = 5

# async def parallel_find_price(url_selector_pairs : tuple[str, str]):
#     session = HTMLSession
#     session.run()
#     pass

# async def async_render_find_price(url : str, selector : str):
#     asession = AsyncHTMLSession()
#     try:
#         response = await asession.get(url, headers=headers)
#     except:
#         return (None, Conditions.MISSING_PAGE)
#     await response.html.arender()
#     print(response.html)

#     price_element = response.html.find(selector, first=True)
#     if not price_element:
#         return (None, Conditions.MISSING_PRICE)
#     price = float(re.sub(r'[^\d+(.\d\d)?]', '', price_element.text))
#     print((price, Conditions.OK))
#     return (price, Conditions.OK)

def delegate_find_price(url : str, selector : str):
    session = HTMLSession()
    try:
        response = session.get(url, headers=headers)
    except:
        return (None, Conditions.MISSING_PAGE)

    soup = BeautifulSoup(response.html.html, 'html.parser')

    # site is shopify-based
    if soup.select_one('#shopify-features'):
        price, cond = shopify_find_price(url)
        if cond == Conditions.OK:
            return (price, cond)

    # simple parse
    price_element = soup.select_one(selector)
    if price_element:
        price = float(re.sub(r'[^\d+(.\d\d)?]', '', price_element.text))
        if price:
            return (price, Conditions.OK)

    # render javascript before parsing
    response.html.render(sleep = DEFAULT_WAIT_SEC, keep_page = True)

    price_element = response.html.find(selector, first=True)
    if price_element:
        price = float(re.sub(r'[^\d+(.\d\d)?]', '', price_element.text))
        if price:
            return (price, Conditions.OK)
    
    return (None, Conditions.MISSING_PRICE)

def render_find_price(url : str, selector : str):
    session = HTMLSession()
    try:
        response = session.get(url, headers=headers)
    except:
        return (None, Conditions.MISSING_PAGE)
    response.html.render(sleep = 7, keep_page = True)
    print(response.html.html)

    price_element = response.html.find(selector, first=True)
    if not price_element:
        return (None, Conditions.MISSING_PRICE)
    price = float(re.sub(r'[^\d+(.\d\d)?]', '', price_element.text))
    return (price, Conditions.OK)


def manual_find_price(url : str, selector : str): # -> Tuple[float, Conditions]
    html = httpx.get(url, headers=headers)
    if not html:
        return (None, Conditions.MISSING_PAGE)
    print(html.text)

    soup = BeautifulSoup(html.text, 'html.parser')
    price_element = soup.select_one(selector)
    if not price_element:
        return (None, Conditions.MISSING_PRICE)
    price = float(re.sub(r'[^\d+(.\d\d)?]', '', price_element.text))
    if not price:
        return (None, Conditions.MISSING_PRICE)
    return (price, Conditions.OK)

def shopify_find_price(url : str):
    query_split = url.split('?')
    query_split[0] += '.js'
    jsonurl = '?'.join(query_split)
    data = httpx.get(jsonurl).json()
    if not data:
        return (None, Conditions.MISSING_PAGE)
    if not data['price']:
        return (None, Conditions.MISSING_PRICE)
    return (float(data['price'])/100, Conditions.OK)

def selenium_find_price(url : str, selector : str):
    options = webdriver.ChromeOptions()
    # options.add_argument('headless')
    driver = webdriver.Chrome(options=options)
    driver.get(url)
    sleep(5)
    htmlsrc = driver.page_source
    soup = BeautifulSoup(htmlsrc, 'html.parser')
    price_element = soup.select_one(selector)
    if not price_element:
        return (None, Conditions.MISSING_PRICE)
    price = float(re.sub(r'[^\d+(.\d\d)?]', '', price_element.text))
    if not price:
        return (None, Conditions.MISSING_PRICE)
    return (price, Conditions.OK)


# print(manual_find_price('https://www.walmart.com/ip/2022-Apple-10-9-inch-iPad-Wi-Fi-64GB-Silver-10th-Generation/1924288816', '[itemprop="price"]'))
# print(manual_find_price('https://www.amazon.com/Diper-%C3%96verl%C3%B6de-Diary-Wimpy-Book/dp/141976294X/?_encoding=UTF8&pd_rd_w=71Dnc&content-id=amzn1.sym.64be5821-f651-4b0b-8dd3-4f9b884f10e5&pf_rd_p=64be5821-f651-4b0b-8dd3-4f9b884f10e5&pf_rd_r=CQG8DPPYAYJW1SJMNF5Y&pd_rd_wg=WGsNF&pd_rd_r=f65c0405-f863-4723-b3df-d44c7449fdaa&ref_=pd_gw_crs_zg_bs_283155', '#price'))
# print(shopify_find_price('https://www.glossier.com/products/boy-brow'))
# print(render_find_price('https://www.target.com/p/6oz-stoneware-mini-ghost-figural-mug-hyde-38-eek-boutique-8482/-/A-85210104#lnk=sametab', '[data-test="product-price"]'))
# print(selenium_find_price('https://python.org', ''))
# print(delegate_find_price('https://www.google.com', ''))