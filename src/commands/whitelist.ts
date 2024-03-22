import { CommandInteraction, PermissionFlagsBits, type APIApplicationCommandOption, ApplicationCommandOptionType, ChannelType, EmbedBuilder } from "discord.js";
import type AntiPolls from "../utils/client.ts";
import type { GuildConfig } from "../types/GuidlConfig.ts";

export const name = "whitelist";
export const description = "Whitelist a role / channel / member from using polls";
export const defaultMemberPermissions = PermissionFlagsBits.ManageMessages;
export const options: APIApplicationCommandOption[] = [{
    name: "channel",
    description: "The channel to whitelist",
    type: ApplicationCommandOptionType.Channel,
    required: false
}, {
    name: "role",
    description: "The role to whitelist",
    type: ApplicationCommandOptionType.Role,
    required: false
}, {
    name: "member",
    description: "The member to whitelist",
    type: ApplicationCommandOptionType.User,
    required: false
}, {
    name: "remove",
    description: "Whether to remove the whitelist",
    type: ApplicationCommandOptionType.Boolean,
    required: false
}];

export async function execute(client: AntiPolls, interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) {
        interaction.reply({
            content: "Sorry?",
            ephemeral: true
        });

        return;
    }

    const channel = interaction.options.getChannel("channel");
    const role = interaction.options.getRole("role");
    const member = interaction.options.getUser("member");
    const remove = interaction.options.getBoolean("remove");

    if (!channel && !role && !member) {
        interaction.reply({
            content: "You need to specify a channel, role or member to whitelist",
            ephemeral: true
        });

        return;
    }

    if (remove && !channel && !role && !member) {
        interaction.reply({
            content: "You need to specify a channel, role or member to remove the whitelist",
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

    if (remove) {
        if (channel) {
            foundConfig.whitelistedChannels = foundConfig.whitelistedChannels.filter((c) => c.id !== channel.id);
        } else if (role) {
            foundConfig.whitelistedRoles = foundConfig.whitelistedRoles.filter((r) => r !== role.id);
        } else if (member) {
            foundConfig.whitelistedMembers = foundConfig.whitelistedMembers.filter((m) => m !== member.id);
        }
    } else {
        if (channel) {
            foundConfig.whitelistedChannels.push({
                id: channel.id,
                category: channel.type === ChannelType.GuildCategory
            });
        } else if (role) {
            foundConfig.whitelistedRoles.push(role.id);
        } else if (member) {
            foundConfig.whitelistedMembers.push(member.id);
        }
    }

    // filters out duplicates
    foundConfig.whitelistedChannels = foundConfig.whitelistedChannels.filter((c, i, a) => a.findIndex((cc) => cc.id === c.id) === i);
    foundConfig.whitelistedRoles = foundConfig.whitelistedRoles.filter((r, i, a) => a.indexOf(r) === i);
    foundConfig.whitelistedMembers = foundConfig.whitelistedMembers.filter((m, i, a) => a.indexOf(m) === i);

    await client.redis.set(`config:${interaction.guildId}`, JSON.stringify(foundConfig));

    const embed = new EmbedBuilder()
        .setTitle("Whitelist Changed!")
        .setDescription(`Successfully, changed the config`)
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

    const doIGotPerms = interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageMessages);

    interaction.reply({
        embeds: [embed],
        ephemeral: true,
        content: doIGotPerms ? "" : `Hey, seems I don't got permissions, I will not be able to act on deleting messages`
    });
}