import internals from 'shared/internals';
import { FiberNode } from './fiber';
import { Action } from 'shared/ReactTypes';
import {
	UpdateQueue,
	createUpdateQueue,
	enqueueUpdate,
	processUpdateQueue
} from './updateQueue';
import { Dispatch } from 'react/src/currentDispatcher';
import { createUpdate } from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { Lane, requestUpdateLane, NoLane } from './fiberLanes';
const { currentDispatcher } = internals;

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;
let renderLane: Lane = NoLane;
interface Hook {
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}

export function renderWithHooks(wip: FiberNode, lane: Lane) {
	//赋值操作
	currentlyRenderingFiber = wip;
	wip.memoizedState = null;
	renderLane = lane;

	const current = wip.alternate;
	if (current !== null) {
		//update
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

	//重置操作
	renderLane = NoLane;
	currentlyRenderingFiber = null;
	return children;
}

const HooksDispatcherOnMount = {
	useState: mountState
};
const HooksDispatcherOnUpdate = {
	useState: updateState
};

function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	//找到当前useState对应的hook数据
	const hook = mountWorkInProgresHook();
	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}
	hook.memoizedState = memoizedState;
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
	queue.dispatch = dispatch;

	return [memoizedState, dispatch];
}

function updateState<State>(): [State, Dispatch<State>] {
	//找到当前useState对应的hook数据
	const hook = updateWorkInProgresHook();

	//计算新的state
	const queue = hook.updateQueue as UpdateQueue<State>;
	const pending = queue.shared.pending;
	if (pending !== null) {
		const { memoizedState } = processUpdateQueue(
			hook.memoizedState,
			pending,
			renderLane
		);
		hook.memoizedState = memoizedState;
		queue.shared.pending = null;
	}
	return [hook.memoizedState, queue.dispatch as Dispatch<State>];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const lane = requestUpdateLane();
	const update = createUpdate(action, lane);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber, lane);
}

function mountWorkInProgresHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		next: null,
		updateQueue: null
	};
	if (workInProgressHook === null) {
		//mount时，第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('Invalid hook call');
		} else {
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}
	return workInProgressHook;
}

function updateWorkInProgresHook(): Hook {
	//TODO: render阶段的更新
	let nextCurrentHook: Hook | null;
	if (currentHook === null) {
		// 这是这个FC 的第一个 hook
		const current = currentlyRenderingFiber?.alternate;
		if (current !== null) {
			nextCurrentHook = current?.memoizedState;
		} else {
			nextCurrentHook = null;
		}
	} else {
		//这个FC update时后续的hook
		nextCurrentHook = currentHook.next;
	}
	if (nextCurrentHook === null) {
		//
		throw new Error(`组件${currentlyRenderingFiber?.type}的hook数量不匹配`);
	}
	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null
	};
	if (workInProgressHook === null) {
		//mount时，第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('Invalid hook call');
		} else {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}
	return workInProgressHook;
}
