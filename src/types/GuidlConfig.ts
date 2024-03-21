export interface GuildConfig {
    whitelistedChannels: {
        id: string;
        category: boolean;
    }[];
    whitelistedRoles: string[];
    whitelistedMembers: string[];
    punishment: "delete" | "kick" | "ban" | "timeout";
    timeoutDuration: number;
}