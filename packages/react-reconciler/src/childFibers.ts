import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, createFiberFromElement } from './fiber';
import { HostText } from './workTags';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { Placement } from './fiberFlags';
function ChildReconciler(shouldTrackEffect: boolean) {
	//是否应该跟踪副作用

	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
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

		if (__DEV__) {
			console.warn('未实现的类型2', newChild);
		}
		return null;
	};
}

export const reconcileChildFibers = ChildReconciler(true); //跟踪副作用
export const mountChildFibers = ChildReconciler(false); //不跟踪副作用
