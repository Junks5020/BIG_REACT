# 8、实现useState

hook 如果脱离FC上下文，就是普通函数
如何让hook拥有感知上下文的能力呢？
hook怎么知道当前是mount还是update呢？
解决方案：

在不同上下文中调用的hook不是同一个函数

在Reconciler中的不同阶段调用不同的hook集合
 