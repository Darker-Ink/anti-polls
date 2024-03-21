import { EmbedBuilder, type Client, CommandInteraction, PermissionFlagsBits } from "discord.js";

export const name = "ping";
export const description = "Replies with the ping";
export const defaultMemberPermissions = PermissionFlagsBits.ManageMessages;
export const options = [];

export async function execute(client: Client, interaction: CommandInteraction) {
    const msg = await interaction.reply("Pinging...");

    const embed = new EmbedBuilder()
        .setTitle("Pong!")
        .setDescription(`Latency is ${msg.createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms.`)
        .setColor("#00FF00");

    msg.edit({
        content: null,
        embeds: [embed]
    });
}