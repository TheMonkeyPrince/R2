import { SlashCommandBuilder } from "discord.js";
import axios from "axios";
import * as cheerio from "cheerio";

import { Command, type Interaction } from "../command.js";
import Bot from "../../bot.js";
import DefaultEmbed from "../../../lib/default-embed.js";


const PROFILE_URL = "https://steamcommunity.com/profiles/76561198966538362";

const headers = {
  "User-Agent": "Mozilla/5.0",
};

interface RecentActivityEntry {
  game: string | null;
  last_played: string;
  time_played: string;
}

async function getRecentActivity(): Promise<RecentActivityEntry[]> {
  const response = await axios.get<string>(PROFILE_URL, {
    headers,
    timeout: 10_000,
  });

  const $ = cheerio.load(response.data);
  const recentActivity: RecentActivityEntry[] = [];

  // Each recent game is inside this block
  $("div.recent_game").each((_, game) => {
    const nameEl = $(game).find("div.game_name").first();
    const infoText = $(game)
      .find("div.game_info_details")
      .first()
      .text()
      .replace(/\t/g, "")
      .replace(/^\n/, "");

    const [last_played, hours] = infoText.split("\n");

    recentActivity.push({
      game: nameEl.length ? nameEl.text().trim() : null,
      last_played: last_played ?? "",
      time_played: hours ?? "",
    });
  });

  return recentActivity;
}

export default class TrackJuan extends Command {
	override get data() {
		return new SlashCommandBuilder()
			.setName('trackj')
			.setDescription('what is le J doing ???')
	}

	override async execute(_bot: Bot, interaction: Interaction) {
		if (interaction.guild === null) return
		
		const activity = await getRecentActivity();
    const embed = new DefaultEmbed();
    embed.setTitle("Juan's Recent Steam Activity");
    embed.setAuthor({
      name: "Juanika",
      iconURL: "https://avatars.fastly.steamstatic.com/4cc132bcf546c66f616f0c94be7dd0f7210b1867_full.jpg",
      url: PROFILE_URL
    })

    if (activity.length === 0) {
      embed.setDescription("No recent activity found.");
    } else {
      activity.forEach((entry) => {
        const gameName = entry.game ?? "Unknown Game";
        embed.addFields({
          name: gameName,
          value: `Whaaaaat`,
        });
      });
    }

    await interaction.reply({ embeds: [embed] });
	}
}
