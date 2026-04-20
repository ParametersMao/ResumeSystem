declare module 'pagedjs' {
  interface PagedJSOptions {
    before?: () => void;
    after?: () => void;
    content?: string;
    styles?: string[];
    scripts?: string[];
    [key: string]: any;
  }

  interface PagedJSResult {
    buffered: boolean;
    pages: any[];
    styles: any[];
    [key: string]: any;
  }

  class PagedJS {
    constructor(options?: PagedJSOptions);
    preview(content: string, options?: PagedJSOptions): Promise<PagedJSResult>;
    render(content: string, options?: PagedJSOptions): Promise<PagedJSResult>;
  }

  export default PagedJS;
  export { PagedJS, PagedJSOptions, PagedJSResult };
}
