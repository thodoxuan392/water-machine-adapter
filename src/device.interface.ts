import {
	BaseInterface,
	CommandCancelOpenVan,
	CommandOpenVan,
	CommandPlayAudio,
	CommandUpdateRFID,
	Config,
} from "./interface";
import { Observable } from "rxjs";

export interface DeviceInterface {
	start(): Promise<void>;
	sendConfig(config: Config): Promise<void>;
	sendCommandOpenVan(command: CommandOpenVan): Promise<void>;
	sendCommandCancelOpenVan(command: CommandCancelOpenVan): Promise<void>;
	sendCommandPlayAudio(command: CommandPlayAudio): Promise<void>;
	sendCommandUpdateRFID(command: CommandUpdateRFID): Promise<void>;
	getObservable(): Observable<BaseInterface>;
}
