import AntiPolls from "./utils/client.ts";

const client = new AntiPolls();

client.login(process.env.DISCORD_TOKEN)