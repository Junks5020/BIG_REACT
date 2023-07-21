import { Action } from 'shared/ReactTypes';
import { Dispatch } from 'react/src/currentDispatcher';
import { Lane } from './fiberLanes';
export interface Update<State> {
	action: Action<State>;
	lane: Lane;
	next: Update<any> | null;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(action: Action<State>, lane: Lane) => {
	return {
		action,
		lane,
		next: null
	};
};

export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		},
		dispatch: null
	} as UpdateQueue<State>;
};

export const enqueueUpdate = <State>(
	UpdateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	const pending = UpdateQueue.shared.pending;
	if (pending === null) {
		update.next = update;
	} else {
		update.next = pending.next;
		pending.next = update;
	}
	UpdateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			//baseState = 1 Update = (x)=>4x moemoizedState = 4
			result.memoizedState = action(baseState);
		} else {
			//baseState = 1 Update =2 moemoizedState = 2
			result.memoizedState = action;
		}
	}
	return result;
};
