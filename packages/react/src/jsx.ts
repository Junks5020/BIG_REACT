import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
  ElementType,
  Key,
  Ref,
  Props,
  ReactElementType
} from 'shared/ReactTypes';
const ReactElement = function (
  type: ElementType,
  key: Key,
  ref: Ref,
  props: Props
): ReactElementType {
  const element = {
    //通过这个结构指明这是一个React元素
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    __mark: 'jinxu'
  };
  return element;
};

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
  let key: Key = null;
  const props: Props = {};
  let ref: Ref = null;
  for (const prop in config) {
    const val = config[props];
    if (prop === 'key') {
      if (val !== undefined) {
        key = '' + val;
      }
      continue;
    }
    if (prop === 'ref') {
      if (val !== undefined) {
        ref = val;
      }
      continue;
    }
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val;
    }
  }
  const maybeChildrenLength = maybeChildren.length;
  if (maybeChildrenLength) {
    if (maybeChildrenLength === 1) {
      props.children = maybeChildren[0];
    } else {
      const children = Array(maybeChildrenLength);
      for (let i = 0; i < maybeChildrenLength; i++) {
        children[i] = maybeChildren[i];
      }
      props.children = children;
    }
  }
  return ReactElement(type, key, ref, props);
};
export const jsxDEV = (type: ElementType, config: any) => {
  let key: Key = null;
  const props: Props = {};
  let ref: Ref = null;
  for (const prop in config) {
    const val = config[prop];
    if (prop === 'key') {
      if (val !== undefined) {
        key = '' + val;
      }
      continue;
    }
    if (prop === 'ref') {
      if (val !== undefined) {
        ref = val;
      }
      continue;
    }
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val;
    }
  }
  return ReactElement(type, key, ref, props);
};
