import { Observable, Subject } from "rxjs";
import { DeviceInterface } from "./device.interface";
import {
	BaseInterface,
	CommandCancelOpenVan,
	CommandCancelOpenVanAck,
	CommandCancelOpenVanResult,
	CommandOpenVan,
	CommandOpenVanAck,
	CommandOpenVanResult,
	CommandPlayAudio,
	CommandPlayAudioAck,
	CommandPlayAudioResult,
	CommandUpdateRFID,
	CommandUpdateRFIDAck,
	CommandUpdateRFIDResult,
	Config,
	ConfigAck,
	ConfigResult,
	ProtocolId,
	RFID,
	RFIDDetected,
	Result,
	Status,
} from "./interface";

type Machine = {
	machineId: number;
	maxWaterFlowAllowed?: number;
	rfid: RFID;
	placed_point_status: boolean;
	solenoid_status: boolean;
	water_flow_status: number;
	rfid_placed_status: boolean;
	error: {
		placedPositionError: boolean;
		waterFlowSensorError: boolean;
		rfidError: boolean;
		soundError: boolean;
	};
};

export class DeviceMock implements DeviceInterface {
	private _statusTimer: NodeJS.Timer;
	private _rfidDetectedTimer: NodeJS.Timer;
	private _subject = new Subject<BaseInterface>();
	private _rfidDetectedIndex = 0;
	private MACHINE_MAX = 3;
	private WATERFLOW_DEFAULT = 100; // 100cc/s
	private _machine = new Map<number, Machine>([
		[
			0x00,
			{
				machineId: 0x00,
				rfid: {
					rfid: [1, 2, 3, 4],
					rfidLen: 4,
					money: 100000,
					issueDate: [24, 1, 1],
					expireDate: [25, 1, 1],
				},
				placed_point_status: false,
				solenoid_status: false,
				water_flow_status: 0,
				rfid_placed_status: false,
				error: {
					placedPositionError: false,
					waterFlowSensorError: false,
					rfidError: false,
					soundError: false,
				},
			},
		],
		[
			0x01,
			{
				machineId: 0x01,
				rfid: {
					rfid: [3, 4, 5, 6],
					rfidLen: 4,
					money: 100000,
					issueDate: [24, 1, 1],
					expireDate: [25, 1, 1],
				},
				placed_point_status: false,
				solenoid_status: false,
				water_flow_status: 0,
				rfid_placed_status: false,
				error: {
					placedPositionError: false,
					waterFlowSensorError: false,
					rfidError: false,
					soundError: false,
				},
			},
		],
		[
			0x02,
			{
				machineId: 0x02,
				rfid: {
					rfid: [7, 8, 9, 10],
					rfidLen: 4,
					money: 100000,
					issueDate: [24, 1, 1],
					expireDate: [25, 1, 1],
				},
				placed_point_status: false,
				solenoid_status: false,
				water_flow_status: 0,
				rfid_placed_status: false,
				error: {
					placedPositionError: false,
					waterFlowSensorError: false,
					rfidError: false,
					soundError: false,
				},
			},
		],
	]);

	public async start(): Promise<void> {
		// Timer to send Status
		this._statusTimer = setInterval(() => {
			this.sendStatus();
		}, 1000);
		// Timer to trigger rfid detected event
		this._rfidDetectedTimer = setInterval(() => {
			this.sendRFIDDetected();
		}, 60 * 1000);
	}

	public async sendConfig(config: Config): Promise<void> {
		const { machineId, maxWaterFowAllowed } = config;
		const ack: ConfigAck = {
			protocolId: ProtocolId.CONFIG_ACK,
			machineId,
		};
		this.sendBack(ack);

		// Logic
		const machine = this._machine.get(machineId);
		machine.maxWaterFlowAllowed = maxWaterFowAllowed;

		// Result
		setTimeout(() => {
			const result: ConfigResult = {
				protocolId: ProtocolId.CONFIG_RESULT,
				machineId,
				result: Result.RESULT_SUCCESS,
			};
			this.sendBack(result);
		}, 200);
	}

	public async sendCommandOpenVan(command: CommandOpenVan): Promise<void> {
		const { machineId, volume } = command;
		const ack: CommandOpenVanAck = {
			protocolId: ProtocolId.COMMAND_OPEN_VAN_ACK,
			machineId,
		};
		this.sendBack(ack);

		// Open VAN
		const machine = this._machine.get(machineId);
		machine.solenoid_status = true;
		machine.water_flow_status = this.WATERFLOW_DEFAULT;
		const timeToOpenVANInSecond = volume / (this.WATERFLOW_DEFAULT * 2);

		setTimeout(() => {
			machine.solenoid_status = false;
			machine.water_flow_status = 0;
			const result: CommandOpenVanResult = {
				protocolId: ProtocolId.COMMAND_OPEN_VAN_RESULT,
				machineId,
				result: Result.RESULT_SUCCESS,
			};
			this.sendBack(result);
		}, timeToOpenVANInSecond);
	}

	public async sendCommandCancelOpenVan(
		command: CommandCancelOpenVan
	): Promise<void> {
		const { machineId } = command;
		const ack: CommandCancelOpenVanAck = {
			protocolId: ProtocolId.COMMAND_CANCEL_OPEN_VAN_ACK,
			machineId,
		};
		this.sendBack(ack);

		// Cancel Open VAN
		const machine = this._machine.get(machineId);
		machine.solenoid_status = false;
		machine.water_flow_status = 0;

		setTimeout(() => {
			const result: CommandCancelOpenVanResult = {
				protocolId: ProtocolId.COMMAND_CANCEL_OPEN_VAN_RESULT,
				machineId,
				result: Result.RESULT_SUCCESS,
			};
			this.sendBack(result);
		}, 1000);
	}

	public async sendCommandPlayAudio(
		command: CommandPlayAudio
	): Promise<void> {
		const { machineId } = command;
		const ack: CommandPlayAudioAck = {
			protocolId: ProtocolId.COMMAND_PLAY_AUDIO_ACK,
			machineId,
		};
		this.sendBack(ack);

		setTimeout(() => {
			const result: CommandPlayAudioResult = {
				protocolId: ProtocolId.COMMAND_PLAY_AUDIO_RESULT,
				machineId,
				result: Result.RESULT_SUCCESS,
			};
			this.sendBack(result);
		}, 200);
	}

	public async sendCommandUpdateRFID(
		command: CommandUpdateRFID
	): Promise<void> {
		const { machineId } = command;
		const ack: CommandUpdateRFIDAck = {
			protocolId: ProtocolId.COMMAND_UPDATE_RFID_ACK,
			machineId,
		};
		this.sendBack(ack);

		// Logic
		const machine = this._machine.get(machineId);
		machine.rfid = {
			rfid: command.rfid,
			rfidLen: command.rfidLen,
			money: command.money,
			issueDate: command.issueDate,
			expireDate: command.expireDate,
		};

		setTimeout(() => {
			const result: CommandUpdateRFIDResult = {
				protocolId: ProtocolId.COMMAND_UPDATE_RFID_RESULT,
				machineId,
				result: Result.RESULT_SUCCESS,
			};
			this.sendBack(result);
		}, 1000);
	}

	public getObservable(): Observable<BaseInterface> {
		return this._subject.pipe();
	}

	private sendBack<T extends BaseInterface>(message: T) {
		this._subject.next(message);
	}

	private sendStatus() {
		this._machine.forEach((machine) => {
			const {
				machineId,
				placed_point_status,
				solenoid_status,
				rfid_placed_status,
				water_flow_status,
				error,
			} = machine;
			const status: Status = {
				protocolId: ProtocolId.STATUS,
				machineId,
				placedPositionStatus: placed_point_status,
				solenoidSensorStatus: solenoid_status,
				rfidPlacedStatus: rfid_placed_status,
				waterFlowSensorStatus: water_flow_status,
				error,
			};
			this._subject.next(status);
		});
	}

	private sendRFIDDetected() {
		const machine = this._machine.get(this._rfidDetectedIndex);
		const { machineId, rfid } = machine;
		this._rfidDetectedIndex =
			(this._rfidDetectedIndex + 1) % this.MACHINE_MAX;

		// Logic
		machine.rfid_placed_status = true;

		const rfidDetected: RFIDDetected = {
			protocolId: ProtocolId.RFID_DETECTED,
			machineId,
			...rfid,
		};
		this._subject.next(rfidDetected);

		// Takeout RFID
		setTimeout(() => {
			machine.rfid_placed_status = false;
		}, 60 * 1000);
	}
}
