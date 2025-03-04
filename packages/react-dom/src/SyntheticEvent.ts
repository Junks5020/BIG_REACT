import { Container } from 'hostConfig';
import { Props } from 'shared/ReactTypes';

export const elementPropsKey = '__props';

const vaildEventTypeList = ['click'];

type EventCallback = (e: Event) => void;

interface Paths {
	capture: EventCallback[];
	bubble: EventCallback[];
}

interface SyntheticEvent extends Event {
	__stopPropagation: boolean;
}

export interface DOMElement extends Element {
	[elementPropsKey]: Props;
}

export function updateFiberProps(node: DOMElement, props: Props) {
	node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
	if (!vaildEventTypeList.includes(eventType)) {
		console.warn('不支持的事件类型');
		return;
	}
	if (__DEV__) {
		console.log('initEvent', eventType);
	}
	container.addEventListener(eventType, (e) => {
		dispatchEvent(container, eventType, e);
	});
}

function createSyntheticEvent(e: Event) {
	const syntheticEvent = e as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;
	const originStopPropagation = e.stopPropagation;
	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation();
		}
	};
	return syntheticEvent;
}

export function dispatchEvent(
	container: Container,
	eventType: string,
	e: Event
) {
	const targetELement = e.target;
	if (targetELement === null) {
		console.warn('事件不存在target', e);
		return;
	}
	//1、收集沿途的事件
	const { bubble, capture } = collectPaths(
		targetELement as DOMElement,
		container,
		eventType
	);
	//2、构造合成事件
	const se = createSyntheticEvent(e);
	//3、遍历capture
	triggerEventFlow(capture, se);
	if (!se.__stopPropagation) {
		//4、遍历bubble
		triggerEventFlow(bubble, se);
	}
}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
	for (let i = 0; i < paths.length; i++) {
		const callback = paths[i];
		callback.call(null, se);

		if (se.__stopPropagation) {
			break;
		}
	}
}

function getEventCallbackNameFromEventType(
	eventType: string
): string[] | undefined {
	return { click: ['onClick', 'onClickCapture'] }[eventType];
}

function collectPaths(
	targetELement: DOMElement,
	container: Container,
	eventType: string
) {
	const paths: Paths = {
		capture: [],
		bubble: []
	};
	while (targetELement && targetELement !== container) {
		//收集
		const elementProps = targetELement[elementPropsKey];
		if (elementProps) {
			//click -> onClick  onClickCapture
			const callbackNameList = getEventCallbackNameFromEventType(eventType);
			if (callbackNameList) {
				callbackNameList.forEach((callbackName, i) => {
					const eventCallback = elementProps[callbackName];
					if (eventCallback) {
						if (i === 0) {
							paths.capture.unshift(eventCallback);
						} else {
							paths.bubble.push(eventCallback);
						}
					}
				});
			}
		}
		targetELement = targetELement.parentNode as DOMElement;
	}
	return paths;
}
