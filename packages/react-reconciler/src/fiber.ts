import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';
export class FiberNode {
	type: any;
	tag: WorkTag;
	key: Key;
	pendingProps: any;
	stateNode: any;
	ref: Ref;

	return: FiberNode | null;
	child: FiberNode | null;
	sibling: FiberNode | null;
	index: number;

	memoizedProps: Props | null;
	memoizedState: any;
	alternate: FiberNode | null;
	flags: Flags;
	subtreeFlags: Flags;
	updateQueue: unknown;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		//实例的属性
		this.tag = tag;
		this.key = key;
		//HostCompenent <div> -> div DOM
		this.stateNode = null;
		//fiber树的类型 functioncomponent 的类型
		this.type = null;

		//fiber树的属性
		this.return = null;
		this.sibling = null;
		this.child = null;
		//同级的index
		this.index = 0;
		this.ref = null;

		//工作单元
		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;

		this.alternate = null;
		//副作用
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
	}
}
export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;
	if (wip === null) {
		//mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.type = current.type;
		wip.stateNode = current.stateNode;
		wip.updateQueue = current.updateQueue;
		wip.alternate = current;
		current.alternate = wip;
	} else {
		//update
		wip.pendingProps = current.pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
		wip.updateQueue = current.updateQueue;
		wip.child = current.child;
		wip.memoizedProps = current.memoizedProps;
		wip.memoizedState = current.memoizedState;
	}
	return wip;
};

export const createFiberFromElement = (
	element: ReactElementType
): FiberNode => {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'string' && __DEV__) {
		console.log('未实现的type类型');
	}

	const fiber = new FiberNode(fiberTag, props, key);
	return fiber;
};
