import { EmbedBuilder, CommandInteraction, PermissionFlagsBits } from "discord.js";
import type AntiPolls from "../utils/client.ts";

export const name = "ping";
export const description = "Replies with the ping";
export const defaultMemberPermissions = PermissionFlagsBits.ManageMessages;
export const options = [];

export async function execute(client: AntiPolls, interaction: CommandInteraction) {
    const msg = await interaction.reply({
        content: "Pinging...",
        ephemeral: true
    });

    const embed = new EmbedBuilder()
        .setTitle("Pong!")
        .setDescription(`Latency is ${msg.createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms.`)
        .setColor("#00FF00");

    interaction.editReply({
        content: null,
        embeds: [embed]
    });
}