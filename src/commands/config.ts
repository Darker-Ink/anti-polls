import { CommandInteraction, PermissionFlagsBits, type APIApplicationCommandOption, EmbedBuilder } from "discord.js";
import type AntiPolls from "../utils/client.ts";
import type { GuildConfig } from "../types/GuidlConfig.ts";

export const name = "config";
export const description = "Check the servers config";
export const defaultMemberPermissions = PermissionFlagsBits.ManageMessages;
export const options: APIApplicationCommandOption[] = [];

export async function execute(client: AntiPolls, interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) {
        interaction.reply({
            content: "Sorry?",
            ephemeral: true
        });

        return;
    }

    const found = await client.redis.get(`config:${interaction.guildId}`);
    let foundConfig: GuildConfig = found ? JSON.parse(found) : null;

    if (!foundConfig) {
        foundConfig = {
            whitelistedChannels: [],
            whitelistedRoles: [],
            whitelistedMembers: [],
            punishment: "delete",
            timeoutDuration: 0
        };
    }

    // filters out duplicates
    foundConfig.whitelistedChannels = foundConfig.whitelistedChannels.filter((c, i, a) => a.findIndex((cc) => cc.id === c.id) === i);
    foundConfig.whitelistedRoles = foundConfig.whitelistedRoles.filter((r, i, a) => a.indexOf(r) === i);
    foundConfig.whitelistedMembers = foundConfig.whitelistedMembers.filter((m, i, a) => a.indexOf(m) === i);

    await client.redis.set(`config:${interaction.guildId}`, JSON.stringify(foundConfig));

    const embed = new EmbedBuilder()
        .setTitle("Whitelist")
        .setDescription(`The current whitelist for this server, Punishment: ${foundConfig.punishment} ${foundConfig.timeoutDuration ? `for ${foundConfig.timeoutDuration}ms` : ""}`)
        .setColor("DarkBlue");

    let members = "";
    let roles = "";
    let channels = "";

    for (const member of foundConfig.whitelistedMembers) {
        members += `<@${member}>, `;
    }

    for (const role of foundConfig.whitelistedRoles) {
        roles += `<@&${role}>, `;
    }

    for (const channel of foundConfig.whitelistedChannels) {
        channels += `<#${channel.id}>, `;
    }

    // ? removes trailing commas
    members = members.slice(0, -2);
    roles = roles.slice(0, -2);
    channels = channels.slice(0, -2);

    embed.addFields([
        {
            name: "Whitelisted Members",
            value: members || "None"
        },
        {
            name: "Whitelisted Roles",
            value: roles || "None"
        },
        {
            name: "Whitelisted Channels",
            value: channels || "None"
        }
    ]);


    interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}