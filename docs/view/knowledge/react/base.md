# 初次学习

## jsx语法的特点

1. class在标签中需要换为`className（小驼峰）`。**jsx都是在写类，为防止与属性中的class混淆**，故使用`classNmae`。同理还有label标签关联input时的for属性，需使用`htmlFor`
2. 自定义组件使用时标签首字母必须大写，原生hml标签还是小写开头
3. 模板部分在html内部可以使用{}动态插值
4. 像有些时候需要原生的innnerHTML类似的功能的时候，需要用`dangerouslySetInnerHTML`**同时会带来xss问题**
5. 注释类问题，一般编辑器快捷键解决，需要加{}，一般使用多行js模式，单行注释模式下需要额外换行
6. jsx 数组自动展开，在{}内，会自定展开每一项元素。这也是react渲染列表的手段。
7. jsx中插入行内样式需要再套一层`{}`，有下划线的属性需转换为小驼峰写法。
8. jsx也可以作为一种特殊的类型，简而言之就是可以把jsx赋值给变量。通过变量就可以使用jsx。
9. 显示隐藏问题的jsx解决方案是三元表达式下返回`null`和要显示的HTML模板



## vue 转react不适应

1. 数据绑定分布来写，额外添加事件监听， `需要手动让表单元素变为受控组件`。
2. 绑定事件名首字母大写
3. 绑定事件没有this，在绑定时通过bind锁定，或定义方法为箭头函数
4. 方法中改变state中的值不可直接赋值，需使用this.setstate
5. setstate时键值对两边模式(作用域)不同，左侧直接在state对象中，右侧在全局，故右侧需要this.state才能获取state中的值。
6. 切记react中数据的改变必须通过setstate方法实现，虽然有些情况（数组）直接操作效果一致，但会带来一系列性能问题。
7. style写法上的差异，将之前的style值转换为对象写法，由于对象键名的特殊性，有-的属性需要转换为驼峰写法。另外由于插入的是整个对象，所以外观上是两个{}。


## react 中的特点

1. 单项数据流
2. 函数式编程
3. 校验方式略复杂，类型校验和默认值的设置的分开写， 标签化引用时没有的属性才算触发默认值。
4. ref 钩子的使用比vue略复杂，后面插入的是一个函数，参数是当前标签，
5. 


## 关于setState

1. setstate简单的可以认为是异步的，但细分场景又可能会出现同步场景，16之后为setstate设置了回调函数来完成一些异步操作。此外setState是一个**函数**，它可以接受两种参数，`对象和函数`。之前讲的都是对象形式的，也就是state对象，其中只写需要改变的部分即可。这里着重说接受函数的形式，由于setState特殊的异步特点，**参数是对象**的形式下想要依托上一次的setState结果做操作无法实现，故而出现参数是函数的形式，这个函数接受一个对象，**上一下setState处理后**的stae对象。


第二个参数（回调函数）解决异步问题
```js
     回调函数模式待补全
```
参数是对象的一般使用方法和问题
```js
    handle() {
        this.setState({ count: 0 }) // => this.state.count 还是 undefined
        this.setState({ count: this.state.count + 1}) // => undefined + 1 = NaN
        this.setState({ count: this.state.count + 2}) // => NaN + 2 = NaN
    }
```
参数是函数的一般使用方法
```js
handle () {
    this.setState((prevState) => {
      return { count: 0 }
    })
    this.setState((prevState) => {
      return { count: prevState.count + 1 } // 上一个 setState 的返回是 count 为 0，当前返回 1
    })
    this.setState((prevState) => {
      return { count: prevState.count + 2 } // 上一个 setState 的返回是 count 为 1，当前返回 3
    })
    // 最后的结果是 this.state.count 为 3
  }
```

2. setState的`合并性`与浏览器渲染机制类似，多次的操作setState不会无脑的渲染渲染多次，而是把这批多次setState放进一个队列，合适的时候一次更新，一次渲染。



## react的生命周期

未整理

## react关键字

1. `状态提升`，多组件同时依赖同一状态时，需要将这一状态放到最近的公共父组件。也是出现redux这种全局状态管理的需求。就是