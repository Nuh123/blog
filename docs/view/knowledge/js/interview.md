# 梳理常见面试点

## 数据类型检测

### 1. js 中的数据类型

- ![js中数据类型](/blog/knowledge/js/interview/dataType.png)
- 这里注意返回的都为小写

### 2. typeof

- 直接在计算机底层基于数据类型的值（二进制）进行检测，返回一个字符串
- 基本类型相对准确，引用类型不准确
- null（基本类型却返回 object）,由于对应的二进制开头为`000`,和对象类型的开头相同，所以是个**Bug**
- 引用类型基本都返回 Object（函数为 function），无法区分具体类型

### 3. instanceof

- 基本类型无法使用
- 最初是用来检测实例是否属于某个类的（根据原型链）
- 不准确（只要在原型链上），所有都是 Object 类型，所以是 True 不一定是，但 false 一定不是
- ![instanceof问题](/blog/knowledge/js/interview/instanceof.png)
- 原型是可以修改，一旦做过这个操作，这种判断就有可能失真（js 的继承主要是通过原型链实现的）
- 手写 instanceof

  ```js
  //原理： 实例._proto_ = 类.prototype
  //其中_proto_为非标准属性，已知IE不兼容，故使用Object.getPrototypeOf()获取
  //一定是顺着实例的原型链向上对比，终止条件是找到或者实例的原型链到顶，一定是实例的原型链
  function instance_of(example, classFun) {
    let cPrototype = classFun.prototype;
    let ePrototype = Object.getPrototypeOf(example);
    while (ePrototype) {
      if (ePrototype === cPrototype) {
        return true;
      } else {
        ePrototype = Object.getPrototypeOf(ePrototype);
      }
    }
    return false;
  }
  ```

### 4. constructor

- 构造器，用来指示实例的父类，最初也是用来检测实例是否属于某个类的
- 与上面的区别是只判断一层，且**基本类型可用**（基本类型也是基本类型的包装类）
- 但构造器也是可以修改的，修改后会失真

### 5. Object.prototype.toString.call()

- 不是转换为字符串，是返回当前实例所属类信息，具体值参考[Symbol.toStringTag](https://es6.ruanyifeng.com/#docs/symbol#%E5%86%85%E7%BD%AE%E7%9A%84-Symbol-%E5%80%BC)
- 相对来说是一个比较标准的，基本和引用类型都可以使用
- 注意大小写，第一个统一为小写的 object，第二个为具体的类型，首字母大写，外面有一层方括号
- ![toString返回值](/blog/knowledge/js/interview/toString.png)

### 6. 自己的类型判断函数

- 四种判断方法中使用 typeof 和 toString 两种，特殊处理 typeof 无法处理 null 和引用类型问题

```js
// 整个方法就是jquery的类型判断核心
(function () {
  let class2type = {};
  let toString = class2type.toString; //这里就是取Obejct.prototype.toString()
  "Boolean,Number,Srting,Function,Array,Date,Regexp,Object,Error,Symbol"
    .split(",")
    .forEach((name) => {
      class2type[`[object ${name}]`] = name.toLowerCase();
    });
  //这里使用一个映射表，也就是策略模式优化toString结果的处理方式
  function toType(obj) {
    // 整个过程可以分三大类
    // null和undefined直接返回本身
    // 除上述以外的基本类型使用 typeof
    // 引用类型使用 toString 结合之前的映射表
    if (obj == null) {
      //这里特别说明下用==就能同时判断null和undefined
      return obj + "";
    }
    return typeof obj === "object" || typeof obj === "function"
      ? class2type[toSrting.call(obj)] || "object"
      : typeof obj;
  }
  window.toType = toType;
})();
```
