import type { IGetQuestionsOptions, IQuestions } from '$lib/trivia';
import { Graph } from '@aicacia/graph';
import { Peer, Mesh } from '@aicacia/mesh';

export const COLORS = [
	'red',
	'blue',
	'green',
	'yellow',
	'purple',
	'orange',
	'white',
	'black',
	'brown'
] as const;

export type IColor = (typeof COLORS)[number];

export type IUser = {
	id: string;
	name: string;
	team: IColor;
};

export type IUsers = {
	[userId: string]: IUser;
};

export type IResults = {
	[questionId: string]: IColor;
};

export type IState = {
	users: IUsers;
	fetcher: IUser['id'];
	started: boolean;
	starting: boolean;
	timePerQuestion: number;
	getQuestionsOptions: IGetQuestionsOptions;
	questions: IQuestions;
	seed: number;
	currentQuestionId: string;
	results: IResults;
};

const graphs: { [roomId: string]: Graph<IState> } = {};

export function getOrCreateGraphForRoomId(roomId: string) {
	let graph = graphs[roomId];
	if (!graph) {
		graph = new Graph<IState>();
		const peer = new Peer(
			window.io(`wss://mesh.aicacia.com/io-github-trivia-${roomId}`, {
				transports: ['websocket'],
				withCredentials: true
			}),
			window.SimplePeer
		);
		const mesh = new Mesh(peer);

		mesh.on('data', (data) => {
			if ('json' in data) {
				graph.merge(data.path, data.json);
			} else {
				const node = graph.getNodeAtPath(data.path);

				if (node) {
					mesh.broadcast({
						path: node.getPath(),
						json: node.toJSON()
					});
				}
			}
		});

		graph
			.on('set', (path, json) => {
				mesh.broadcast({
					path,
					json
				});
			})
			.on('get', (path) => {
				mesh.broadcast({
					path
				});
			});
	}
	return graph;
}
