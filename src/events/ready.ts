import type AntiPolls from "../utils/client.ts";

export const raw = false;
export const type = "ready";

export async function run(client: AntiPolls) {
    console.log(`Logged in as ${client.user?.username}!`);

    if (!(await client.redis.get("stats"))) {
        await client.redis.set("stats", "0");
    }
}