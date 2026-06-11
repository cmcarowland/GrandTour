import { browser } from '$app/environment';

const channelName = 'grandtour-state-sync';
const storageKey = 'grandtour-state-sync';

export function broadcastStateChange(): void {
	if (!browser) {
		return;
	}

	if ('BroadcastChannel' in window) {
		const channel = new BroadcastChannel(channelName);
		channel.postMessage(Date.now());
		channel.close();
		return;
	}

	localStorage.setItem(storageKey, String(Date.now()));
	localStorage.removeItem(storageKey);
}

export function listenForStateChanges(onChange: () => void): () => void {
	if (!browser) {
		return () => {};
	}

	let channel: BroadcastChannel | null = null;
	let eventSource: EventSource | null = null;
	const handleChannelMessage = () => onChange();
	const handleStreamMessage = () => onChange();
	const handleStorageEvent = (event: StorageEvent) => {
		if (event.key === storageKey) {
			onChange();
		}
	};

	if ('BroadcastChannel' in window) {
		channel = new BroadcastChannel(channelName);
		channel.addEventListener('message', handleChannelMessage);
	}

	eventSource = new EventSource('/api/state-sync');
	eventSource.addEventListener('message', handleStreamMessage);

	window.addEventListener('storage', handleStorageEvent);

	return () => {
		channel?.removeEventListener('message', handleChannelMessage);
		channel?.close();
		eventSource?.removeEventListener('message', handleStreamMessage);
		eventSource?.close();
		window.removeEventListener('storage', handleStorageEvent);
	};
}