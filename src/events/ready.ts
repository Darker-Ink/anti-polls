import type AntiPolls from "../utils/client.ts";

export const raw = false;
export const type = "ready";

export function run(client: AntiPolls) {
    console.log(`Logged in as ${client.user?.username}!`);
}