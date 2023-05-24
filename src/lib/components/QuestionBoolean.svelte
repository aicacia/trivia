<svelte:options immutable />

<script lang="ts">
	import type { IQuestion } from '$lib/trivia';

	export let question: IQuestion;
</script>

<div class="flex flex-col">
	<div class="flex flex-row">
		<input type="checkbox" name="true" />
		<label for="true">True</label>
	</div>
	<div class="flex flex-row">
		<input type="checkbox" name="false" />
		<label for="false">False</label>
	</div>
</div>
