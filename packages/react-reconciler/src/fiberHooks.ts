import internals from 'shared/internals';
import { FiberNode } from './fiber';
import { Action } from 'shared/ReactTypes';
import { UpdateQueue, createUpdateQueue, enqueueUpdate } from './updateQueue';
import { Dispatch } from 'react/src/currentDispatcher';
import { createUpdate } from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
const { currentDispatcher } = internals;

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null; //当前正在工作的hook

interface Hook {
  memoizedState: any;
  updateQueue: unknown;
  next: Hook | null;
}

export function renderWithHooks(wip: FiberNode) {
  //赋值操作
  currentlyRenderingFiber = wip;
  wip.memoizedState = null;

  const current = wip.alternate;
  if (current !== null) {
    //update
  } else {
    currentDispatcher.current = HooksDispatcherOnMount;
  }

  const Component = wip.type;
  const props = wip.pendingProps;
  const children = Component(props);

  //重置操作

  currentlyRenderingFiber = null;
  return children;
}

const HooksDispatcherOnMount = {
  useState: mountState
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
  const queue = createUpdateQueue<State>();
  hook.updateQueue = queue;
  //@ts-ignore
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
  queue.dispatch = dispatch;
  return [memoizedState, dispatch];
}

function dispatchSetState<State>(
  fiber: FiberNode,
  updateQueue: UpdateQueue<State>,
  action: Action<State>
) {
  const update = createUpdate(action);
  enqueueUpdate(updateQueue, update);
  scheduleUpdateOnFiber(fiber);
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
