<svelte:options immutable />

<script lang="ts">
	import { getOrCreateGraphForRoomId, type IResults, type IUsers } from '$lib/state/rooms';
	import { userId } from '$lib/state/userId';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import {
		getQuestions,
		type IGetQuestionsOptions,
		type IQuestion,
		type IQuestions
	} from '$lib/trivia';
	import { XorShiftRng } from '@aicacia/rand';
	import Question from '$lib/components/Question.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	export let data: PageData;

	const graph = getOrCreateGraphForRoomId(data.room_id);

	$: currentUserId = $userId;
	$: user = graph.get('users').get(currentUserId);
	let users: IUsers = {};
	let fetcher: string;
	let getQuestionsOptions: IGetQuestionsOptions;
	let results: IResults = {};
	let questions: IQuestions = {};
	let currentQuestionId: string;
	let timePerQuestion: number;
	let seed: number;

	const rng = new XorShiftRng();
	$: if (seed) {
		rng.setSeed(seed);
	}

	function getNextQuestionId(): string | null {
		const ids = Object.keys(questions);
		if (ids.length === 0 || ids.length === Object.keys(results).length) {
			return null;
		}
		return rng
			.fromArray(ids)
			.map((questionId) => {
				if (questionId in results) {
					return getNextQuestionId();
				} else {
					return questionId;
				}
			})
			.unwrapOr(null);
	}

	$: ready = seed && getQuestionsOptions;

	$: if (ready && !getQuestionsOptions.token) {
		goto(`${base}/${data.room_id}/lobby`);
	}
	$: if (
		ready &&
		getQuestionsOptions.token &&
		currentUserId === fetcher &&
		!Object.keys(questions).length
	) {
		fetchQuestions();
	}

	let fetchingQuestions = false;
	async function fetchQuestions() {
		if (fetchingQuestions) {
			return;
		}
		fetchingQuestions = true;
		try {
			const nextUser = rng.fromArray(Object.keys(users));
			nextUser.ifSome((fetcher) => graph.get('fetcher').set(fetcher));
			questions = await getQuestions(getQuestionsOptions);
			graph.get('questions').set(questions);
			const questionId = getNextQuestionId();
			if (questionId) {
				currentQuestionId = questionId;
				graph.get('currentQuestionId').set(currentQuestionId);
			}
		} finally {
			fetchingQuestions = false;
		}
	}

	onMount(() => {
		const removeCallbacks = [
			graph.get('results').on(async (state) => {
				if (!state) {
					return;
				}
				results = state;
			}),
			graph.get('timePerQuestion').on(async (state) => {
				if (!state) {
					return;
				}
				timePerQuestion = state;
			}),
			graph.get('seed').on(async (state) => {
				if (!state) {
					return;
				}
				seed = state;
			}),
			graph.get('currentQuestionId').on(async (state) => {
				if (!state) {
					return;
				}
				currentQuestionId = state;
			}),
			graph.get('questions').on(async (state) => {
				if (!state) {
					return;
				}
				questions = (
					await Promise.all(
						Object.entries(state).map(async ([id, ref]) => {
							const question = await ref;
							if (question) {
								const incorrect_answers = await question.incorrect_answers;
								if (incorrect_answers) {
									return [id, { ...question, incorrect_answers }] as unknown as [
										id: string,
										question: IQuestion
									];
								}
							}
							return null;
						})
					)
				)
					.filter((result) => !!result)
					.reduce((acc, [id, question]) => {
						if (question && id) {
							acc[id] = question;
						}
						return acc;
					}, {} as IQuestions);
			}),
			graph.get('getQuestionsOptions').on(async (state) => {
				if (!state) {
					return;
				}
				getQuestionsOptions = state;
			}),
			graph.get('fetcher').on(async (state) => {
				if (!state) {
					return;
				}
				fetcher = state;
			}),
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
			})
		];

		return () => {
			for (const removeCallback of removeCallbacks) {
				removeCallback();
			}
		};
	});
</script>

<svelte:head>
	<title>Trivia {data.room_id.toUpperCase()}</title>
</svelte:head>

{#if currentQuestionId}
	{@const currentQuestion = questions[currentQuestionId]}
	{#if currentQuestion}
		<Question question={currentQuestion} />
	{/if}
{/if}
