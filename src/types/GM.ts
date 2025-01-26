export interface GMXmlHttpRequestOptions {
  method?: string;
  user?: string;
  password?: string;
  overrideMimeType?: string;
  headers?: HeadersInit;
  responseType?: string;
  timeout?: number;
  data?: string | ArrayBuffer | Blob | DataView | FormData | URLSearchParams;
  binary?: boolean;
  content?: unknown;
  anonymous?: boolean;
}
