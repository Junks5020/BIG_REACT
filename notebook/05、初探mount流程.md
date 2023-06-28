# mount流程

更新流程的目的是 
1、生成wip FiberNode 树
2、标记副作用flags

更新流程的步骤

递：beginWork
归：completeWork

beginWork ： 

Placement ：
插入：
移动：

ChildDeletion
删除：

UpDate：
更新:

HostRoot 的 beginWork工作流程

1、计算状态最新值
2、创建子fiberNode

HostComponent的beginWork工作流程

1、创造子fiberNode


completeWork
需要解决的问题：
对于Host类型fiberNode:构建离屏DOM树
标记Update flag

