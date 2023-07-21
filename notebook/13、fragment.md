# 增加Fragment类型

## 1、增加Fragment类型
在reactSymbol里面增加Fragment类型

在childFiber文件中 reconcileChildFibers方法中增加 判断是否是Fragment类型


Fiber文件中，还需要把构造函数改一下key，令其为key||null


1、如果是unkeyTopLevelFragment 直接把newChild.props.child -> newChild

newchild->any


2、Fragment与其他组件同级

```html
<ul>
    <>
    <li>1</li>
    <li>2</li>
    </>
    <li>3</li>
    <li>4</li>
</ul>

<!-- 对应的dom -->
<ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
</ul>
```
这个情况jsx转换结果

```js
jsx('ul',{
    children:[
        jsx(Fragment,{
            children:[
                jsx('li',{
                    children:'1'
                }),
                jsx('li',{
                    children:'2'
                }),
            ]
        }),
        jsx('li',{
            children:'3'
        }),
         jsx('li',{
            children:'4'
        })
        
    ]
})

```

进入reconcileChildArray
需要处理tag为Fragment的reactElement

先处理单节点：

reconcileSingleElement

增加判断
复用的：
先保存props 如果type是Fragment的话
props=element.props.children
没有复用：

如果是。。。
createFiberFromFragment(element.props.children, key) ：FiberNode
需要创建这个方法，在Fiber这个文件中

需要增加一个Fragment tag ： worktag

Framgent：Fiber节点的tag属性

ReactElement.type : React_Fragment_type
不是的话，正常


需要处理ReactElement 

增加一个新方法：
```js
function updateFragment(
    returnFiber:FiberNode,
    current:FiberNode|null,
    elements:any[],
    key:Key,
    existingChildren:ExistingChildren
)
```
如果current不存在，或者current.type!== Fragment的话
需要创建新的Fiber->createFiberFromFragment

否则需要复用，
在existingChildren删掉
复用

链接return
返回fiber



children 为数组类型

进入reconcileChildrenArray方法，数组中的某一项为Fragment，所以需要增加【type为Fragment的ReactElement的判断】，同时beginWork中需要增加Fragment类型的判断

定义updateFragment
```js
function updateFrament(wip:FiberNode){
    const nextChildren = wip.penddingProps
}
```

complateWork
pop....




## 3、数组形式的Fragment

```html
arr  = [<li>c</li>,<li>d</li>]


<ul>
    <li>a</li>
    <li>b</li>
    {arr}
</ul>
```

jsx:
```js
jsx('ul',{
    children:[
        jsx('li',{
            children:'a'
        }),
        jsx('li',{
            children:'b'
        }),
        arr
    ]
})
```

children为数组类型，则进入reconcileChildrenArray方法，数组中的某一项为数组，所以需要增加[reconcileChildrenArray中数组类型的判断]

render阶段处理完毕



Fragment对ChildDeletion的影响

childDeletion 删除DOM 的逻辑
- 找到子树的根host节点
- 找到子树对应的父级Host节点
- 从父级Host节点中删除子树根节点

考虑删除p节点的情况：
```html
<div>
    <p>xxxx</p>
</div>
```

考虑删除Fragment后，子树的根Host节点可能存在多个：
```html
<div>
    <>
    <p>xxxx</p>
    <p>xxxx</p>
    </>
</div>
```