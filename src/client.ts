import { io } from "socket.io-client";
import {
	BaseInterface,
	CommandCancelOpenVan,
	CommandOpenVan,
	CommandPlayAudio,
	CommandUpdateRFID,
	ProtocolId,
} from "./interface";
import { Logger } from "./logger";

const logger = Logger.getLogger();

const machineId = 0;

const clientSocket = io("http://localhost:3000", {
	reconnectionDelayMax: 1000,
	extraHeaders: {
		id: `${machineId}`,
	},
});

clientSocket.on("connect", () => {
	logger.info("Client connected");
});
clientSocket.on("c2a", (message) => {
	logger.info(`Received ${JSON.stringify(message)}`);
});

clientSocket.on("disconnect", () => {
	logger.info("Client disconnected");
});

function sendCommandOpenVan() {
	const command: CommandOpenVan = {
		machineId,
		protocolId: ProtocolId.COMMAND_OPEN_VAN,
		volume: 100, // 100cc
	};
	clientSocket.emit("a2c", command);
}

function sendCommandCancelOpenVan() {
	const command: CommandCancelOpenVan = {
		machineId,
		protocolId: ProtocolId.COMMAND_CANCEL_OPEN_VAN,
	};
	clientSocket.emit("a2c", command);
}

function sendCommandPlayAudio() {
	const command: CommandPlayAudio = {
		machineId,
		protocolId: ProtocolId.COMMAND_PLAY_AUDIO,
		audioIndex: 0,
	};
	clientSocket.emit("a2c", command);
}

function sendCommandUpdateRFID() {
	const command: CommandUpdateRFID = {
		machineId,
		protocolId: ProtocolId.COMMAND_UPDATE_RFID,
		rfid: [163,52,18,8],
		rfidLen: 4,
		issueDate: [24, 1, 7],
		expireDate: [25, 1, 8],
		money: 200000, // 200k
	};
	clientSocket.emit("a2c", command);
}

// setInterval(() => {
// 	sendCommandOpenVan();
// }, 5000);

// setInterval(() => {
// 	sendCommandCancelOpenVan();
// }, 5000);

// setInterval(() => {
// 	sendCommandPlayAudio();
// }, 5000);

setInterval(() => {
	sendCommandUpdateRFID();
}, 5000);
