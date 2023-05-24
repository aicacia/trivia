import { MAX_INT, random } from '@aicacia/rand';
import { range } from '@aicacia/range';

export function createInsecureID() {
	return (Math.random() * MAX_INT) | 0;
}

export const DEFAULT_ROOM_ID_LENGTH = 6;

export function generateRoomId(length = DEFAULT_ROOM_ID_LENGTH): string {
	return range(0, length - 1)
		.iter()
		.map(() =>
			random() < 0.25
				? Math.floor(1 + random() * 9)
				: String.fromCharCode(97 + Math.floor(random() * 26))
		)
		.join('');
}
