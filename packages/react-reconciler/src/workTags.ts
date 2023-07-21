export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText
	| typeof Fragment;

export const FunctionComponent = 0; //函数组件
export const HostRoot = 3; //根节点
export const HostComponent = 5; //原生组件
export const HostText = 6; //文本
export const Fragment = 7;
