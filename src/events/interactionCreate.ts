import { type Interaction } from "discord.js";
import type AntiPolls from "../utils/client.ts";

export const raw = false;
export const type = "interactionCreate";

export function run(client: AntiPolls, data: Interaction) {
    if (data.isCommand()) {
        const command = client.commands.get(data.commandName);

        if (!command) return;

        command.execute(client, data);

        return;
    }
}