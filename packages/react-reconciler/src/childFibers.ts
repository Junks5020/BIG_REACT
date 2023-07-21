import { ReactElementType, Props, Key } from 'shared/ReactTypes';

import {
	FiberNode,
	createFiberFromElement,
	createWorkInProgress,
	createFiberFromFragment
} from './fiber';
import { HostText, Fragment } from './workTags';
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from 'shared/ReactSymbols';
import { ChildDeletion, Placement } from './fiberFlags';

type ExistingChildren = Map<string | number, FiberNode>;

function childReconciler(shouldTrackEffect: boolean) {
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
	function deleteRemainingChildren(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null
	) {
		if (!shouldTrackEffect) {
			return;
		}
		let childToDelete = currentFirstChild;
		while (childToDelete !== null) {
			deleteChild(returnFiber, childToDelete);
			childToDelete = childToDelete.sibling;
		}
	}
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		const key = element.key;
		while (currentFiber !== null) {
			//key相同
			if (currentFiber.key === key) {
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFiber.type === element.type) {
						//type相同
						let props = element.props;

						if (element.type === REACT_FRAGMENT_TYPE) {
							props = element.props.children;
						}
						const exisiting = useFiber(currentFiber, props);
						exisiting.return = returnFiber;
						//当前节点可复用，剩余节点删除
						deleteRemainingChildren(returnFiber, currentFiber.sibling);
						return exisiting;
					}
					//key相同 tpye不同
					deleteRemainingChildren(returnFiber, currentFiber);
					break;
				} else {
					if (__DEV__) {
						console.warn('未实现的react类型', element);
						break;
					}
				}
			} else {
				//key不同删掉旧的
				deleteChild(returnFiber, currentFiber);
				currentFiber = currentFiber.sibling;
			}
		}

		//根据ReactELement创建FiberNode并返回
		let fiber;
		if (element.type === REACT_FRAGMENT_TYPE) {
			fiber = createFiberFromFragment(element.props.children, element.key);
		} else {
			fiber = createFiberFromElement(element);
		}
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		while (currentFiber !== null) {
			//update
			if (currentFiber.tag === HostText) {
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				deleteRemainingChildren(returnFiber, currentFiber.sibling);
				return existing;
			}
			deleteChild(returnFiber, currentFiber);
			currentFiber = currentFiber.sibling;
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

	function reconcileChildrenArray(
		returnFiber: FiberNode,
		currentFirstFiber: FiberNode | null,
		newChild: any[]
	) {
		//最后一个可复用fiber在current中的index
		let lastPlacedIndex = 0;
		//创建的最后一个fiber
		let lastNewFiber: FiberNode | null = null;
		//创建的第一个fiber
		let firstNewFiber: FiberNode | null = null;
		//将current保存到Map中
		const existingChildren: ExistingChildren = new Map();
		let current = currentFirstFiber;
		while (current !== null) {
			const keyToUse = current.key !== null ? current.key : current.index;
			existingChildren.set(keyToUse, current);
			current = current.sibling;
		}

		for (let i = 0; i < newChild.length; i++) {
			//遍历newChild，寻找是否可以复用
			const after = newChild[i];
			const newFiber = updateFromMap(returnFiber, existingChildren, i, after);
			// xxx false null
			if (newFiber === null) {
				continue;
			}
			//标记移动还是插入
			newFiber.index = i;
			newFiber.return = returnFiber;
			if (lastNewFiber === null) {
				lastNewFiber = newFiber;
				firstNewFiber = newFiber;
			} else {
				lastNewFiber.sibling = newFiber;
				lastNewFiber = lastNewFiber.sibling;
			}

			if (!shouldTrackEffect) {
				continue;
			}
			const current = newFiber.alternate;
			if (current !== null) {
				const oldIndex = current.index;
				if (oldIndex < lastPlacedIndex) {
					//移动
					newFiber.flags |= Placement;
					continue;
				} else {
					//不移动
					lastPlacedIndex = oldIndex;
				}
			} else {
				//mount
				newFiber.flags |= Placement;
			}
		}

		//将Map中剩余的节点删除
		existingChildren.forEach((child) => deleteChild(returnFiber, child));
		return firstNewFiber;
	}
	function updateFromMap(
		returnFiber: FiberNode,
		exisitingChildren: ExistingChildren,
		index: number,
		element: any
	): FiberNode | null {
		const keyToUse = element.key !== null ? element.key : index;
		const before = exisitingChildren.get(keyToUse);
		if (typeof element === 'string' || typeof element === 'number') {
			//HostText
			if (before && before.tag === HostText) {
				exisitingChildren.delete(keyToUse);
				return useFiber(before, { content: element + '' });
			}
			return new FiberNode(HostText, { content: element + '' }, null);
		}
		//ReactElement 类型

		if (typeof element === 'object' && element !== null) {
			switch (element.$$typeof) {
				case REACT_ELEMENT_TYPE: //ReactElement
					if (element.type === REACT_FRAGMENT_TYPE) {
						return updateFragment(
							returnFiber,
							before,
							element.props.children,
							keyToUse,
							exisitingChildren
						);
					}
					if (before && before.type === element.type) {
						exisitingChildren.delete(keyToUse);
						return useFiber(before, element.props);
					}
					return createFiberFromElement(element);
			}
		}

		//TODO 数组类型
		if (Array.isArray(element)) {
			return updateFragment(
				returnFiber,
				before,
				element,
				keyToUse,
				exisitingChildren
			);
		}
		return null;
	}

	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType
	) {
		//是否是fragment类型
		const isUnKeyedTopLevelFragment =
			typeof newChild === 'object' &&
			newChild !== null &&
			newChild.type === REACT_FRAGMENT_TYPE &&
			newChild.key === null;
		if (isUnKeyedTopLevelFragment) {
			newChild = newChild?.props.children;
		}
		//判断当前fiber的类型
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);
				default:
					if (__DEV__) {
						console.warn('未实现的类型1', newChild);
					}
					break;
			}
		}
		//多节点的情况
		if (Array.isArray(newChild)) {
			return reconcileChildrenArray(returnFiber, currentFiber, newChild);
		}
		//HostText

		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}
		if (currentFiber !== null) {
			deleteRemainingChildren(returnFiber, currentFiber);
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

function updateFragment(
	returnFiber: FiberNode,
	currentFiber: FiberNode | undefined,
	elements: any[],
	key: Key,
	exisitingChildren: ExistingChildren
) {
	let fiber;
	if (!currentFiber || currentFiber.type !== Fragment) {
		fiber = createFiberFromFragment(elements, key);
	} else {
		exisitingChildren.delete(key);
		fiber = useFiber(currentFiber, elements);
	}
	fiber.return = returnFiber;
	return fiber;
}

export const reconcileChildFibers = childReconciler(true); //跟踪副作用
export const mountChildFibers = childReconciler(false); //不跟踪副作用
