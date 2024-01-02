import { ProtocolId } from "./interface";

export function calculateChecksum(array: number[]): number {
	let result = array[0];
	const sliced = array.slice(1, array.length);
	sliced.forEach((element) => {
		result ^= element;
	});
	return result;
}

export function calculateChecksumFromBuffer(array: Buffer): number {
	let result = 0;
	array.forEach((element) => {
		result ^= element;
	});
	return result;
}

export function isValidProtocolId(protocolId: number): boolean {
	return Object.values(ProtocolId).includes(protocolId);
}
