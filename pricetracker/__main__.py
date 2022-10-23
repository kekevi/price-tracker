import json
from scrape import delegate_find_price, Conditions
from urllib.parse import urlparse
import csv
import sys

domain_database_cache = {
    'www.target.com': '[data-test="product-price"]',
    'www.sephora.com': '[data-comp="Price "] b'
}

def main():
    if len(sys.argv) <= 1:
        print("Expected argument of file path to csv.")
        exit(1)
    
    filepath = sys.argv[1]
    with open(filepath) as file:
        reader = csv.reader(file, delimiter=',')
        log = []
        next(reader, None) # skip header
        for row in reader:
            name, url, selector, *_ = row
            hostname = urlparse(url).hostname
            if not selector and hostname in domain_database_cache:
                selector = domain_database_cache[hostname]
            price, cond = delegate_find_price(url, selector)
            log.append({
                'name': name,
                'price': price,
                'message': cond.value
            })
        print(json.dumps(log))
        sys.stdout.flush()


if __name__ == '__main__':
    main()