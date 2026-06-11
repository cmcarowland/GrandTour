import type { RequestHandler } from './$types';

import { subscribeToStateChanges } from '$lib/server/store';

export const GET: RequestHandler = () => {
	const encoder = new TextEncoder();
	let unsubscribe = () => {};

	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue(encoder.encode(': connected\n\n'));
			unsubscribe = subscribeToStateChanges(() => {
				controller.enqueue(encoder.encode(`data: ${Date.now()}\n\n`));
			});
		},
		cancel() {
			unsubscribe();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive'
		}
	});
};