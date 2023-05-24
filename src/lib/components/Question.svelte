<svelte:options immutable />

<script lang="ts">
	import type { IQuestion } from '$lib/trivia';
	import QuestionMultiple from './QuestionMultiple.svelte';
	import QuestionBoolean from './QuestionBoolean.svelte';

	export let question: IQuestion;
</script>

<div>
	<h3>{question.category}</h3>
	<p>{@html question.question}</p>
	<hr />
	{#if question.type === 'multiple'}
		<QuestionMultiple {question} />
	{:else if question.type === 'boolean'}
		<QuestionBoolean {question} />
	{/if}
</div>
