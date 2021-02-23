import asyncio
from aiohttp import ClientSession
import time


async def fetch(url, session):
    async with session.get(url) as response:
        return await response.read()


async def run(r, url):
    tasks = []
    async with ClientSession() as session:
        for i in range(r):
            task = asyncio.ensure_future(fetch(url, session))
            tasks.append(task)

        responses = await asyncio.gather(*tasks)
        print(responses)


def print_responses(result):
    print(result)


loop = asyncio.get_event_loop()

batch_size = 5
iterations = 5

t0 = time.time()
all_urls = [
    "http://localhost:5000/",
    "http://localhost:5000/home",
    "http://localhost:5000/api/train_student",
    "http://localhost:5000/api/generate_exam"
]
for url in all_urls:
    for idx in range(iterations):
        future = asyncio.ensure_future(run(batch_size, url))
        loop.run_until_complete(future)

t1 = time.time()
total_number_of_requests = len(all_urls) * iterations * batch_size

print(f'finished {total_number_of_requests} requests in {float(t1-t0)} seconds')
