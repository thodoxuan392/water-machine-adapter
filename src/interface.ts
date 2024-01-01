export enum ProtocolId {
	CONFIG = 0x01,
	CONFIG_ACK = 0x02,
	CONFIG_RESULT = 0x03,
	COMMAND_OPEN_VAN = 0x41,
	COMMAND_OPEN_VAN_ACK = 0x42,
	COMMAND_OPEN_VAN_RESULT = 0x43,
	COMMAND_PLAY_AUDIO = 0x44,
	COMMAND_PLAY_AUDIO_ACK = 0x45,
	COMMAND_PLAY_AUDIO_RESULT = 0x46,
	COMMAND_UPDATE_RFID = 0x47,
	COMMAND_UPDATE_RFID_ACK = 0x48,
	COMMAND_UPDATE_RFID_RESULT = 0x49,
	STATUS = 0x78,
	RFID_DETECTED = 0xc1,
}

export enum Result {
	RESULT_SUCCESS = 0x00,
	RESULT_FAILED = 0x01,
	RESULT_RFID_ERROR_NOT_AVAILABLE = 0x70,
	RESULT_RFID_ERROR_INVALID_FORMAT = 0x71,
	RESULT_RFID_ERROR_ID_NOT_MATCHED = 0x72,
	RESULT_RFID_ERROR_AUTHEN_FAILED = 0x73,
	RESULT_RFID_ERROR_CANNOT_WRITE = 0x74,
}

export type BaseInterface = {
	protocolId: ProtocolId;
	machineId: number;
};

export type Config = BaseInterface & {
	maxWaterFowAllowed: number;
};

export type ConfigAck = BaseInterface;

export type ConfigResult = BaseInterface & {
	result: Result;
};

export type CommandOpenVan = BaseInterface & {
	volume: number;
};

export type CommandOpenVanAck = BaseInterface;

export type CommandOpenVanResult = BaseInterface & {
	result: Result;
};

export type CommandPlayAudio = BaseInterface & {
	audioIndex: number;
};

export type CommandPlayAudioAck = BaseInterface;

export type CommandPlayAudioResult = BaseInterface & {
	result: Result;
};

export type CommandUpdateRFID = BaseInterface & RFID;

export type CommandUpdateRFIDAck = BaseInterface;

export type CommandUpdateRFIDResult = BaseInterface & {
	result: Result;
};

export type Status = BaseInterface & {
	placedPositionStatus: boolean;
	solenoidSensorStatus: boolean;
	waterFlowSensorStatus: number;
	rfidPlacedStatus: boolean;
	error: {
		placedPositionError: boolean;
		waterFlowSensorError: boolean;
		rfidError: boolean;
		soundError: boolean;
	};
};

export type RFIDDetected = BaseInterface & RFID;

export type RFID = {
	rfidLen: number;
	rfid: number[];
	money: number;
	issueDate: number[];
	expireDate: number[];
};
