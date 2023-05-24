import { createInsecureID } from '$lib/util';
import type { Readable } from 'svelte/store';
import { writable } from 'svelte/store';

export enum NotificationType {
	Success = 'success',
	Error = 'error',
	Info = 'info',
	Warning = 'warning'
}

export interface INotification {
	id: number;
	message: string;
	type: NotificationType;
}

const writableNotifications = writable<INotification[]>([]);

export const notifications: Readable<INotification[]> = writableNotifications;

export function createNotification(
	message: string,
	type: NotificationType = NotificationType.Error,
	deleteAfterMS = 5000
) {
	const id = createInsecureID();
	writableNotifications.update((state) => [
		...state,
		{
			id,
			message,
			type
		}
	]);
	setTimeout(() => removeNotification(id), deleteAfterMS);
	return id;
}

export function removeNotification(id: number): void {
	writableNotifications.update((state) => {
		const index = state.findIndex((notification) => notification.id === id);

		if (index === -1) {
			return state;
		} else {
			const newState = state.slice();
			newState.splice(index, 1);
			return newState;
		}
	});
}
