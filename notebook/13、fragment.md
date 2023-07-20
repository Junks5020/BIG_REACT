# 增加Fragment类型

## 1、增加Fragment类型
在reactSymbol里面增加Fragment类型

在childFiber文件中 reconcileChildFibers方法中增加 判断是否是Fragment类型

1、如果是unkeyTopLevelFragment 直接把newChild.props.child -> newChild