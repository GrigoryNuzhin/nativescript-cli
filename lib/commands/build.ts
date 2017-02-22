export class BuildCommandBase {
	constructor(protected $options: IOptions,
		protected $platformsData: IPlatformsData,
		protected $platformService: IPlatformService) { }

	public async executeCore(args: string[]): Promise<void> {
		let platform = args[0].toLowerCase();
		const appFilesUpdaterOptions: IAppFilesUpdaterOptions = { bundle: this.$options.bundle, release: this.$options.release };
		await this.$platformService.preparePlatform(platform, appFilesUpdaterOptions, this.$options.platformTemplate);
		this.$options.clean = true;
		const buildConfig: IBuildConfig = {
			buildForDevice: this.$options.forDevice,
			projectDir: this.$options.path,
			clean: this.$options.clean,
			release: this.$options.release
		};
		await this.$platformService.buildPlatform(platform, buildConfig);
		if (this.$options.copyTo) {
			this.$platformService.copyLastOutput(platform, this.$options.copyTo, { isForDevice: this.$options.forDevice });
		}
	}
}

export class BuildIosCommand extends BuildCommandBase implements ICommand {
	public allowedParameters: ICommandParameter[] = [];

	constructor(protected $options: IOptions,
		$platformsData: IPlatformsData,
		$platformService: IPlatformService) {
		super($options, $platformsData, $platformService);
	}

	public async execute(args: string[]): Promise<void> {
		return this.executeCore([this.$platformsData.availablePlatforms.iOS]);
	}

	public canExecute(args: string[]): Promise<boolean> {
		return args.length === 0 && this.$platformService.validateOptions(this.$platformsData.availablePlatforms.iOS);
	}
}

$injector.registerCommand("build|ios", BuildIosCommand);

export class BuildAndroidCommand extends BuildCommandBase implements ICommand {
	public allowedParameters: ICommandParameter[] = [];

	constructor(protected $options: IOptions,
		$platformsData: IPlatformsData,
		private $errors: IErrors,
		$platformService: IPlatformService) {
		super($options, $platformsData, $platformService);
	}

	public async execute(args: string[]): Promise<void> {
		return this.executeCore([this.$platformsData.availablePlatforms.Android]);
	}

	public async canExecute(args: string[]): Promise<boolean> {
		if (this.$options.release && (!this.$options.keyStorePath || !this.$options.keyStorePassword || !this.$options.keyStoreAlias || !this.$options.keyStoreAliasPassword)) {
			this.$errors.fail("When producing a release build, you need to specify all --key-store-* options.");
		}
		return args.length === 0 && await this.$platformService.validateOptions(this.$platformsData.availablePlatforms.Android);
	}
}

$injector.registerCommand("build|android", BuildAndroidCommand);
