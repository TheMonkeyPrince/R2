import { TextChannel } from "discord.js"

export default function sendWebhookMessageToChannel(channel: TextChannel, username: string, avatar: string, message: string) {
	return new Promise((resolve, reject) => {
		channel.createWebhook({
			name: username,
			avatar: avatar
		}).then(webhook => {
			webhook.send(message).then(() => {
				webhook.delete().then(resolve).catch(reject)
			})
		}).catch(reject)
	})
}

