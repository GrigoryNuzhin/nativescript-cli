export class CleanCommand implements ICommand {
	public allowedParameters: ICommandParameter[] = [];

	constructor(private $options: IOptions,
		private $platformService: IPlatformService,
		private $errors: IErrors) { }

	public async execute(args: string[]): Promise<void> {
		this.$platformService.removePlatforms(args);
		await this.$platformService.addPlatforms(args, this.$options.platformTemplate);
	}

	public async canExecute(args: string[]): Promise<boolean> {
		if (!args || args.length === 0) {
			this.$errors.fail("No platform specified. Please specify a platform to clean");
		}

		_.each(args, arg => this.$platformService.validatePlatform(arg));

		return true;
	}
}

$injector.registerCommand("platform|clean", CleanCommand);
