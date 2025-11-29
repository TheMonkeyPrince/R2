import { EmbedBuilder } from "discord.js";

export enum EmbedColor {
    BLUE = 0x0099ff,
    RED = 0xcc0000
}

export default class DefaultEmbed extends EmbedBuilder {
	constructor() {
		super({
			color: EmbedColor.BLUE,
            timestamp: new Date(),
            footer: {
                text: "Fièrement propulsé par Monkey Industries",
                icon_url: "https://cdn.discordapp.com/attachments/682155089124917255/1444317336831262923/20230502_191444.jpg?ex=692c44d7&is=692af357&hm=2d2756085f1953bfa13524248f5fb01047542ac789284eaf6b56d770570d8cf5&"
            }
		})	
	}
}