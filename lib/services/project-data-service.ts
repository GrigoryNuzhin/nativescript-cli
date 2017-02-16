import * as path from "path";

interface IProjectFileData {
	projectData: any;
	indent: string;
	projectFilePath: string;
}

export class ProjectDataService implements IProjectDataService {
	private static DEPENDENCIES_KEY_NAME = "dependencies";

	constructor(private $fs: IFileSystem,
		private $staticConfig: IStaticConfig) {
	}

	public getValue(projectDir: string, propertyName: string): any {
		const projectData = this.getProjectFileData(projectDir).projectData;
		return projectData ? projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE][propertyName] : null;
	}

	public setValue(projectDir: string, key: string, value: any): void {
		const projectFileInfo = this.getProjectFileData(projectDir);

		if (!projectFileInfo.projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE]) {
			projectFileInfo.projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE] = Object.create(null);
		}

		projectFileInfo.projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE][key] = value;

		this.$fs.writeJson(projectFileInfo.projectFilePath, projectFileInfo.projectData, projectFileInfo.indent);
	}

	public removeProperty(projectDir: string, propertyName: string): void {
		const projectFileInfo = this.getProjectFileData(projectDir);
		delete projectFileInfo.projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE][propertyName];
		this.$fs.writeJson(projectFileInfo.projectFilePath, projectFileInfo.projectData, projectFileInfo.indent);
	}

	public removeDependency(projectDir: string, dependencyName: string): void {
		const projectFileInfo = this.getProjectFileData(projectDir);
		delete projectFileInfo.projectData[ProjectDataService.DEPENDENCIES_KEY_NAME][dependencyName];
		this.$fs.writeJson(projectFileInfo.projectFilePath, projectFileInfo.projectData, projectFileInfo.indent);
	}

	private getProjectFileData(projectDir: string): IProjectFileData {
		const projectFilePath = path.join(projectDir, this.$staticConfig.PROJECT_FILE_NAME);

		// Detect indent and use it later to write JSON.
		const projectFileContent = this.$fs.readText(projectFilePath);
		const indent = projectFileContent ? this.detectIndent(projectFileContent) : "\t";

		const projectData = projectFileContent ? JSON.parse(projectFileContent) : Object.create(null);

		return {
			projectData,
			indent,
			projectFilePath
		};
	}

	private detectIndent(content: string): any {
		const leadingSpace = content.match(/(^[ ]+)\S/m);

		if (leadingSpace) {
			return leadingSpace[1].length;
		}

		return "\t";
	}
}
$injector.register("projectDataService", ProjectDataService);
