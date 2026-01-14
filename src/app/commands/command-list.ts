import { Command } from "./command.js";

import Ping from "./src/ping.js";
import ConnectSoundboard from "./src/connect-soundboard.js";
import CrazyFrog from "./src/crazy-frog.js";
import FakeMessage from "./src/fake-message.js";
import LethalCompany from "./src/lethal-company.js";
import Overwatch from "./src/overwatch.js";
import DeleteMessage from "./src/delete-message.js";
import MotivateMe from "./src/motivate-me.js";
import SendMessage from "./src/send-message.js";
import Rename from "./src/rename.js";
import Votation from "./src/votation.js";
import ToggleMotivation from "./src/toggle-motivation.js";
import Record from "./src/record.js";
import TrackJuan from "./src/track-juan.js";

export default [
	new Ping(),
	new ConnectSoundboard(),
	new CrazyFrog(),
	new FakeMessage(),
	new LethalCompany(),
	new Overwatch(),
	new DeleteMessage(),
	new MotivateMe(),
	new SendMessage(),
	new Rename(),
	new Votation(),
	new ToggleMotivation(),
	new Record(),
	new TrackJuan(),
] as Command[];