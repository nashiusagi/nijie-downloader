// ==UserScript==
// @grant GM.getValue
// @grant GM.xmlHttpRequest
// ==/UserScript==

import type { GMXmlHttpRequestOptions } from "../types/GM";

export function XHR(
  request: Request,
  options?: GMXmlHttpRequestOptions,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    GM.xmlHttpRequest({
      url: request.url,
      method: "GET",
      headers: Object.fromEntries(new Headers(options?.headers).entries()),
      ...options,
      onload(res) {
        try {
          console.dir(res);
          resolve(res.response);
        } catch (e) {
          reject(e);
        }
      },
      onerror() {
        reject(new Error("load error"));
      },
    });
  });
}
