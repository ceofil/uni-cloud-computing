# opentdb

https://opentdb.com/api.php?amount=10&type=boolean

### Generating an examn with 10 yes or no questions.

GET /api/generate_exam

# yesno

https://yesno.wtf/api

### The student will use this API in the process of solving the exam. The API returns yes or no randomly.

GET /api/train_student

# jsonbin (requires API key)

https://api.jsonbin.io/

### Client makes a post request to this route in order to obtain a link with the exam results.

POST /api/submit_results

## paralell request functions

https://pawelmhm.github.io/asyncio/python/aiohttp/2016/04/22/asyncio-aiohttp.html
