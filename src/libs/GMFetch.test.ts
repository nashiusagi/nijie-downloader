import { test, expect } from "vitest";
import { Buffer } from "buffer";
import GMFetch from "./GMFetch";

test("call", async () => {
  // @ts-ignore
  let realCall: GM.Request | undefined;
  const xmlHttpRequest = (option) => {
    realCall = option;
    setTimeout(() => {
      option?.onload?.({
        responseHeaders:
          "origin: example.com\r\ndate: Tue, 22 Nov 2022 15:59:43 GMT",
        responseText: "test",
        status: 200,
        responseXML: false,
        statusText: "",
        response: new Blob([Buffer.from("test", "utf8")]),
        context: undefined,
      });
    });
  };

  // @ts-ignore
  globalThis.GM = {
    xmlHttpRequest,
  };

  const res = await GMFetch("https://example.com", { method: "GET" });

  console.dir(res);
  expect(await res.text()).toBe("test");
  expect(realCall?.method).toBe("GET");
});
