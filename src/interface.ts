export enum ProtocolId {
	CONFIG = 0x01,
	CONFIG_ACK = 0x02,
	CONFIG_RESULT = 0x03,
	COMMAND_OPEN_VAN = 0x41,
	COMMAND_OPEN_VAN_ACK = 0x42,
	COMMAND_OPEN_VAN_RESULT = 0x43,
	COMMAND_CANCEL_OPEN_VAN = 0x44,
	COMMAND_CANCEL_OPEN_VAN_ACK = 0x45,
	COMMAND_CANCEL_OPEN_VAN_RESULT = 0x46,
	COMMAND_PLAY_AUDIO = 0x51,
	COMMAND_PLAY_AUDIO_ACK = 0x52,
	COMMAND_PLAY_AUDIO_RESULT = 0x53,
	COMMAND_UPDATE_RFID = 0x61,
	COMMAND_UPDATE_RFID_ACK = 0x62,
	COMMAND_UPDATE_RFID_RESULT = 0x63,
	STATUS = 0x81,
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
  
  export type BaseResultInterface = BaseInterface & {
	result: Result;
  };
  
  export type Config = BaseInterface & {
	maxWaterFowAllowed: number;
  };
  
  export type ConfigAck = BaseInterface;
  
  export type ConfigResult = BaseResultInterface;
  
  export type CommandOpenVan = BaseInterface & {
	volume: number;
  };
  
  export type CommandOpenVanAck = BaseInterface;
  
  export type CommandOpenVanResult = BaseResultInterface;
  
  export type CommandCancelOpenVan = BaseInterface;
  
  export type CommandCancelOpenVanAck = BaseInterface;
  
  export type CommandCancelOpenVanResult = BaseResultInterface;
  
  export type CommandPlayAudio = BaseInterface & {
	audioIndex: number;
  };
  
  export type CommandPlayAudioAck = BaseInterface;
  
  export type CommandPlayAudioResult = BaseResultInterface;
  
  export type CommandUpdateRFID = BaseInterface & RFID;
  
  export type CommandUpdateRFIDAck = BaseInterface;
  
  export type CommandUpdateRFIDResult = BaseResultInterface;
  
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
	isValid: boolean;
	volume: number;
	issueDate: number[];
  };
  
  export const START_BYTE = 0x78;
  export const STOP_BYTE = 0x79;
  