import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { HostRoot } from './workTags';
import { MutationMask, NoFlags } from './fiberFlags';
import { commitMutationEffects } from './commitWork';
import {
	Lane,
	NoLane,
	SyncLane,
	getHighPriorityLanes,
	mergeLanes,
	markRootFinished
} from './fiberLanes';
import { scheduleSyncCallback, flushSyncCallbacks } from './syncTaskQueue';
import { scheduleMicrotask } from 'hostConfig';

let workInProgress: FiberNode | null = null;
let wipRootRenderLane: Lane = NoLane; //本次更新的Lane是什么
function prepareFreshStack(root: FiberRootNode, lane: Lane) {
	workInProgress = createWorkInProgress(root.current, {});
	wipRootRenderLane = lane;
}

export function scheduleUpdateOnFiber(fiber: FiberNode, lane: Lane) {
	//TODO 调度功能

	//拿到fiberRootNode
	const root = markUpdateFromFiberToRoot(fiber);
	markRootUpdated(root, lane);
	ensureRootIsScheduled(root);
}
//保证我们的root被调度了
function ensureRootIsScheduled(root: FiberRootNode) {
	const updateLane = getHighPriorityLanes(root.pendingLanes);
	if (updateLane === NoLane) {
		return;
	}
	if (updateLane === SyncLane) {
		//同步优先级，用微任务调度
		if (__DEV__) {
			console.log('在微任务中调度，优先级:', updateLane);
		}
		scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane));
		scheduleMicrotask(flushSyncCallbacks);
	} else {
		//其他优先级，用宏任务调度
	}
}

function markRootUpdated(root: FiberRootNode, updateLane: Lane) {
	root.pendingLanes = mergeLanes(root.pendingLanes, updateLane);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

function performSyncWorkOnRoot(root: FiberRootNode, lane: Lane) {
	const nextLane = getHighPriorityLanes(root.pendingLanes);
	if (nextLane !== SyncLane) {
		//其他比SyncLane低的优先级，用宏任务调度
		//NoLane
		ensureRootIsScheduled(root);
		return;
	}
	//初始化
	prepareFreshStack(root, lane);
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.log('workLoop error', e);
			}
			workInProgress = null;
		}
	} while (true);
	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;
	root.finishedLane = SyncLane;
	wipRootRenderLane = NoLane;
	//提交这颗树
	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;
	if (finishedWork === null) {
		return;
	}
	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}
	const lane = root.finishedLane;
	if (lane === NoLane && __DEV__) {
		console.error('commit阶段finishedLane不应该是NoLane');
	}
	//重置
	root.finishedWork = null;
	root.finishedLane = NoLane;

	markRootFinished(root, lane);

	//是否存在3个子阶段需要执行的操作
	//root flags root subtree flags
	const subtreeHasEffects =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffects || rootHasEffect) {
		//1、before mutation阶段

		//2、mutation阶段
		commitMutationEffects(finishedWork);
		root.current = finishedWork;

		//3、layout阶段
		return;
	} else {
		//不需要effect阶段
		root.current = finishedWork;
	}
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	//有子节点，遍历子节点
	const next = beginWork(fiber, wipRootRenderLane);
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		//没有子节点，返回父节点
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	//没有子节点，遍历兄弟节点
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
