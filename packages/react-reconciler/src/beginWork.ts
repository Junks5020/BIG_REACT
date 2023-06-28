import { FiberNode } from './fiber';
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText
} from './workTags';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
export const beginWork = (wip: FiberNode) => {
  //比较，返回子fiberNode
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip);
    case HostComponent:
      return updateHostComponent(wip);
    case HostText:
      return null;
    case FunctionComponent:
      return updateFunctionComponent(wip);
    default:
      if (__DEV__) {
        console.warn('未实现的类型');
      }
      break;
  }
  return null;
};
function updateFunctionComponent(wip: FiberNode) {
  return null;
}

function updateHostRoot(wip: FiberNode) {
  const baseState = wip.memoizedState;
  const updateQueue = wip.updateQueue as UpdateQueue<ReactElementType>;
  const pending = updateQueue.shared.pending;
  updateQueue.shared.pending = null;
  const { memoizedState } = processUpdateQueue(baseState, pending);
  wip.memoizedState = memoizedState;
  //对比孩子节点ReactElement 和 FiberNode
  const nextChildren = wip.memoizedState;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function updateHostComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps;
  const nextChildren = nextProps.children;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
  const current = wip.alternate;
  if (current === null) {
    //mount
    wip.child = mountChildFibers(wip, null, children);
  } else {
    //update
    wip.child = reconcileChildFibers(wip, current?.child, children);
  }
}
