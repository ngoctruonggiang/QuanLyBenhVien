import { billingHandlers } from "./billing";
import { authHandlers } from "./auth";

export const handlers = [...billingHandlers, ...authHandlers];
