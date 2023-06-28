import { Action } from 'shared/ReactTypes';
export interface Update<State> {
  action: Action<State>;
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
}

export const createUpdate = <State>(action: Action<State>) => {
  return {
    action
  };
};

export const createUpdateQueue = <State>() => {
  return {
    shared: {
      pending: null
    }
  } as UpdateQueue<State>;
};

export const enqueueUpdate = <State>(
  UpdateQueue: UpdateQueue<State>,
  update: Update<State>
) => {
  UpdateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
  baseState: State,
  pendingUpdate: Update<State> | null
): { memoizedState: State } => {
  const result: ReturnType<typeof processUpdateQueue<State>> = {
    memoizedState: baseState
  };
  if (pendingUpdate !== null) {
    const action = pendingUpdate.action;
    if (action instanceof Function) {
      //baseState = 1 Update = (x)=>4x moemoizedState = 4
      result.memoizedState = action(baseState);
    } else {
      //baseState = 1 Update =2 moemoizedState = 2
      result.memoizedState = action;
    }
  }
  return result;
};
