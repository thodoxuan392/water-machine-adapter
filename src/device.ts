import { Observable, Subject } from "rxjs";
import { DeviceInterface } from "./device.interface";
import {
	BaseInterface,
	BaseResultInterface,
	CommandOpenVan,
	CommandPlayAudio,
	CommandUpdateRFID,
	Config,
	ProtocolId,
	RFIDDetected,
	START_BYTE,
	STOP_BYTE,
	Status,
} from "./interface";
import { SerialPort } from "serialport";
import { Logger } from "./logger";
import {
	calculateChecksum,
	calculateChecksumFromBuffer,
	isValidProtocolId,
} from "./utils";

export enum USB_PRODUCT_ID {
	FT232 = "6001",
}

export class Device implements DeviceInterface {
	private _timerToCheckDevicePort: NodeJS.Timer;
	private _subject = new Subject<BaseInterface>();
	private _logger = Logger.getLogger();
	private _usbProductId = USB_PRODUCT_ID.FT232;
	private _port: SerialPort;
	private _buffer = Buffer.from([]);
	private _CHECK_DEVICE_PORT_INTERVAL = 1000;
	private _BAUDRATE_DEFAULT = 115200;
	private _RX_BUFFER_MAX_SIZE = 128;
	public async start(): Promise<void> {
		this._timerToCheckDevicePort = setInterval(async () => {
			if (this._port?.isOpen) {
				return;
			}
			// Get port
			const ports = await SerialPort.list();
			const foundPort = ports.find(
				(port) => port.productId === this._usbProductId
			);
			if (!foundPort) {
				return;
			}
			const { path } = foundPort;
			this._port = new SerialPort({
				path,
				baudRate: this._BAUDRATE_DEFAULT,
			});
			this._port.on("open", () => {
				console.log(`Port opened ${path}`);
			});
			this._port.on("readable", () => {
				this._buffer = Buffer.concat([this._buffer, this._port.read()]);
				while (this._buffer.length > 0) {
					const { success, cutLen } =
						this._handleReadBufferFromDevice(this._buffer);
					console.log(`Success ${success}, cutLen: ${cutLen}`);
					if (!success) {
						// Handle read buffer from device failed -> Check buffer is too big
						if (this._buffer.length > this._RX_BUFFER_MAX_SIZE) {
							console.log("Buffer is too big, cleaning up ...");
							this._buffer = Buffer.from([]);
						}
						break;
					} else {
						this._buffer = this._buffer.slice(
							cutLen,
							this._buffer.length
						);
						this._logger.info(this._buffer);
					}
				}
			});
		}, this._CHECK_DEVICE_PORT_INTERVAL);
	}

	public async sendCommandOpenVan(command: CommandOpenVan): Promise<void> {
		const data = [];
		data.push(START_BYTE);
		data.push(command.protocolId);
		data.push(3);
		data.push(command.machineId);
		data.push((command.volume >> 8) & 0xff);
		data.push(command.volume & 0xff);
		const checksum = calculateChecksum(data.slice(3, data.length));
		data.push(checksum);
		data.push(STOP_BYTE);
		this._logger.info(data);
		if (this._port.open) {
			this._port.write(Buffer.from(data));
		}
	}

	public async sendCommandPlayAudio(
		command: CommandPlayAudio
	): Promise<void> {
		const data = [];
		data.push(START_BYTE);
		data.push(command.protocolId);
		data.push(2);
		data.push(command.machineId);
		data.push(command.audioIndex);
		const checksum = calculateChecksum(data.slice(3, data.length));
		data.push(checksum);
		data.push(STOP_BYTE);
		if (this._port.open) {
			this._port.write(Buffer.from(data));
		}
	}

	public async sendCommandUpdateRFID(
		command: CommandUpdateRFID
	): Promise<void> {
		const data = [];
		data.push(START_BYTE);
		data.push(command.protocolId);
		data.push(command.rfidLen + 10);
		data.push(command.machineId);
		data.push(command.rfidLen);
		command.rfid.forEach((value) => {
			data.push(value);
		});
		data.push((command.money >> 8) & 0xff);
		data.push(command.money & 0xff);
		data.push(command.issueDate[0]);
		data.push(command.issueDate[1]);
		data.push(command.issueDate[2]);
		data.push(command.expireDate[0]);
		data.push(command.expireDate[1]);
		data.push(command.expireDate[2]);
		const checksum = calculateChecksum(data.slice(3, data.length));
		data.push(checksum);
		data.push(STOP_BYTE);
		if (this._port.open) {
			this._port.write(Buffer.from(data));
		}
	}

	public async sendConfig(config: Config): Promise<void> {
		const data = [];
		data.push(START_BYTE);
		data.push(config.protocolId);
		data.push(2);
		data.push(config.machineId);
		data.push(config.maxWaterFowAllowed);
		const checksum = calculateChecksum(data.slice(3, data.length));
		data.push(checksum);
		data.push(STOP_BYTE);
		if (this._port.open) {
			this._port.write(Buffer.from(data));
		}
	}

	getObservable(): Observable<BaseInterface> {
		return this._subject.pipe();
	}

	private _handleReadBufferFromDevice(buffer: Buffer): {
		success: boolean;
		cutLen: number;
	} {
		let cutLen = 0;
		const startByte = buffer.at(0);
		if (startByte !== START_BYTE) {
			this._logger.error(
				`Start byte ${startByte} is not valid, expected ${START_BYTE}`
			);
			return { success: false, cutLen: 0 };
		}

		const protocolId = buffer.at(1);
		if (!isValidProtocolId(protocolId)) {
			this._logger.error(`Protocol Id ${protocolId} is not valid`);
			return { success: false, cutLen: 0 };
		}
		const data_len = buffer.at(2);

		const checksum = buffer.at(3 + data_len);
		const expectedChecksum = calculateChecksumFromBuffer(
			buffer.slice(3, 3 + data_len)
		);
		if (checksum != expectedChecksum) {
			this._logger.error(
				`Check sum is not valid ${checksum} is not valid, expected ${expectedChecksum}`
			);
			return { success: false, cutLen: 0 };
		}

		switch (protocolId) {
			case ProtocolId.CONFIG_ACK:
			case ProtocolId.COMMAND_OPEN_VAN_ACK:
			case ProtocolId.COMMAND_PLAY_AUDIO_ACK:
			case ProtocolId.COMMAND_UPDATE_RFID_ACK: {
				const machineId = buffer.at(3);
				const ackMsg: BaseInterface = {
					machineId,
					protocolId,
				};
				cutLen = 4 + 2; // 1 for checksum , 1 for stop byte
				this.sendBack(ackMsg);
				break;
			}
			case ProtocolId.CONFIG_RESULT:
			case ProtocolId.COMMAND_OPEN_VAN_RESULT:
			case ProtocolId.COMMAND_PLAY_AUDIO_RESULT:
			case ProtocolId.COMMAND_UPDATE_RFID_RESULT: {
				const machineId = buffer.at(3);
				const result = buffer.at(4);
				const resultMsg: BaseResultInterface = {
					machineId,
					protocolId,
					result,
				};
				cutLen = 5 + 2; // 1 for checksum , 1 for stop byte
				this.sendBack(resultMsg);
				break;
			}
			case ProtocolId.STATUS: {
				const machineId = buffer.at(3);
				const placed_point_status = buffer.at(4);
				const solenoid_status = buffer.at(5);
				const water_flow_status = buffer.at(6);
				const rfid_placed_status = buffer.at(7);
				const error = buffer.at(8);
				const status: Status = {
					machineId,
					protocolId,
					placedPositionStatus: Boolean(placed_point_status),
					solenoidSensorStatus: Boolean(solenoid_status),
					waterFlowSensorStatus: water_flow_status,
					rfidPlacedStatus: Boolean(rfid_placed_status),
					error: {
						placedPositionError: Boolean(error & 0x01),
						waterFlowSensorError: Boolean((error >> 1) & 0x01),
						rfidError: Boolean((error >> 2) & 0x01),
						soundError: Boolean((error >> 3) & 0x01),
					},
				};
				this._logger.info(`Status message ${JSON.stringify(status)}`);
				cutLen = 9 + 2; // 1 for checksum , 1 for stopbyte
				this.sendBack(status);
				break;
			}
			case ProtocolId.RFID_DETECTED: {
				const machineId = buffer.at(3);
				const rfidLen = buffer.at(4);
				const rfid = [];
				for (let index = 0; index < rfidLen; index++) {
					rfid.push(buffer.at(5 + index));
				}
				const money =
					(buffer.at(5 + rfidLen) << 8) | buffer.at(6 + rfidLen);
				const issueDate = [
					buffer.at(7 + rfidLen),
					buffer.at(8 + rfidLen),
					buffer.at(9 + rfidLen),
				];
				const expireDate = [
					buffer.at(10 + rfidLen),
					buffer.at(11 + rfidLen),
					buffer.at(12 + rfidLen),
				];
				const rfidMsg: RFIDDetected = {
					machineId,
					protocolId,
					rfidLen,
					rfid,
					money,
					issueDate,
					expireDate,
				};
				cutLen = 13 + rfidLen + 2; // 1 for checksum , 1 for stop byte
				this.sendBack(rfidMsg);
				break;
			}
			default:
				break;
		}
		return { success: true, cutLen };
	}

	private sendBack<T extends BaseInterface>(message: T) {
		this._subject.next(message);
	}
}
