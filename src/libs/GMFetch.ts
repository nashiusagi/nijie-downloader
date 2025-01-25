import { XHR } from "./XHR";
import type { GMXmlHttpRequestOptions } from "../types/GM";

export default async function GMFetch(
  input: RequestInfo | URL,
  options?: GMXmlHttpRequestOptions,
): Promise<Response> {
  const request = new Request(input, options);

  return await XHR(request, options);
}
