# schedule阶段

新增调度阶段，我们需要将多次触发的更新，只进行一次的更新流程。
我们需要在render阶段和commit阶段的基础上增加schedule阶段

#### 对update的调整

**多次触发更新，只进行一次更新流程**中，**多次触发更新**意味着对于同一个fiber，会创建多个update：

```js
const onClick=()=>{
    updateCount(count=>count+1);
    updateCount(count=>count+1);
    updateCount(count=>count+1);
}

```
每触发一个更新，就会创建一个update，目前我们的update是放入update队列是覆盖的方式，所以触发三次更新只会保留最后一次，我们需要将enqueueUpdate改成一个循环链表的方式。

a->a
将b update插入时
b->a->b
将c update插入时
c->a->b->c
d
d->a->b->c->d





**多次触发更新，只进行一次更新流程**，意味着要达成3个目标：
- 需要实现一套优先级机制，每个更新都拥有优先级
- 需要能合并一个宏任务/微任务中触发的所有更新
- 需要一套算法，用于决定哪个优先级优先进入render阶段


## 实现目标1：Line模型

包括：
- lane （二进制，代表优先级）
- lanes （二进制，代表优先级的集合）

### lane的产生

**requestUpdateLane**对于不同情况触发的更新，产生lane。为后续不同事件产生不同优先级更新做准备。
如何知道那些lane被消费，还剩哪些lane没被消费？

### 对FiberRootNode的改造

需要增加如下字段：
- 代表所有未被消费的lane的集合
- 代表本次更新消费的lane

## 实现目标2、3

需要完成两件事情：
- 实现**某些判断机制** 选出一个lane
- 实现类似防抖、节流的效果，合并宏/微任务中触发的更新

## render阶段的改造
precessUpdateQueue方法消费update时需要考虑：
- lane的因素
- update现在是一条链表
  
## commit阶段的改造
移除**本次更新被消费的lane**

