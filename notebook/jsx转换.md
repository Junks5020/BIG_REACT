# jsx转换
## 1、jsx转换是什么？
```js
<div>123</div> -> jsx("div",{children:"123"})
```
编译时：babel在编译时候直接执行
运行时：jsx方法的执行或React.createElement方法的实现

运行时工作量包括：
1、实现jsx方法
2、实现打包流程
3、实现调试打包结果的环境


1、实现jsx方法：
jsxDEV方法（dev环境）
jsx方法
React.createElement方法

2、实现打包流程
    react/jsx-dev-runtime.js(dev环境)
    react/jsx-runtime.js(prod环境)
    React

3、利用pnpm link 进行连接我们生成的react包