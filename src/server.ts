import { DeviceMock } from "./device.mock";
import { Server as SocketIoServer } from "socket.io";
import { createServer } from "http";
import {
	BaseInterface,
	CommandOpenVan,
	CommandPlayAudio,
	CommandUpdateRFID,
	Config,
	ProtocolId,
} from "./interface";
import { Logger } from "./logger";
import { Device } from "./device";

export class Server {
	// private _device = new Device();
	private _deviceMock = new DeviceMock();
	private _httpServer = createServer();
	private _server = new SocketIoServer(this._httpServer);
	private _logger = Logger.getLogger();

	async start(): Promise<void> {
		// Start server
		this._server.on("connection", (socket) => {
			this._logger.info(`New client connected with id ${socket.id}`);
			const machineId = socket.handshake.headers?.id;

			// Join to room
			socket.join(`machine:${machineId}`);

			socket.on("a2c", async (message) => {
				this._handleMessageFromPc(message);
			});
		});

		this._deviceMock.getObservable().subscribe({
			next: (message: BaseInterface) => {
				this._handleMessageFromDevice(message);
			},
		});
		this._httpServer.listen(3000);
		this._deviceMock.start();
	}

	private _handleMessageFromDevice(message: BaseInterface) {
		const { machineId } = message;
		this._server.to(`machine:${machineId}`).emit("c2a", message);
	}
	private _handleMessageFromPc(message: BaseInterface) {
		this._logger.info(
			`Received message from PC: ${JSON.stringify(message)}`
		);
		const { protocolId } = message;
		switch (protocolId) {
			case ProtocolId.CONFIG:
				this._deviceMock.sendConfig(message as Config);
				break;
			case ProtocolId.COMMAND_OPEN_VAN:
				this._deviceMock.sendCommandOpenVan(message as CommandOpenVan);
				break;
			case ProtocolId.COMMAND_PLAY_AUDIO:
				this._deviceMock.sendCommandPlayAudio(
					message as CommandPlayAudio
				);
				break;
			case ProtocolId.COMMAND_UPDATE_RFID:
				this._deviceMock.sendCommandUpdateRFID(
					message as CommandUpdateRFID
				);
				break;
			default:
				break;
		}
	}
}
