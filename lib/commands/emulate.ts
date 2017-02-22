export class EmulateCommandBase {
	constructor(private $options: IOptions,
		private $platformService: IPlatformService) { }

	public async executeCore(args: string[]): Promise<void> {
		this.$options.emulator = true;
		const appFilesUpdaterOptions: IAppFilesUpdaterOptions = { bundle: this.$options.bundle, release: this.$options.release };
		const emulateOptions: IEmulatePlatformOptions = {
			avd: this.$options.avd,
			clean: this.$options.clean,
			device: this.$options.device,
			release: this.$options.release,
			emulator: this.$options.emulator,
			projectDir: this.$options.path,
			justlaunch: this.$options.justlaunch,
			availableDevices: this.$options.availableDevices,
			platformTemplate: this.$options.platformTemplate
		}
		return this.$platformService.emulatePlatform(args[0], appFilesUpdaterOptions, emulateOptions);
	}
}

export class EmulateIosCommand extends EmulateCommandBase implements ICommand {
	public allowedParameters: ICommandParameter[] = [];

	constructor($options: IOptions,
		$platformService: IPlatformService,
		private $platformsData: IPlatformsData) {
		super($options, $platformService);
	}

	public async execute(args: string[]): Promise<void> {
		return this.executeCore([this.$platformsData.availablePlatforms.iOS]);
	}
}

$injector.registerCommand("emulate|ios", EmulateIosCommand);

export class EmulateAndroidCommand extends EmulateCommandBase implements ICommand {
	constructor($options: IOptions,
		$platformService: IPlatformService,
		private $platformsData: IPlatformsData) {
		super($options, $platformService);
	}

	public allowedParameters: ICommandParameter[] = [];

	public async execute(args: string[]): Promise<void> {
		return this.executeCore([this.$platformsData.availablePlatforms.Android]);
	}
}

$injector.registerCommand("emulate|android", EmulateAndroidCommand);
