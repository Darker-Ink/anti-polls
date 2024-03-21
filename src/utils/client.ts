import { Client, CommandInteraction, GatewayDispatchEvents, type APIApplicationCommandOption } from "discord.js";
import { join } from "path";
import { readdir, stat } from "node:fs/promises";
import { Redis } from "ioredis";

class AntiPolls extends Client {
    public commands = new Map<string, {
        name: string,
        description: string,
        defaultMemberPermissions: bigint,
        options: APIApplicationCommandOption[],
        execute: (client: Client, message: CommandInteraction) => void;
    }>();

    public events = new Map<string, {
        raw: boolean,
        type: GatewayDispatchEvents | string,
        run: (client: Client, data: any) => void;
    }>();

    public redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? "6379"),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB ?? "0")
    });

    public commandsFolder = join(import.meta.dirname, "../commands");
    public eventsFolder = join(import.meta.dirname, "../events");    
    private connectAttempts = 0;
    private maxConnectAttempts = 5;

    public constructor() {
        super({
            intents: ["MessageContent", "GuildMessages", "Guilds", "GuildMembers"]
        });

        this.redis.on("close", () => {
            console.log(`Redis connection closed, ${this.connectAttempts}/${this.maxConnectAttempts} attempts`);

            if (this.connectAttempts >= this.maxConnectAttempts) {
                this.redis.connect();

                this.connectAttempts++;
            }
        });

        this.redis.on("connect", () => {
            console.log("Redis connection established");

            this.connectAttempts = 0;
        })
    }

    public async register() {
        // Register commands
        const commandFiles = await this.recursiveRegister(this.commandsFolder);
        for (const file of commandFiles) {
            const { name, description, execute, defaultMemberPermissions, options } = await import(file);
            this.commands.set(name, { description, execute, name, defaultMemberPermissions, options });

            console.log(`Registered command ${name}`);
        }

        // Register events
        const eventFiles = await this.recursiveRegister(this.eventsFolder);
        for (const file of eventFiles) {
            const { raw, type, run } = await import(file);
            this.events.set(type, { raw, type, run });

            console.log(`Registered event ${type}`);
        }

        for (const [type, { raw, run }] of this.events) {
            if (raw) {
                this.ws.on(type as GatewayDispatchEvents, (data) => run(this, data));
            } else {
                this.on(type as string, (data) => run(this, data));
            }
        }
    }

    private async recursiveRegister(folder: string) {
        const paths: string[] = [];

        const files = await readdir(folder);

        for (const file of files) {
            const path = join(folder, file);
            const sta = await stat(path);

            if (sta.isDirectory()) {
                paths.push(...await this.recursiveRegister(path));
            } else {
                paths.push(path);
            }
        }

        return paths;
    }

    public override async login(token?: string) {
        await this.register();

        const loggedIn = await super.login(token);

        await this.application?.commands.set(Array.from(this.commands.values()).map((cmd) => ({
            name: cmd.name,
            description: cmd.description,
            defaultMemberPermissions: cmd.defaultMemberPermissions,
            options: cmd.options
        })));

        return loggedIn;
    }
}

export default AntiPolls;