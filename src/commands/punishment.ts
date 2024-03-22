import { CommandInteraction, PermissionFlagsBits, type APIApplicationCommandOption, EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import type AntiPolls from "../utils/client.ts";
import type { GuildConfig } from "../types/GuidlConfig.ts";

export const name = "punishment";
export const description = "Change the punishment";
export const defaultMemberPermissions = PermissionFlagsBits.ManageMessages;
export const options: APIApplicationCommandOption[] = [
    {
        name: "punishment",
        description: "The punishment to use",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
            {
                name: "Delete",
                value: "delete"
            },
            {
                name: "Kick",
                value: "kick"
            },
            {
                name: "Ban",
                value: "ban"
            },
            {
                name: "Timeout",
                value: "timeout"
            }
        ]
    },
    {
        name: "duration",
        description: "The duration to timeout for in ms",
        type: ApplicationCommandOptionType.Integer,
        required: false
    }
];

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

    const punishment = interaction.options.getString("punishment");
    const duration = interaction.options.getInteger("duration");

    foundConfig.punishment = punishment as "delete" | "kick" | "ban" | "timeout";
    foundConfig.timeoutDuration = duration || 0;

    await client.redis.set(`config:${interaction.guildId}`, JSON.stringify(foundConfig));

    const embed = new EmbedBuilder()
        .setTitle("Punishment")
        .setDescription(`The punishment has been set to ${punishment} ${duration ? `for ${duration}ms` : ""}`)
        .setColor("DarkBlue");

    let msg = "";

    switch (punishment as "delete" | "kick" | "ban" | "timeout") {
        case "ban": {
            const doIGotPerms = interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.BanMembers);

            if (!doIGotPerms) {
                msg = "I don't have the permissions to ban members, I will not be able to react";
            }

            break;
        }

        case "kick": {
            const doIGotPerms = interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.KickMembers);

            if (!doIGotPerms) {
                msg = "I don't have the permissions to kick members, I will not be able to react";
            }

            break;
        }

        case "timeout": {
            const doIGotPerms = interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers);

            if (!doIGotPerms) {
                msg = "I don't have the permissions to manage members, I will not be able to react";
            }

            break;
        }

        case "delete": {
            const doIGotPerms = interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageMessages);

            if (!doIGotPerms) {
                msg = "I don't have the permissions to manage messages, I will not be able to react";
            }

            break;
        }
    }

    interaction.reply({
        embeds: [embed],
        content: msg,
        ephemeral: true
    });
}