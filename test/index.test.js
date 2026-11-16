import { test } from "node:test"
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import known, {
  createClient, ENDPOINTS, DEFAULT_ENDPOINT, expandEndpoint, aliasOf, resolveEndpoint, Result, MethodryError
} from "../src/index.js"

// A fetch that records what was asked and answers one JSON-RPC result.
function recorder(result = { ok: true }) {
  const calls = []
  const fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init })
    const id = JSON.parse(init.body).id
    return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
      status: 200,
      headers: { "content-type": "application/json" }
    })
  }
  return { calls, fetch }
}

test("calls production when no endpoint is given", async () => {
  const { calls, fetch } = recorder()
  const [refused, response] = await known("tok", { fetch }).system.ping()
  assert.equal(refused, null)
  assert.deepEqual(response, { ok: true })
  assert.equal(calls[0].url, "https://api.known.info/rpc")
  assert.equal(new Headers(calls[0].init.headers).get("authorization"), "Bearer tok")
})

test("an endpoint is named", async () => {
  const { calls, fetch } = recorder()
  await known("tok", { endpoint: "staging", fetch }).system.ping()
  assert.equal(calls[0].url, ENDPOINTS.staging + "/rpc")
})

test("an endpoint is given as a URL", async () => {
  const { calls, fetch } = recorder()
  await known("tok", { endpoint: "http://127.0.0.1:9999", fetch }).system.ping()
  assert.equal(calls[0].url, "http://127.0.0.1:9999/rpc")
})

test("a name that is only an object property is not an environment", () => {
  assert.equal(expandEndpoint("constructor"), "constructor")
  assert.equal(expandEndpoint("toString"), "toString")
})

test("names and URLs resolve both ways", () => {
  assert.equal(DEFAULT_ENDPOINT, ENDPOINTS.prod)
  assert.equal(expandEndpoint("prod"), ENDPOINTS.prod)
  assert.equal(expandEndpoint("https://example.test"), "https://example.test")
  assert.equal(expandEndpoint(undefined), undefined)
  assert.equal(resolveEndpoint(undefined), ENDPOINTS.prod)
  assert.equal(resolveEndpoint("dev"), ENDPOINTS.dev)
  assert.equal(aliasOf(ENDPOINTS.staging), "staging")
  assert.equal(aliasOf("https://example.test"), null)
  assert.throws(() => { ENDPOINTS.prod = "https://elsewhere.test" }, TypeError)
})

test("the default export is createClient, and methodry's types come with it", () => {
  assert.equal(known, createClient)
  assert.equal(typeof Result, "function")
  assert.equal(typeof MethodryError, "function")
})

test("the built CommonJS file answers require", async () => {
  const require = createRequire(import.meta.url)
  const cjs = require("../dist/index.cjs")
  assert.equal(typeof cjs.createClient, "function")
  assert.equal(cjs.default, cjs.createClient)
  assert.deepEqual({ ...cjs.ENDPOINTS }, { ...ENDPOINTS })
  const { calls, fetch } = recorder()
  await cjs.createClient("tok", { fetch }).system.ping()
  assert.equal(calls[0].url, "https://api.known.info/rpc")
})
