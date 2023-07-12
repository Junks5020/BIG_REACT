import { ReactElementType, Props } from 'shared/ReactTypes';
import {
	FiberNode,
	createFiberFromElement,
	createWorkInProgress
} from './fiber';
import { HostText } from './workTags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { ChildDeletion, Placement } from './fiberFlags';
function ChildReconciler(shouldTrackEffect: boolean) {
	//是否应该跟踪副作用

	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffect) {
			return;
		}
		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [childToDelete];
			returnFiber.flags |= ChildDeletion;
		} else {
			deletions.push(childToDelete);
		}
	}

	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		const key = element.key;
		work: if (currentFiber !== null) {
			//key相同
			if (currentFiber.key === key) {
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFiber.type === element.type) {
						//类型相同
						const exisiting = useFiber(currentFiber, element.props);
						exisiting.return = returnFiber;
						return exisiting;
					}
					//删掉旧的
					deleteChild(returnFiber, currentFiber);
					break work;
				} else {
					if (__DEV__) {
						console.warn('未实现的react类型', element);
						break work;
					}
				}
			} else {
				//删掉旧的
				deleteChild(returnFiber, currentFiber);
			}
		}

		//根据ReactELement创建FiberNode并返回

		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		if (currentFiber !== null) {
			//update
			if (currentFiber.tag === HostText) {
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				return existing;
			}
			deleteChild(returnFiber, currentFiber);
		}

		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	function placeSingleChild(newFiber: FiberNode) {
		if (shouldTrackEffect && newFiber.alternate === null) {
			newFiber.flags |= Placement;
		}
		return newFiber;
	}

	return function reconcileChildFibers(
		returnChild: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType
	) {
		//判断当前fiber的类型
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnChild, currentFiber, newChild)
					);
				default:
					if (__DEV__) {
						console.warn('未实现的类型1', newChild);
					}
					break;
			}
		}
		//多节点的情况

		//HostText

		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnChild, currentFiber, newChild)
			);
		}
		if (currentFiber !== null) {
			deleteChild(returnChild, currentFiber);
		}

		if (__DEV__) {
			console.warn('未实现的类型2', newChild);
		}
		return null;
	};
}

function useFiber(fiber: FiberNode, pendingProps: Props): FiberNode {
	const clone = createWorkInProgress(fiber, pendingProps);
	clone.index = 0;
	clone.sibling = null;
	return clone;
}

export const reconcileChildFibers = ChildReconciler(true); //跟踪副作用
export const mountChildFibers = ChildReconciler(false); //不跟踪副作用
