import { paraglideMiddleware } from "@/paraglide/server.js";

const handlerPromise = import("@tanstack/react-start/server-entry");

export default {
  async fetch(request: Request): Promise<Response> {
    const { default: handler } = await handlerPromise;
    return paraglideMiddleware(request, () => handler.fetch(request));
  },
};
