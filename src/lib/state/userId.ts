import { derived, get } from 'svelte/store';
import { localstorageWritable } from 'svelte-localstorage-writable';
import { v4 } from 'uuid';

const userIdWritable = localstorageWritable('user_id', v4());

export const userId = derived(userIdWritable, (state) => state);

export function getUserId(): string {
	return get(userIdWritable);
}
