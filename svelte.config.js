import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: true
		}),
		appDir: 'internal',
		paths: {
			base: process.env.USE_BASE_PATH ? '/trivia' : ''
		},
		csp: {
			mode: 'hash',
			directives: {
				'default-src': [
					'self',
					'https://unpkg.com',
					'https://opentdb.com',
					'wss://mesh.aicacia.com'
				].concat(isDev ? ['ws://*:*'] : []),
				'img-src': ['self', 'data:'],
				'font-src': ['self', 'blob:', 'data:'],
				'style-src': ['self', 'unsafe-inline']
			}
		}
	}
};

export default config;
