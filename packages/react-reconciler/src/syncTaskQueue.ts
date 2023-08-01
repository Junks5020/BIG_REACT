//当前是否正在冲洗任务队列
let isFlushingSyncQueue = false;
let syncQueue: ((...args: any) => void)[] | null = null;

export function scheduleSyncCallback(callback: (...args: any) => void) {
	if (syncQueue === null) {
		syncQueue = [callback];
	} else {
		syncQueue.push(callback);
	}
}

export function flushSyncCallbacks() {
	if (!isFlushingSyncQueue && syncQueue) {
		isFlushingSyncQueue = true;
		try {
			syncQueue.forEach((callback) => {
				callback();
			});
			syncQueue = null;
		} catch (e) {
			if (__DEV__) {
				console.error('flushSyncQueue报错', e);
			}
		} finally {
			isFlushingSyncQueue = false;
		}
	}
}
