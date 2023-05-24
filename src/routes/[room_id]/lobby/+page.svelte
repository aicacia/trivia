<svelte:options immutable />

<script lang="ts" context="module">
	function sortById(a: IUser, b: IUser) {
		return a.id.localeCompare(b.id);
	}
	const TIME_PER_QUESTION_OPTIONS = [
		{ value: 30000, name: '30 seconds' },
		{ value: 60000, name: '1 minute' },
		{ value: 120000, name: '2 minutes' },
		{ value: 180000, name: '3 minutes' },
		{ value: 240000, name: '4 minutes' },
		{ value: 300000, name: '5 minutes' }
	];
</script>

<script lang="ts">
	import FaQrcode from 'svelte-icons/fa/FaQrcode.svelte';
	import {
		COLORS,
		getOrCreateGraphForRoomId,
		type IColor,
		type IUser,
		type IUsers
	} from '$lib/state/rooms';
	import { userId } from '$lib/state/userId';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { createInsecureID } from '$lib/util';
	import { browser } from '$app/environment';
	import QrCode from '$lib/components/QRCode.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { fromArray } from '@aicacia/rand';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { QUESTION_DIFFICULTIES, type IQuestionDifficulty, getSessionToken } from '$lib/trivia';

	export let data: PageData;

	const graph = getOrCreateGraphForRoomId(data.room_id);

	$: if (browser && started) {
		goto(`${base}/${data.room_id}/game`);
	}

	$: currentUserId = $userId;
	$: user = graph.get('users').get(currentUserId);

	let username = `Guest ${createInsecureID()}`;
	let team = fromArray(COLORS as any).unwrap() as IColor;
	let users: IUsers = {};
	let started = false;
	$: userList = Object.values(users).sort(sortById) as IUser[];
	$: teams = userList.reduce((acc, user) => {
		acc.add(user.team);
		return acc;
	}, new Set<string>()).size;

	function onUsernameChange(e: Event & { currentTarget: HTMLInputElement }) {
		username = e.currentTarget.value;
		user.get('name').set(username);
	}
	function onUsernameBlur(_e: Event & { currentTarget: HTMLInputElement }) {
		const newUsername = username.trim();
		if (newUsername !== username) {
			username = newUsername;
			user.get('name').set(username);
		}
	}
	function onUserTeamChange(e: Event & { currentTarget: HTMLSelectElement }) {
		team = e.currentTarget.value as IColor;
		user.get('team').set(team);
	}

	let difficulty = '' as IQuestionDifficulty;
	function onDifficultyChange(e: Event & { currentTarget: HTMLSelectElement }) {
		difficulty = e.currentTarget.value as IQuestionDifficulty;
		graph.get('getQuestionsOptions').get('difficulty').set(difficulty);
	}

	let timePerQuestion = 60000;
	function onTimePerQuestionChange(e: Event & { currentTarget: HTMLSelectElement }) {
		timePerQuestion = +e.currentTarget.value;
		graph.get('timePerQuestion').set(timePerQuestion);
	}

	let showQrCode = false;
	function onShowQrCode() {
		showQrCode = true;
	}

	let showExit = false;
	function onOpenExit() {
		showExit = true;
	}

	let starting = false;
	async function onStart() {
		graph.get('starting').set(true);
		graph
			.get('getQuestionsOptions')
			.get('token')
			.set(await getSessionToken());
		graph.get('started').set(true);
		graph.get('fetcher').set(currentUserId);
		try {
			await goto(`${base}/${data.room_id}/game`);
		} finally {
			graph.get('starting').set(false);
		}
	}

	onMount(() => {
		const removeCallbacks = [
			graph.get('users').on(async (state) => {
				if (!state) {
					return;
				}
				users = (await Promise.all(Object.values(state))).reduce((acc, user) => {
					if (user && user.id) {
						if (!user.name) {
							user.name = '';
						}
						acc[user.id] = user;
					}
					return acc;
				}, {} as IUsers);
			}),
			graph.get('started').on((state) => {
				if (state != null) {
					started = state;
				}
			}),
			graph.get('starting').on((state) => {
				if (state != null) {
					starting = state;
				}
			}),
			graph
				.get('getQuestionsOptions')
				.get('difficulty')
				.on(async (state) => {
					if (state != null) {
						difficulty = state;
					}
				})
		];

		if (browser) {
			user.get('id').set(currentUserId);
			user
				.get('team')
				.then((currentTeam) => {
					if (currentTeam) {
						team = currentTeam;
					} else {
						throw new Error();
					}
				})
				.catch((_error) => {
					user.get('team').set(team);
				});
			user
				.get('name')
				.then((currentUsername) => {
					if (currentUsername) {
						username = currentUsername;
					} else {
						throw new Error();
					}
				})
				.catch((_error) => {
					user.get('name').set(username);
				});
			graph.get('seed').set((Date.now() * Math.random() * 1000) | 0);
		}

		return () => {
			for (const removeCallback of removeCallbacks) {
				removeCallback();
			}
		};
	});
</script>

<svelte:head>
	<title>Lobby {data.room_id.toUpperCase()}</title>
</svelte:head>

<h1 class="text-center">
	Lobby <button class="btn primary icon" on:click={onShowQrCode}
		><div class="w-8 h-8"><FaQrcode /></div></button
	>
</h1>
<hr class="mt-1 mb-2" />

<label for="username">Username</label>
<input
	type="text"
	name="username"
	class="mb-2"
	placeholder="Username"
	value={username}
	maxlength={50}
	on:input={onUsernameChange}
	on:blur={onUsernameBlur}
/>
<label for="team">Team</label>
<select name="team" on:change={onUserTeamChange} class="capitalize">
	{#each COLORS as color (color)}
		<option value={color} selected={color === team} class="capitalize">{color}</option>
	{/each}
</select>

<hr class="my-2" />

<label for="difficulty">Difficulty</label>
<select name="difficulty" on:change={onDifficultyChange} class="capitalize">
	<option value="" selected={undefined === difficulty} class="capitalize">Any</option>
	{#each QUESTION_DIFFICULTIES as d (d)}
		<option value={d} selected={d === difficulty} class="capitalize">{d}</option>
	{/each}
</select>

<label for="timePerQuestion">Time per Question</label>
<select name="timePerQuestion" on:change={onTimePerQuestionChange}>
	{#each TIME_PER_QUESTION_OPTIONS as option}
		<option value={option.value} selected={option.value === timePerQuestion}>{option.name}</option>
	{/each}
</select>

{#each userList as user, index (user.id)}
	<div class="flex justify-between w-full">
		<div class="flex flex-row flex-grow overflow-hidden">
			<p class="text-2xl p-1 font-bold overflow-hidden text-ellipsis">
				{user.name}
				{#if user.id === currentUserId}(You){/if}
			</p>
		</div>
		<div class="flex flex-shrink items-center">
			<div class="border w-8 h-8" style="background:{user.team}" />
		</div>
	</div>
	{#if index < userList.length - 1}
		<hr />
	{/if}
{/each}

<div class="flex flex-row justify-between mt-4">
	<button class="btn danger" on:click={onOpenExit}>Leave</button>
	<button class="btn primary" disabled={starting || teams <= 1} on:click={onStart}
		>{#if teams <= 1}Not enough teams{:else}Start{/if}</button
	>
</div>

<Modal bind:open={showQrCode}>
	<h2 slot="title">Room <span class="uppercase font-bold">{data.room_id}</span></h2>
	{#if browser}
		<QrCode value={window.location.href} />
	{/if}
</Modal>

<Modal bind:open={showExit}>
	<h2 slot="title">Leave Lobby? are you sure?</h2>
	<div class="flex flex-row justify-end">
		<a class="btn danger" href={`${base}/`}>Leave</a>
	</div>
</Modal>
