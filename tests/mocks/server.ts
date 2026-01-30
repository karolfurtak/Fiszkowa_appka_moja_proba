import { setupServer } from "msw/node";
import { openRouterHandlers } from "./openrouter";
import { supabaseHandlers } from "./supabase";

export const server = setupServer(...openRouterHandlers, ...supabaseHandlers);
