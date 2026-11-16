/**
 * known-sdk — the Known API client.
 *
 * It is methodry with the address set: a call goes to Known without the
 * caller saying where Known is.
 *
 *   import known from "@future-unknown/known-sdk"
 *
 *   const api = known(token)
 *   const [refused, me] = await api.auth.whoami()
 *
 * Another environment is named, or given as a URL:
 *
 *   known(token, { endpoint: "staging" })
 *   known(token, { endpoint: "http://localhost:8786" })
 *
 * Every other option is methodry's and passes through unchanged
 * (`reauthenticate`, `onToken`, `headers`, `fetch`, `timeout`, …), as do the
 * method sugar, `call()`, batching, streaming, uploads and the result model.
 */
import { createClient as methodry, Result, MethodryError } from "@future-unknown/methodry"

// The named environments. A name is accepted anywhere an endpoint is.
export const ENDPOINTS = Object.freeze({
  prod: "https://api.known.info",
  staging: "https://api.knowninfo.xyz",
  dev: "http://localhost:8786"
})

// Where a client calls when no endpoint is given.
export const DEFAULT_ENDPOINT = ENDPOINTS.prod

// A name becomes its URL; anything else is taken to be a URL already.
export function expandEndpoint(ref) {
  if (!ref) return ref
  return Object.prototype.hasOwnProperty.call(ENDPOINTS, ref) ? ENDPOINTS[ref] : ref
}

// The name of a URL, or null when it is not a named environment.
export function aliasOf(url) {
  return Object.keys(ENDPOINTS).find((name) => ENDPOINTS[name] === url) || null
}

// The URL a client would call for an endpoint option: the one named or
// given, else the default.
export function resolveEndpoint(ref) {
  return expandEndpoint(ref) || DEFAULT_ENDPOINT
}

export function createClient(token, opts = {}) {
  const { endpoint, ...rest } = opts || {}
  return methodry(resolveEndpoint(endpoint), token, rest)
}

export { Result, MethodryError }
export default createClient
