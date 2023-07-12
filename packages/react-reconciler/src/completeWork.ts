import { FiberNode } from './fiber';
import {
  HostComponent,
  HostRoot,
  HostText,
  FunctionComponent
} from './workTags';
import { NoFlags, Update } from './fiberFlags';
import {
  createInstance,
  createTextInstance,
  appendInitialChild,
  Container
} from 'hostConfig';
import { updateFiberProps } from 'react-dom/src/SyntheticEvent';
export const completeWork = (wip: FiberNode) => {
  //递归中的归
  const newPorps = wip.pendingProps;
  const current = wip.alternate;

  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode) {
        //update
        //props 是否变化，
        //变了，Update flag
        updateFiberProps(wip.stateNode, newPorps);
      } else {
        //mount
        //1、构建DOM
        const instance = createInstance(wip.type, newPorps);
        //2、将DOM插入到DOM树中
        appendAllChildren(instance, wip);
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostText:
      if (current !== null && wip.stateNode) {
        //update
        const oldText = current.memoizedProps?.content;
        const newText = newPorps.content;
        if (oldText !== newText) {
          markUpdate(wip);
        }
      } else {
        //mount
        //1、构建DOM
        const instance = createTextInstance(newPorps.content);
        //2、将DOM插入到DOM树中
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostRoot:
      bubbleProperties(wip);
      return null;
    case FunctionComponent:
      bubbleProperties(wip);
      return null;
    default:
      if (__DEV__) {
        console.log('未处理的completeWork');
      }
      break;
  }
};

function appendAllChildren(parent: Container, wip: FiberNode) {
  let node = wip.child;
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node?.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === wip) {
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function bubbleProperties(wip: FiberNode) {
  let subtreeFlags = NoFlags;
  let child = wip.child;

  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;

    child.return = wip;
    child = child.sibling;
  }
  wip.subtreeFlags |= subtreeFlags;
}
function markUpdate(fiber: FiberNode) {
  fiber.flags |= Update;
}
