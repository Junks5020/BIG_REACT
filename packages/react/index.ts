import {
	Dispatcher,
	resolveDispatcher,
	currentDispatcher
} from './src/currentDispatcher';
import { jsxDEV, jsx, isValidElement as isValidElementFn } from './src/jsx';

export const useState: Dispatcher['useState'] = (initialState: any) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};

//内部数据共享层
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher
};

export const version = '0.0.0';

//TODO: 根据环境区分jsx/jsxDEV
export const createElement = jsx;

export const isValidElement = isValidElementFn;
