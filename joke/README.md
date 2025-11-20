# Random Joke Generator (joke)

A small static single-page app that fetches random jokes from the public icanhazdadjoke API (https://icanhazdadjoke.com/).

How to run
- Open joke/index.html in a browser.
- Click "Get a joke" to fetch a joke.
- Use copy and favorite buttons. Favorites are stored in localStorage.
- Auto-refresh: set seconds and click Start to fetch periodically.

API
- Uses https://icanhazdadjoke.com/ with Accept: application/json. This API supports CORS and does not require an API key for basic usage.

Notes
- This is a simple client-only demo. If you want server-side caching or rate-limiting, I can add a small proxy server.
