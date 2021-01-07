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

## this 相关

### 1. 概述

- 具体表示执行主体，就是谁把某个函数执行，和在哪创建和在哪执行都没有关系，重点就是谁**执行**
- 和函数执行上下文是两个体系，不相同

### 2. 函数执行

- 看函数前面是否有“点”，没有点 this 就是 window（严格模式下是 undefined），有点就是点前面的那个东西
- 这里可以理解为 window 执行了该函数，但该函数不一定是 window 的方法

### 3. 当做方法

- 主要还是看是当做方法使用还是，通过一些手段当函数使用
- 作为方法调用时，指向该方法所属的对象

### 4. 构造函数

- 正常的构造函数，this 指向实例（也就是构造函数创建的新对象）
- 但构造函数有手写 return 时分两种情况，基本类型无影响，引用类型会破坏原本的机制，指向指定的引用类型数据[其它相关可以参考](https://wangdoc.com/javascript/oop/new.html#new-%E5%91%BD%E4%BB%A4%E7%9A%84%E5%8E%9F%E7%90%86)

### 5. 箭头函数

- 箭头函数'没有'this（arguments、super、new.target 也没有），主要是该 this 主要取决于定义时的 this，没有自己的
- 箭头函数除 this 外，不可以当构造函数，不可以使用 arguments 对象，不可以使用 yeid 命令也就是不能做 Generator 函数
- [箭头函数其它特殊之处](https://es6.ruanyifeng.com/#docs/function#%E7%AE%AD%E5%A4%B4%E5%87%BD%E6%95%B0)

### 6. 手动改变

- call、apply、bind（Function.prtotype 上）可以手动改变
- `bind` 执行后是返回一个未执行，但改变了 this 的新函数（这里的延迟执行需要使用闭包存储参数）
- `call` 和 `apply` 是修改 this 且执行，主要区别是参数传递方式上的区别，call 散着，apply 是一个数组
- 基本类型值可以添加属性，但是没法访问到;基本类型可以通过包一层 Object 来转为对应的包装类
- 手写 call 方法
  ```js
  //主要原理就是对象的方法正常调用this指向该对象
  Function.prototype.myCall = function (context, ...params) {
    context = context == null ? window : context;
    context = /^(object|function)$/i.test(typeof context)
      ? context
      : Object(context);
    let self = this,
      key = Symbol("key"),
      result;
    //主要是防止撞名和处理函数有返回值的情况
    context[key] = self;
    result = context[key](...params);
    delete context[key];
    return result;
  };
  ```
- 手写 bind 方法
  ```js
  //主要原理与上面一致，重点是返回值的处理上不一样
  Function.prototype.myBind = function (context, ...params) {
    context = context == null ? window : context;
    context = /^(object|function)$/i.test(typeof context)
      ? context
      : Object(context);
    let self = this;
    return function (...args) {
      //self.call(context, ...params);
      self.apply(context, params.concat(args));
    };
  };
  ```
- 这两版手写在核心功能上没有问题，但毕竟不是专门的手写教学，所以肯定不够完美[详细手写](https://github.com/mqyqingfeng/Blog/issues/12)

### 7. 鸭子类型

- 长得像鸭子，就认为是鸭子，具体到 js 中就是，类数组就认为‘是数组’，就是可以通过一些方法来使用数组方法（Array.from、展开运算符、[].slice 不传参数 Array.prototype.fun.call()）
- 鸭子类型的原则是面向接口编程，而不是面向实现编程（就是使用某方法存在即可，不纠结它的实际类型），在 isArray 出现前（或需要兼容 ie 低版本），就可以用拥有 push 方法和 length 属性判断是否为数组
- 数组的 toString 和 join(',')的结果一致（数组的 toSrting 和对象的 toString 不是同一个方法）
- 手写 slice
  ```js
  Array.prototype.mySlice = function (start = 0, end) {
    if (start > end) return [];
    // 这里也可以做更多的健壮处理
    let res = [],
      len = end || this.length;
    for (let i = start; i < len; i++) {
      res.push(this[i]);
    }
    return res;
  };
  ```

## 输入 URL 到页面呈现（网络层面）

### 1. URL 解析

- URL 构成
  ![url结构](/blog/knowledge/js/interview/url.png)
- 端口范围为 0 到 65535（应该是 2 的 16 次方）
- 常见的端口号 http：80、 https：443、 FTP：21
- 编码问题，尤其是中文及一些关键字（http 和空格）可以使用 encodeURL(),对应解码 decodeURL，这两个是对**整个 URL**编码,还有 encodeURLComponent 和 decodeURLComponent 可以对**部分**编码，还有一个比较少见的 escape
- URL 、URI、URN 对比
  ![关系图](/blog/knowledge/js/interview/URI.webp)
  - URI，全称就是 Uniform Resource Identifier，意思就是“统一资源标识符”
  - URL,跟 URI 的名字有点接近，全称是 Unform Resource Location，意思为“统一资源定位符”，**指定了操作或者获取方式（http 或 https）**
  - URN 跟前面一个兄弟很像，全称为 Uniform Resource Name，意思为“统一资源名”，不包括方式

### 2. 缓存检查

- 缓存设置基本在服务器（如 nginx）设置，浏览器基本是执行指令
- 检查两种缓存，**强缓存**和**协商缓存**，先检查是否有**未失效的强缓存**，再检查协商缓存，也没有就获取
- 缓存位置 内存缓存（Memory Cache）和磁盘缓存（Disk Cache）
- 新打开网页 直接检查磁盘缓存
- 普通刷新（F5）先查找内存缓存，再查找磁盘缓存
- 强制刷新（Ctrl + F5） 不使用缓存，请求头部带 `Cache—control：no-cache`

#### 强缓存

- `Expires`： 缓存过期时间，http1.0 时期用来指定资源过期时间，但受本地时间影响
- `Cache-Control`： `max-age`= 一个时间（秒数）：http1.1 补充出现，更推荐，优先级高于上面
- 强就强在如果存在且有效，直接使用，连请求头都不需要，浏览器抓包 size 部分显示 Disk 或 `Memory Cache`，**状态码依旧为 200**
- html 页面一般不做强缓存，其它文件都是通过 html 下载的。css 或图片等不常改变的一般会缓存
- **强缓存缺点**，服务端更新后如果走强缓存，无法及时更新，**办法 1**更新后修改文件名(webpack 的 hash 占位符)，**办法 2**文件名后缀带时间戳做查询参数，**办法 3**协商缓存

#### 协商缓存

- 协商缓存被命中后，浏览器带缓存标识发起请求，服务器根据缓存标识决定是否使用缓存过程
- 上面协商的部分只有请求头和响应头参与，**启用协商缓存状态码为 304**，不启用为正常的 200，确定状态后才决定是否有请求体（响应码为 200 时才有）
- 具体标识为 `Etag`（http1.1） 和 `Last-Modified`（http1.0），对应的 `if-None-Match` 和 `if-Modified-Since` 是浏览器请求时带的
- Etag 是根据文件内容 hash 出来的，hash 和内容强相关，Last-Modified 是文件最后修改时间，精度只能到秒存在问题（存疑，我之前看的是存在打开但不修改，最后修改时间时间还是更新的情况）

#### 数据缓存

- 上述两种 http 缓存是针对静态文件这类不常改变的资源的
- 数据类的获取一般是 ajax，存储方式一般为 H5 的 localstorage 和 sessionStora（框架衍生出的 vuex 和 redux）还有被错爱的 cookie
- 这部分需要借鉴 http 缓存自己手动实现，大致就只自己存数据时多存一个时间数据，每次 ajax 前先拿旧数据对比时间，未失效直接使用，失效先请求再更新

### 3. DNS 解析

- DNS 是应用层协议，主要是将 好记的域名转为不好记的 IP，也存在缓存
- 一般解析时间不会太长，100ms 左右，但也是耗时
- 递归查询，主要是在用户本地的策略
- ![递归查询图示](/blog/knowledge/js/interview/dns.png)
- 迭代查询.非本地查询策略
- ![迭代查询图示](/blog/knowledge/js/interview/dns1.png)
- 这里说下我对递归和迭代两种方式的理解，递归就是栈的特性，结果出来前会挂起；迭代就是队列的特性，一个一个来，有问有答
- **优化策略 1** 减少 DNS 请求次数（域名收敛，但实际不用，浏览器的 http 链路是有上限的）
- **优化策略 2**DNS 预解析（DNS Prefetch），实际中一般会拆分服务器（不同类型服务器压力不一样，web 和流媒体）来合理用资源，提高并发量 `<Link rel = "dns-prefetch" href="域名">`

### 4. TCP 握手

- seq 序号，用来表示字节流的从客户端发送
- ack 确认序号，服务端用来确认字节流接受成功的，值必须为 seq+1，只有 ACK 为 1 时，该字段才有效
- 标志位（多个）如 ACK：确认序号有效、 RST：重置链接、SYN：发起一个新链接、FIN：释放一个链接
- 三次握手的必要性，可以更多，但浪费，不能更少，核心是确保**双方都有收发能力**。TCP 是基于链接面向字节流的可靠传输协议，与之对应的有 UDP，快，但不可靠，基于数据包
- ![三次握手过程](/blog/knowledge/js/interview/tcp.png)

### 数据传输

![数据传输部分只有大纲](/blog/knowledge/js/interview/data-transpo.png)

### 5. TCP 四次挥手

- 服务端连续传送两次（为什么是四次），给予双方足够的时间传输数据，第二次'响应'一般好像是两个往返时间，所以本可以在一条里面 ACK 和 FIN 分为两次发送
- ![TCP释放过程](/blog/knowledge/js/interview/tcp-close.png)
- TCP 的开关（挥手和握手）需要耗时，http1.0 可以再请求头加入`Connection：keep-alive`来复用（长连接模式），http1.1 之后不需要手动加（默认）
- http 版本之间的差异
  - **多路复用**
    - 1.0 用完关闭
    - 1.1 默认使用长链接，多个请求串行化（排队）处理，前一个处理完后一个才可以开始，某个请求耗时严重，后面的只能被阻塞，就是常说的队头阻塞
    - 2.0 使用多路复用（MultiPlexing），多个请求可同时在同一个 TCP 连接上并行执行，某个请求耗时严重不影响其他强求
  - **头部压缩** 重复的 header 不在传输，仅仅传输不相同的，双方都缓存一份**基础头列表**，提高性能 2.0 之后拥有
  - **服务器推送**（Server Push）提前将客户端需要的东西主动发送（减少请求耗时），提高性能 2.0 之后拥有
  - **二进制传输**（Binary Format）之前是基于文本，但文本表现形式有多样性，处理繁杂，2.0 之后使用二进制
  - ![1.0与1.1之间的差异](/blog/knowledge/js/interview/http.png)

### 6. 文件解析（页面渲染）

略，不是这里的重点