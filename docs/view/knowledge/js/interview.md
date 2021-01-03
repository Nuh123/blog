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

## 循环的性能分析(浏览器端)

### 1. js 当中的循环

- do while 循环、for 循环、 for in 循环、 for of 循环
- forEach、map 等仅是数组的迭代方法，数组各种迭代方法之间的差异不在这里讨论（主要是空位策略、稀疏数组策略）
- 一定程度上递归也算是一种循环

### 2. for 循环和 while 循环

- new Array 传一个参数产生的是一个稀疏数组，需用 fill 填充后使用。`new Array(99999).fill(0)`快速实现一个大数组
- console.time 和 console.timrEnd 成对使用，分别是开始时间和结束时间
- 上面的时间差即为程序运行时间，但也仅仅是可以参考的时间，不是每次都相等，受机器性能和状态影响
- 两种循环的差异在语法上主要是`循环次数`的确定性
- 使用 ES6（let）语法下，for 循环性能优于 while 循环，主要是由于块级作用域的功劳（使得变量‘查找’更快），while 里面即使使用 let 语法也是全局性的
- 使用 ES5（var）语法下，两者性能接近，这也是两种循环语法`实际的性能`

### 3. forEach 循环

- 此处代表数组的迭代方法，至于数组迭代方法之间的差异，此处不做讨论
- forEach 支持第二个参数，第一个参数为回调函数，第二个为回调函数 this
- forEach 性能差于上述两种循环，使用较多主要是函数式编程的特点
- `命令式编程`主要考察如何去看，看重过程
- `函数式编程`在乎结果，强调封装，使用方便，但不灵活
- 循环体量不大的情况下提倡使用 forEch 循环
- 除了抛出异常以外，没有办法中止或跳出 forEach() 循环
- 手写 forEach
  ```js
  //内部实质上还是for循环，只不过是向函数式编程的转变
  Array.prototype.forEach = function (callback, context) {
    //"use strict";
    let self = this,
      i = 0,
      len = self.length; //减少循环中对长度属性的访问，稍微能提升一点性能，但抛弃了灵活性，数组不可以动态删减
    context = context == null ? window : context;
    // 处理不传第二个参数的情况，也可以使用默认参数解决（null问题无法解决），但这里也可以更细化判断
    //i单独提出更多是习惯或者说写法上的精简，但也说提升性能（对此存疑）,
    for (; i < len; i++) {
      //这里加了健壮性处理，核心就只是执行回调函数
      typeof callback === "function"
        ? callback.call(context, self[i], i)
        : null;
    }
  };
  //上面思路不错，但跑不了，主要是context的处理问题
  //是自己写的有问题，上面的代码没问题，主要是循环的判断处我写成length了，拿到的是window的length，真菜
  // 另外，此处将context的默认值写到了window，也符合普通回调this指向全局的bug，但有些写法将默认指向arr本身，我也觉得没什么问题
  //另看了下mdn官方的polyfill，几个卫语句（callback类型判断，调用源this判断），主要是context的判断是实参长度来判断
  ```

### 4. for in 循环

- **性能最差**，本来（最初）的作用是迭代当前对象中所有`可枚举`的属性的（包括原型链上的）
- 遍历的顺序是固定的，无法控制[具体顺序及拓展](https://es6.ruanyifeng.com/#docs/object#%E5%B1%9E%E6%80%A7%E7%9A%84%E5%8F%AF%E6%9E%9A%E4%B8%BE%E6%80%A7%E5%92%8C%E9%81%8D%E5%8E%86)
- symbol 类属性无法遍历，且原型链上自己扩展的也会遍历到[解决办法参考](https://es6.ruanyifeng.com/#docs/symbol#%E5%B1%9E%E6%80%A7%E5%90%8D%E7%9A%84%E9%81%8D%E5%8E%86)
- [for in 循环的其它缺点](https://es6.ruanyifeng.com/#docs/iterator#for---of-%E5%BE%AA%E7%8E%AF)
- 简单手写拿对象自身的所有属性
  ```js
  let obj = {
    name: "sadf",
    age: 12,
    1: 200,
    [Symbol("AA")]: 400,
  };
  Object.prototype.fn = function () {};
  let keys = Object.keys(obj); // keys 拿到symbol以外的所有属性
  if (typeof Symbol !== "undefined")
    keys = keys.concat(Object.getOwnPropertySymbpls(obj)); // getOwnPropertySymbpls专门获取指定对象的所有 Symbol 属性名
  //Reflect.ownKeys()可以返回所有类型的键名，包括常规键名和 Symbol 键名。
  keys.forEach((key) => {
    console.log("name", key);
    console.log("value", obj[key]);
  });
  ```

### 5. for of 循环

- 也就相比 for in 快
- 是按照迭代器的规范遍历，只有部署了迭代器的数据结构才能使用，目前已知数组、部分类数组、 Set、 Map 部署了迭代器对象，对象没有，也就是**对象不能使用 for of 循环**，[迭代器的具体内容](https://es6.ruanyifeng.com/#docs/iterator)
- 手写 数组的迭代器
  ```js
  let arr = [10, 20, 30];
  arr[Symbol.iterator] = function () {
    let self = this,
      index = 0;
    return {
      //迭代器规范1. 必须具备next方法，每调用一次next方法，拿到结构中某一项值
      //迭代器规范2. next返回值为一个对象，区别见下，
      // 都有done和value两个属性，done表示迭代进度，value表示当前迭代值
      next() {
        if (index > self.length - 1) {
          return {
            done: true,
            value: undefined,
          };
        }
        //index += 2
        // 可以自己控制迭代跨度
        return {
          done: false,
          //value: self[index],
          value: self[index++],
        };
      },
    };
  };
  ```
  - for in 循环拿到的是属性名， for of 循环拿到的是属性值，之前的其它两种循环也是只能拿到属性名
  - 声明式的类数组对象不具备迭代器，可以通过手动部署实现使用 for of，具体就是在该对象上部署迭代器对象，并指向数组的迭代器对象
