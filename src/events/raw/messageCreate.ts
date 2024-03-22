import { EmbedBuilder, GatewayDispatchEvents, Message, PermissionFlagsBits } from "discord.js";
import { type GatewayMessageCreateDispatchData } from "discord-api-types/gateway";
import type AntiPolls from "../../utils/client.ts";
import type { GuildConfig } from "../../types/GuidlConfig.ts";

export const raw = true;
export const type = GatewayDispatchEvents.MessageCreate;

export async function run(client: AntiPolls, data: GatewayMessageCreateDispatchData & {
    poll?: unknown;
}) {
    if (!("poll" in data)) return;

    // @ts-expect-error we are fine creating it
    const msg = new Message(client, data) as Message;

    if (!msg.inGuild()) return;

    const guildConfig = await client.redis.get(`config:${msg.guildId}`);

    if (!guildConfig) return; // nothing to do

    const config: GuildConfig = JSON.parse(guildConfig);

    if (config.whitelistedChannels.some((channel: { id: string, category: boolean; }) => {
        if (channel.category) return msg.channel.parentId === channel.id;

        return msg.channel.id === channel.id;
    })) return;

    if (config.whitelistedRoles.some((role: string) => msg.member?.roles.cache.has(role))) return; // whitelisted role

    if (config.whitelistedMembers.includes(msg.author.id)) return; // whitelisted member

    const doIGotPermsManageMessagesPerms = msg.guild.members.me?.permissions.has(PermissionFlagsBits.ManageMessages);

    if (doIGotPermsManageMessagesPerms) msg.delete().catch(client.catch);

    await client.redis.incr("stats")
    await client.redis.incr(`stats:${msg.guildId}`)

    if (!msg.member) return; // nothing else to do

    switch (config.punishment) {
        case "delete": {
            break;
        }

        case "timeout": {
            const doIGotPerms = msg.guild.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers);

            if (doIGotPerms) {
                if (msg.member.moderatable) {
                    msg.member.timeout(config.timeoutDuration === 0 ? 1000 * 60 : config.timeoutDuration, "AntiPolls").catch(client.catch); // default to 1 minute
                }
            }

            break;
        }

        case "kick": {
            const doIGotPerms = msg.guild.members.me?.permissions.has(PermissionFlagsBits.KickMembers);

            if (doIGotPerms) {
                if (msg.member.kickable) {
                    msg.member.kick("AntiPolls").catch(client.catch);
                }
            }

            break;
        }

        case "ban": {
            const doIGotPerms = msg.guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers);

            if (doIGotPerms) {
                if (msg.member.bannable) {
                    msg.member.ban({ reason: "AntiPolls" }).catch(client.catch);
                }
            };

            break;
        }
    }
}