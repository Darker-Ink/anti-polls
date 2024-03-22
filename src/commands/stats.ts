import { EmbedBuilder, CommandInteraction, PermissionFlagsBits } from "discord.js";
import type AntiPolls from "../utils/client.ts";

export const name = "stats";
export const description = "See how many polls have  been deleted in your server so far";
export const defaultMemberPermissions = PermissionFlagsBits.ManageMessages;
export const options = [];

export async function execute(client: AntiPolls, interaction: CommandInteraction) {
    const stats = await client.redis.get(`stats:${interaction.guildId}`);
    const overallStats = await client.redis.get("stats");

    const embed = new EmbedBuilder()
        .setTitle("Poll Stats")
        .setDescription(`This server has deleted ${stats || 0} polls so far${interaction.user.id === process.env.BOT_DEV_ID ? `\nOverall: ${overallStats} have been deleted` : ""}`)
        .setColor("#00FF00");

    interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}