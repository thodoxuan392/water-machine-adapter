import { Observable } from "rxjs";
import { DeviceInterface } from "./device.interface";
import {
	BaseInterface,
	CommandOpenVan,
	CommandPlayAudio,
	CommandUpdateRFID,
	Config,
} from "./interface";

export class Device implements DeviceInterface {
	public async start(): Promise<void> {}

	public async sendCommandOpenVan(command: CommandOpenVan): Promise<void> {}

	public async sendCommandPlayAudio(
		command: CommandPlayAudio
	): Promise<void> {}

	public async sendCommandUpdateRFID(
		command: CommandUpdateRFID
	): Promise<void> {}

	public async sendConfig(config: Config): Promise<void> {}

	getObservable(): Observable<BaseInterface> {
		return null;
	}
}
