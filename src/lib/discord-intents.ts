import { GatewayIntentBits as G } from "discord.js"

export default [
	G.Guilds,
    G.GuildMembers,
	G.GuildModeration,
    G.GuildEmojisAndStickers,
    G.GuildIntegrations,
    G.GuildWebhooks,
    G.GuildInvites ,
    G.GuildVoiceStates,
    G.GuildPresences,
    G.GuildMessages,
    G.GuildMessageReactions,
    G.GuildMessageTyping,
    G.DirectMessages,
    G.DirectMessageReactions,
    G.DirectMessageTyping,
    G.MessageContent,
    G.GuildScheduledEvents,
    G.AutoModerationConfiguration,
    G.AutoModerationExecution
]