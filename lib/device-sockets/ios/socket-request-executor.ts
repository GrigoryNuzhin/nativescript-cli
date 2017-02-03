export class IOSSocketRequestExecutor implements IiOSSocketRequestExecutor {
	constructor(private $errors: IErrors,
		private $iOSNotification: IiOSNotification,
		private $iOSNotificationService: IiOSNotificationService,
		private $logger: ILogger,
		private $projectData: IProjectData) { }

	public async executeAttachRequest(device: Mobile.IiOSDevice, timeout: number): Promise<void> {

		let data = [this.$iOSNotification.alreadyConnected, this.$iOSNotification.readyForAttach, this.$iOSNotification.attachAvailable]
			.map((notification) => this.$iOSNotificationService.awaitNotification(device.deviceInfo.identifier, notification, timeout)),
			alreadyConnected = data[0],
			readyForAttach = data[1],
			attachAvailable = data[2];

		await this.$iOSNotificationService.postNotificationAndAttachForData(device.deviceInfo.identifier, this.$iOSNotification.attachAvailabilityQuery);

		let receivedNotification: string;
		try {
			receivedNotification = await Promise.race([alreadyConnected, readyForAttach, attachAvailable]);
		} catch (e) {
			this.$errors.failWithoutHelp(`The application ${this.$projectData.projectId} does not appear to be running on ${device.deviceInfo.displayName} or is not built with debugging enabled.`);
		}

		switch (receivedNotification) {
			case this.$iOSNotification.alreadyConnected:
				this.$errors.failWithoutHelp("A client is already connected.");
				break;
			case this.$iOSNotification.attachAvailable:
				await this.executeAttachAvailable(device.deviceInfo.identifier, timeout);
				break;
			case this.$iOSNotification.readyForAttach:
				break;
		}
	}

	public async executeLaunchRequest(deviceIdentifier: string, timeout: number, readyForAttachTimeout: number, shouldBreak?: boolean): Promise<void> {
		try {
			// We should create these promises here beecause we need to send the ObserveNotification on the device
			// before we send the PostNotification.
			const promisesToWait = [this.$iOSNotificationService.awaitNotification(deviceIdentifier, this.$iOSNotification.appLaunching, timeout),
			this.$iOSNotificationService.awaitNotification(deviceIdentifier, this.$iOSNotification.readyForAttach, readyForAttachTimeout)];
			if (shouldBreak) {
				await this.$iOSNotificationService.postNotificationAndAttachForData(deviceIdentifier, this.$iOSNotification.waitForDebug);
			}

			await this.$iOSNotificationService.postNotificationAndAttachForData(deviceIdentifier, this.$iOSNotification.attachRequest);
			await Promise.all(promisesToWait);
		} catch (e) {
			this.$logger.trace(`Timeout error: ${e}`);
			this.$errors.failWithoutHelp("Timeout waiting for response from NativeScript runtime.");
		}
	}

	private async executeAttachAvailable(deviceIdentifier: string, timeout: number): Promise<void> {
		try {
			// We should create this promise here beecause we need to send the ObserveNotification on the device
			// before we send the PostNotification.
			const readyForAttachPromise = this.$iOSNotificationService.awaitNotification(deviceIdentifier, this.$iOSNotification.readyForAttach, timeout);
			await this.$iOSNotificationService.postNotificationAndAttachForData(deviceIdentifier, this.$iOSNotification.attachRequest);
			await readyForAttachPromise;
		} catch (e) {
			this.$errors.failWithoutHelp(`The application ${this.$projectData.projectId} timed out when performing the socket handshake.`);
		}
	}
}

$injector.register("iOSSocketRequestExecutor", IOSSocketRequestExecutor);
