# known-sdk

The client for the [Known](https://known.info) API. It is
[methodry](https://www.npmjs.com/package/@future-unknown/methodry) with the
address set: you make calls to Known without saying where Known is.

```bash
npm install @future-unknown/known-sdk
```

```js
import known from "@future-unknown/known-sdk"

const api = known(token)

const [refused, me] = await api.auth.whoami()
if (refused) console.error(refused.message)
else console.log(me)
```

CommonJS works the same way:

```js
const { createClient } = require("@future-unknown/known-sdk")
const api = createClient(token)
```

It runs in browsers and in Node 18 or later.

## Endpoints

A client calls production unless told otherwise. Another environment is named,
or given as a URL:

```js
known(token, { endpoint: "staging" })
known(token, { endpoint: "http://localhost:8786" })
```

| Name | Address |
|---|---|
| `prod` (default) | `https://api.known.info` |
| `staging` | `https://api.knowninfo.xyz` |
| `dev` | `http://localhost:8786` |

The same table is exported, with helpers for moving between names and URLs:

```js
import { ENDPOINTS, DEFAULT_ENDPOINT, expandEndpoint, aliasOf, resolveEndpoint } from "@future-unknown/known-sdk"

expandEndpoint("staging")               // "https://api.knowninfo.xyz"
aliasOf("https://api.known.info")       // "prod"
resolveEndpoint(undefined)              // "https://api.known.info"
```

## Options

`endpoint` is the only option known-sdk adds. Everything else is methodry's and
passes through unchanged:

```js
const api = known(token, {
  reauthenticate: async () => freshToken(),   // called once on a 401, then the call is retried
  onToken: (token) => save(token),
  timeout: 10_000
})
```

Method calls (`api.wiki.read({ … })`), `api.call("wiki.read", { … })`, batching,
streaming, uploads and the result model are methodry's too. A call resolves to
a `Result` that reads as `[refused, response]`; only a `MethodryError` (the
network failed, or the token could not be renewed) is thrown. Both are exported
from this package. See the methodry README for the full list.

## Development

```bash
npm install
npm test
```

`src/index.js` is the whole package. `npm run build` writes the ES module and
CommonJS files to `dist/`, and runs on install and before publishing.
