# Anti-Poll's bot

Discord released poll's to 10% of servers on 3/21/2024 without a permisison tied to it that can be easily disabled. This bot is a temporary solution to disable polls in your server.

There's a [public version](https://discord.com/oauth2/authorize?client_id=1220464421277667340) of this bot that you can invite to your server, else keep reading below on how to set it up.

## Setup

This bot uses [Bun](https://bun.sh) though we don't rely on any of its API's so if you wanted to you could bundle the code and use node.

- Install [Bun](https://bun.sh)
- Clone this repository
- Fill out the `.env` file with your bot token and redis configuration
- Run `bun install`
- Run `bun start`

and you're done! If you have an issue (with public or self-hosted) feel free to open an issue.

## License

This project is not under any license, you can do whatever you want with it, just give credits if you are to use the code.