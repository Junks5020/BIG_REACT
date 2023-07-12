import { FiberNode } from 'react-reconciler/src/fiber';
import { HostText, HostComponent } from 'react-reconciler/src/workTags';
import { updateFiberProps, DOMElement } from './SyntheticEvent';
export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

// export function createInstance(type: string, props: any): Instance {
export function createInstance(type: string, props: any): Instance {
  // TODO 处理props
  const element = document.createElement(type) as unknown;
  updateFiberProps(element as DOMElement, props);
  return element as DOMElement;
}
export function appendInitialChild(
  parent: Instance | Container,
  child: Instance
) {
  parent.appendChild(child);
}
export function createTextInstance(content: string) {
  return document.createTextNode(content);
}
export const appendChildToContainer = appendInitialChild;

export function commitUpdate(fiber: FiberNode) {
  switch (fiber.tag) {
    case HostText:
      const text = fiber.memoizedProps.content;
      return commitTextUpdate(fiber.stateNode as TextInstance, text);
    default:
      if (__DEV__) {
        console.log('未处理的commitUpdate');
      }
  }
}

export function commitTextUpdate(textInstance: TextInstance, content: string) {
  textInstance.textContent = content;
}
export function removeChild(
  child: Instance | TextInstance,
  container: Container
) {
  container.removeChild(child);
}
