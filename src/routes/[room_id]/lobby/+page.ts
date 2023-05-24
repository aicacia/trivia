import type { PageLoad } from './$types';

export const load: PageLoad = (event) => {
	return {
		room_id: event.params.room_id
	};
};
