import config from "../../config.json" with { type: "json" };

type Config = {
  "modules": {
	[moduleName: string]: boolean
  },
  "commands": {
	[commandName: string]: boolean
  }
};

export default config as Config;