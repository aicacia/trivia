import { hashOf } from '@aicacia/hash';

const TRIVIA_API_BASE_URL = 'https://opentdb.com';

export const QUESTION_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type IQuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export const QUESTION_TYPES = ['multiple', 'boolean'] as const;
export type IQuestionType = (typeof QUESTION_TYPES)[number];

type IQuestionJSON = {
	category: string;
	type: IQuestionType;
	difficulty: IQuestionDifficulty;
	question: string;
	correct_answer: string;
	incorrect_answers: string[];
};

export type IQuestion = {
	category: string;
	type: IQuestionType;
	difficulty: IQuestionDifficulty;
	question: string;
	correct_answer: string;
	incorrect_answers: { [idx: number]: string };
};

export type IQuestions = {
	[id: string]: IQuestion;
};

export type ICategory = {
	id: number;
	category: string;
};

export type IGetQuestionsOptions = {
	token?: string;
	amount?: number;
	category?: number;
	difficulty?: IQuestionDifficulty;
	type?: IQuestionType;
};

export async function getQuestions({
	token,
	amount,
	category,
	difficulty,
	type
}: IGetQuestionsOptions = {}) {
	const url = new URL(`${TRIVIA_API_BASE_URL}/api.php`);
	if (token) {
		url.searchParams.set('token', token);
	}
	url.searchParams.set('amount', Math.min(Math.max(amount || 20, 5), 20).toString());
	if (category) {
		url.searchParams.set('category', category.toString());
	}
	if (difficulty) {
		url.searchParams.set('difficulty', difficulty);
	}
	if (type) {
		url.searchParams.set('tags', type);
	}
	const res = await fetch(url);
	if (res.ok) {
		const json = await res.json();
		return (json.results as IQuestionJSON[]).reduce((questions, json) => {
			const question = json as unknown as IQuestion;
			question.incorrect_answers = json.incorrect_answers.reduce((acc, incorrectAnswer, index) => {
				acc[index] = incorrectAnswer;
				return acc;
			}, {} as IQuestion['incorrect_answers']);
			questions[hashOf(question)] = question;
			return questions;
		}, {} as IQuestions);
	} else {
		throw res;
	}
}

export async function getCategories() {
	const res = await fetch(`${TRIVIA_API_BASE_URL}/api_category.php`);
	if (res.ok) {
		const json = await res.json();
		return json.trivia_categories as ICategory[];
	} else {
		throw res;
	}
}

export async function getSessionToken() {
	const res = await fetch(`${TRIVIA_API_BASE_URL}/api_token.php?command=request`);
	if (res.ok) {
		const json = await res.json();
		return json.token as string;
	} else {
		throw res;
	}
}

export async function resetSessionToken(token: string) {
	const res = await fetch(`${TRIVIA_API_BASE_URL}/api_token.php?command=reset&token=${token}`);
	if (res.ok) {
		const json = await res.json();
		return json.token as string;
	} else {
		throw res;
	}
}
