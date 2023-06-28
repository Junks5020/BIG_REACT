# reconciler有什么用

1、消费jsx
2、没有编译优化，纯运行时的前端框架

核心模块消费jsx的过程
reactElement 不能表达节点之间关系，
字段有限，不好拓展

FiberNode 虚拟DOM在react中的实现

jsx-> reactElement -> FiberNode -> 真实Node


FiberNode -> 
|->type-> 什么类型的节点->在workTag.ts文件中定义具体类型
|->pendingProps->准备好的props
|->key -> dom的关键字



比如挂载<div></div>
```js
//React Element <div></div>
jsx("div")
//对应的fiberNode
null
//生成子fiberNode
//对应标记
Placement
```

当所有react element 比较完成后，会生成一个fiberNode树，一共会存在两颗fibernode树

current：与视图中真实UI对应的fiberNode树
workInProgress :触发更新后，正在reconciler中计算的fiberNode树

jsx的消费顺序->DFS的顺序遍历ReactELement

递归的过程
递：对应beginWork
归：对应completeWork