<svelte:options immutable />

<script lang="ts">
	import type { IQuestion } from '$lib/trivia';

	export let question: IQuestion;

	$: answers = Object.values(question.incorrect_answers).concat([question.correct_answer]);
	let selected: string;

	function createOnChange(a: string) {
		return (e: Event & { currentTarget: HTMLInputElement }) => {
			selected = a;
		};
	}
</script>

<div class="flex flex-col">
	{#each answers as a (a)}
		<div class="flex flex-row justify-start">
			<input type="checkbox" checked={selected === a} on:change={createOnChange(a)} />
			<div>{@html a}</div>
		</div>
	{/each}
</div>
