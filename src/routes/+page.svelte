<svelte:options immutable />

<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { generateRoomId, DEFAULT_ROOM_ID_LENGTH } from '$lib/util';

	let roomId = '';
	function onRoomIdChange(e: Event & { currentTarget: HTMLInputElement }) {
		roomId = e.currentTarget.value.toUpperCase();
	}

	async function onHost() {
		roomId = generateRoomId().toUpperCase();
		await gotoRoomId();
	}
	async function gotoRoomId() {
		await goto(`${base}/${roomId.toLowerCase()}/lobby`);
	}
</script>

<svelte:head>
	<title>Trivia</title>
</svelte:head>

<a class="text-6xl bold mt-2 text-center" href={`${base}/`}>Trivia</a>
<hr class="mt-1 mb-8" />

<button class="btn lg primary block" on:click={onHost}>Start a new Game!</button>
<form class="flex flex-row mt-8" on:submit|preventDefault={gotoRoomId}>
	<input
		class="flex flex-grow"
		type="text"
		value={roomId}
		maxlength={DEFAULT_ROOM_ID_LENGTH}
		on:input={onRoomIdChange}
		placeholder="Join a Trivia with a Room Id"
	/>
	{#if roomId}
		<input
			class="btn primary flex flex-shrink"
			type="submit"
			disabled={roomId.length !== DEFAULT_ROOM_ID_LENGTH}
			value="Join"
		/>
	{/if}
</form>
