export class DeployOnDeviceCommand implements ICommand {
	public allowedParameters: ICommandParameter[] = [];

	constructor(private $platformService: IPlatformService,
		private $platformCommandParameter: ICommandParameter,
		private $options: IOptions,
		private $errors: IErrors,
		private $mobileHelper: Mobile.IMobileHelper) { }

	public async execute(args: string[]): Promise<void> {
		const appFilesUpdaterOptions: IAppFilesUpdaterOptions = { bundle: this.$options.bundle, release: this.$options.release };
		const deployOptions: IDeployPlatformOptions = {
			clean: this.$options.clean,
			device: this.$options.device,
			projectDir: this.$options.path,
			emulator: this.$options.emulator,
			platformTemplate: this.$options.platformTemplate,
			release: this.$options.release,
			forceInstall: true
		};
		return this.$platformService.deployPlatform(args[0], appFilesUpdaterOptions, deployOptions);
	}

	public async canExecute(args: string[]): Promise<boolean> {
		if (!args || !args.length || args.length > 1) {
			return false;
		}

		if (!(await this.$platformCommandParameter.validate(args[0]))) {
			return false;
		}

		if (this.$mobileHelper.isAndroidPlatform(args[0]) && this.$options.release && (!this.$options.keyStorePath || !this.$options.keyStorePassword || !this.$options.keyStoreAlias || !this.$options.keyStoreAliasPassword)) {
			this.$errors.fail("When producing a release build, you need to specify all --key-store-* options.");
		}

		return this.$platformService.validateOptions(args[0]);
	}
}

$injector.registerCommand("deploy", DeployOnDeviceCommand);
