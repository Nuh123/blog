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

## 5 道手写题

### 拷贝

- 深浅拷贝主要是对引用类型而言，主要区别是引用类型嵌套导致
- 数组浅拷贝方法，解构（...）、concat、slice、手动遍历
- 对象浅拷贝方法，解构（...）、assign、、手动遍历（symbol 类型需要特殊处理，前面的两种方法不需要）
- 浅拷贝函数中基本类型值直接返回，symbol 和 Bigint 这两种需要特殊处理
- 类型判断函数使用前面自己的 toType 函数（自己实现的类型判断函数）
- 手写浅拷贝
  ```js
  function shallowClone(obj) {
    // 调用外部的类型判断函数
    let type = toType(obj);
    cTor = obj.constructor;
    //symbol 和 Bigint 的处理
    if (/^(symbol|bigint)$/i.test(type)) return Object(obj);
    //正则和日期
    if (/^(regexp|date)$/i.test(type)) return new cTor(obj);
    // 错误对象 Error
    if (/^(regexp|date)$/i.test(type)) return new cTor(obj.message); //特殊处理的原因在于错误对象的构造函数传参特殊
    // 函数
    if (/^function$/i.test(type)) {
      //返回新函数：新函数执行还是把原始函数执行，实现和原始函数一样的效果
      //return obj.bind(this,...arguments)
      return function () {
        return obj.call(this, ...arguments);
      };
    }
    //常规处理
    if (/^(array|object)$/i.test(type)) {
      //rerurn type = "array" ? [...obj] : {...obj}
      //最粗暴办法，symbol已处理
      let result = new cTor();
      //let keys = Reflect.keys(okj);
      //这里强调遍历所有属性添加到result中,对象没有部署迭代器对象for of是无法使用的，但for in或Object.keys()写起来麻烦
      let keys = [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
      for (let key of keys) {
        result[key] = obj[key];
      }
      return result;
    }
    //这里认为一切皆可浅拷贝，对于一些无法处理的地方，可以考虑抛异常
    return obj;
  }
  ```
- 主要原理是判断拷贝的对象的下一层(属性值)是否为引用类型，是的话就对该属性值进行深拷贝；但实际上这里的处理逻辑是仅认为数组和对象有必要深拷，其它引用类型用浅拷贝就可
- 手写深克隆
  ```js
  function deepClone(obj, cache = new Set()) {
    let type = toType(obj),
      cTor = obj.constructor;
    if (!/^(array|object)$/i.test(type)) return shallowClone(obj);
    //处理循环引用,也可以用{}或weakMap等，主要是能记录过处理过的数据即可
    cache.add(obj);
    if (cache.has(obj)) return obj;
    //和上面一样强调遍历所有属性
    let keys = [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
    //这里强调遍历所有属性添加到result中,对象没有部署迭代器对象for of是无法使用的
    for (let key of keys) {
      result[key] = deepClone(obj[key]，cache);
    }
    return result;
  }
  ```
- JSON.parse 和 JSON.striting 黑魔法的循环引用以及函数和一些特殊‘对象’无法复制的问题也都处理了
- 更高级的再 lodash 的深克隆，处理的情况更多

### 对象 merge（合并）

- 对象合并的意义 插件（组件）封装时参数处理 和 业务上的需求（axios 上 params 和 optios 的处理）
- Object.assign() （大多场景都能解决问题在全部是浅比较）和 jquery 中的 merge，以及自己实现
- 深 浅比较，浅比较认为属性值不为空，就用后面的替换，深比较类似于深克隆的反向操作
- 大致思路，基本类型直接替换；都为对象做补充或替换属性；一个为对象一个为基本类型，报错或替换（和顺序有关）；数组一般和基本类型操作一致；
- 依旧使用外部 toType 方法
- 手写 merge

  ```js
      fuction merge(options,params={}) {
        function isObj(val) {
            return toType (val) === "object"
        }
        Object.keys(params).forEach(key => {
            let isA = isObj(options[key]),
                isB = isObj(params[key]);
            // A B 都为原始类型，直接替换，数组这里也这样操作
            // A 是对象 B是原始值，抛出错误
            // A 是原始值 B是对象，B替换A
            // A B都是对象，依次遍历B中的每一项，或替换A中的内容，或添加；具体操作上就是赋值一次，有旧值覆盖，无旧值添加
            if(isA && !isB) {
                //提醒出错
                throw new TypeError('must be object')
            }
            if(isA && isB){
                options[key] = merge(options[key],params[key])
                return
            }
            options[key] = params[key]
        })


      }
  ```

- 合并更高级的玩法还可以添加类型校验，如 vue 中 prop 传参

### 函数柯里化两个应用（bind 和 curring）

后期补充

### queryURLParams 的三种实现

后期补充

### AOP 面向切片编程

- POP 面向过程编程、OOP 面向对象编程
- AOP 面向切片编程的主要作用是把一些与业务核心逻辑无关的功能抽取出来（如日志统计、安全控制、异常处理），再通过'动态植入'方式参入逻辑逻辑模块
- 装饰器模式增强、promise（能实现，但不太好）
- 面向切片效果展示
  ```js
  let func = () => {
    //业务逻辑
    console.log("func");
  };
  func
    .before(() => {
      console.log("before");
    })
    .after(() => {
      console.log("after");
    })();
  ```
- 实现思路
  ```js
  Function.prototype.before = function (callback) {
    if (typeof callback !== "function") throw new Error("参数需为函数");
    //这里 this 就是函数本身
    let context = this;
    return function (...params) {
      //控制回调和函数本身执行
      // 这里this是非function
      callback.applly(this, params);
      return context.call(this, ...params);
    };
  };
  Function.prototype.after = function () {
    //类似上面，只是循序不一致
  };
  //这里有个疑惑，连着before和after只执行一次
  //换个思路就是把before返回的函数当做一个新的函数（'func'）就行，`context.call(this, ...params)`虽然执行了两次，但只有最里面的一层的context代表的是原始func
  ```

## 基于 JS 实现 Ajax 并发请求的控制

### Ajax、axios、Fetch 之间的核心区别

- `Ajax` 实现前后端数据通信，基于 XMLHttpRequest,某些 IE 低版本是 ActivexObject，ajax 就是 jquery 对 xhr 的封装，使用回调模式
- ```js
  // 最简洁的xhr
  let xhr = new XMLHttpRequest();
  xhr.open("get", url);
  xhr.onreadystatechange = function () {
    if ((xhr.readyState === 4 && xhr.status = 200)) {
      let text = xhr.responseText;
      console.log(JSON.parse(text));
      //callback(JSON.parse(text))
    }
  };
  xhr.send();
  //顺序很重要
  ```
- ajax 模式依赖回调模式解决异步问题，部分场景会出现无限嵌套情况，所以后来出现了 promise
- `axios` 实质上还是对 XMLHttpRequest 的封装，只不过使用 promise 模式
- `Fetch` 是 ES6 新出的通信方案，对标的是 XMLHttpRequest,使用 promise 模式，Fetch 只能算半个 axios，实际使用还是要进行一定程度的封装（没有错误处理）

### 基于 promise.all 实现 Ajax 的串行和并行

- `串行`：单挑（车轮战），请求是异步的，需要等前一个完成（成功）后才执行下一个（能保证顺序），例如登录之后才能拿用户信息
- `并行`：一起上，同时发送多个请求，等多个请求都成功再做下一步（结果的顺序无法保证）
- 浏览器中的 http 请求，是浏览器的网络进程完成的，可以同时多个，但 js 是单线程的，请求之后的操作就是一步一步来的
- promise.all 就是来实现并行请求的，all 就是要所有请求都成功，all 里面参数是数组，数组元素为 promise 实例[具体使用看这](https://es6.ruanyifeng.com/#docs/promise#Promise-all)

### promise.all 并发限制及 async-pool 的应用

- `npm install asyncpool`
- 并发限制是指，每个时刻并发执行的 promise 数量是固定的，最终执行结果还是保持原来的，一般这个数量在 5~7 为宜，像浏览器的网络请求一样，是有并发上限的
- 这类问题出现的主要原因是，目前的单页面应用数据请求量是十分大的，考虑到优化问题所以会控制并发数，虽然浏览器本身有请求上限，但这个过程不受 js 控制
- 插件（async-pool）并发控制
  ```js
  const delay = function (interval) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (interval === 1003) reject("reject");
        resolve(interval);
      }, interval);
    });
  };
  let tasks = [
    () => {
      return delay(1000);
    },
    () => {
      return delay(1003);
    },
    () => {
      return delay(1005);
    },
    () => {
      return delay(1002);
    },
    () => {
      return delay(1004);
    },
    () => {
      return delay(1006);
    },
  ];
  Promise.all(tasks.map((task) => task())).then((res) => console.log(res));
  // 上述方式虽然最粗暴的实现了并行请求，但并发数没有受到控制
  let results = [];
  import asyncPool from "asyncpool";
  asyncPool(
    // 并发数
    2,
    // 任务序列
    tasks,
    // 单个任务执行的操作
    (task, next) => {
      console.log(task);
      task().then((res) => {
        results.push(res);
        next();
      });
    },
    // 整个任务序列完成之后的回调
    () => {}
  );
  ```

### js 实现 Ajax 并发请求控制的两大解决方案

```js
// 任务序列如上
// 实现1
/*params
 * tasks Array 任务序列 参考promise.all参数要求，额外需要函数包括promise实例
 * pool Number 并发数
 */
function createRequest(tasks, pool = 5) {
  // 思路：创造多个工作区，以工作区中的任务完成为衡量标准，空工作区（没有正在执行工作）需要被添加新任务
  let result = [],
    together = new Array(pool).fill(null),
    index = 0;
  together = together.map((item) => {
    return new Promise((resolve, reject) => {
      // 递归函数
      const run = function () {
        console.log("开始执行第" + index + "任务");
        // 基线条件
        if (index >= tasks.length) {
          // 唯一的resolve
          resolve();
          return;
        }
        // 保证返回结果的顺序性，没这类要求的话可以不用
        let oldIndex = index,
          task = tasks[index++];
        // 单个任务的操作，在单个任务执行成功后，通过递归向该任务区添加新（下一个）任务
        task()
          .then((res) => {
            result[oldIndex] = res;
            run();
            // 这里结合promise 来克服了调用栈执行顺序的问题
          })
          .catch((err) => {
            // 这个地方的reject是类似promise.all，即有一个失败，整个任务任务序列为失败，所以reject之后没有递归，
            // 所以这里也算递归的基线条件，因为这里reject的是外层的promise
            reject(err);
          });
      };
      run();
    });
  });
  // 所以这里才是并行的控制，结果的并行体现在这里；上面是并发的控制（递归），但也需要结合这里并行特点完成，
  return Promise.all(together).then(() => result);
}
createRequest(tasks, 2)
  .then((res) => {
    // tasks需要全部成功
    console.log("成功", res);
  })
  .catch((err) => {
    // tasks中只要有一个失败就失败
    console.log("失败", err);
  });
// 实现2
function createReq(tasks, pool, callback) {
  if (typeof pool === "function") {
    callback = pool;
    pool = 5;
  }
  if (typeof pool !== "number") pool = 5;
  if (typeof callback !== "function") {
    callback = (res) => {
      console.log(res);
    };
  }
  // 上面是健壮性考虑的参数校验
  class TaskQueue {
    constructor() {
      this.running = 0;
      this.queue = [];
      // 上面这两个是关键属性
      this.results = [];
    }
    pushTask(task) {
      // 这里就是一个单纯维护内部任务的地方，且肩负启动轮询（执行）运行的任务
      // 这种轮询触发的条件是添加了新的任务或者当前执行的某个任务执行完毕
      let self = this;
      self.queue.push(task);
      self.next();
    }
    next() {
      // 这里称为轮询吧其实不对，但也想不好其它准确的表达暂时就叫轮询吧，只要我部任务队列不为空，我就一直遍历我的任务队列，并尝试执行
      // 上面说到尝试执行，最终是否执行就看另一个关键指标，当前在执行的任务数
      // 一个任务开始执行，当前执行数要增加，内部任务队列要清除该项
      // 一个任务执行完毕后，要适当对执行数做减少，做结果缓存，以及触发下一轮轮询（因为当前执行数减少了）
      let self = this;

      while (self.running < pool && self.queue.length) {
        self.running++;
        let task = self.queue.shift();
        task()
          .then((res) => {
            self.results.push(res);
          })
          .finally(() => {
            // 这里的finally的意思是不在乎是否成功，这里关注是否执行过（来过）
            // 如果希望不是这样，需要补充为catch，并需要做相应的退出整个tasks的操作self.queue = 0
            self.running--;
            self.next();
          });
        // .catch((err) => {
        //   self.queue = 0;
        //    此步需要停止next调用，防止callback执行。running只要没减就不会执行callbask
        //   throw new Error(err);
        // });
      }

      if (self.running === 0) {
        callback(self.results);
      }
    }
  }
  let TQ = new TaskQueue();
  tasks.forEach((task) => TQ.pushTask(task));
}
createReq(tasks, 2, (res) => {
  console.log(res);
});
// 两种解法都有一个感觉，就是必须在任务异步'完成时'去 '执行'下一个任务，但两种思路对 完成的判断有差异，具体体会代码；第一种感觉更像伪方案
```

### js 异步处理机制：EventQueue 和 EventLoop

后期补充

## 前后端通信中的'同源/跨域'解决方案

### 1. 前端开发的通信历史

- 服务器渲染
- 客户端渲染（同源策略）
- 客户端渲染（跨域方案）
- 半服务器渲染（SSR）

### 2. 你认为 Ajax 的意义是啥

- **局部刷新**是最关键的，让客户端和服务端各司其职
- 与之对应的是全局刷新，变一次数据，服务端需要返回一套完整的全新页面；局部刷新就是结合 DOM 接口，更新时只需要重新获取数据，在客户端重新渲染

### 3. Ajax、axios、fetch 对比

- 基础见 `基于 JS 实现 Ajax 并发请求的控制章节`
- 自己写 ajax
  ```js
  function ajax(option = {}) {
    option = Object.assign(
      {
        url: "",
        method: "get",
        data: null,
        // data需要根据method的不同，做不同的处理
        // get 请求是没有单独的请求体，参数是跟随url的，叫查询参数
        // post 请求是直接放请求体就行
        // 关于 content-type，get请求类的是x-www-form-urlencode;
        // post根据后端要求会有不同值 formdata 和 application/json 等
        success: null,
      },
      option
    );
    // 这里qs是一个库,下面的功能就是专为url传参，也就是x-www-form-urlencode类格式
    options.data = qs.stringigy(oprion.data)
    // 判断是否是get类请求
    let isGet = /^(GET|DELETE|HEAD|OPTIONS)$/i.test(option.method)
    if (isGet && option.data) {
      let char = option.url.includes('?') ? '&' : '?'
      option.url += `${char}${option.data}`
      option.data = null
    }
    let xhr = new XMLHttpRequest();
    xhr.open(option.method, option.url);
    xhr.onreadystatechange = function () {
      //if ((xhr.readyState === 4 && xhr.status = 200)) {
      if(/^2\d{2}$/.test(xhr.status)  && xhr.readyState === 4){
        tyepof option.success === 'function' ?
        option.success(JSON.parse(xhr.responseText)) :
        null
      }
    };
    xhr.send(option.data);
    //顺序很重要
  }
  ```
- 串行执行 ajax 只能通过回调实现；asyns 属性是同步执行，性能问题严重
- 自己实现'最素的 axios'

  ```js
  // 最初就是用promise包ajax来解决回调地狱问题,注意这里是基于ajax来使用promise
  new Promise((resolve) => {
    ajax({
      url: "",
      method: "get",
      success(res) {
        resolve(res);
      },
    });
  }).then((res) => {
    // 真正的success函数，如果考虑到封装使用，需要注意这里可能需要新pronmise被返回
  });

  // axios才是比较靠谱的解决方案，是直接用promise来包xhr，相当于是一种新版本的ajax
  function ajax2(option = {}) {
    option = Object.assign(
      {
        url: "",
        method: "get",
        data: null,
        // data需要根据method的不同，做不同的处理
        // get 请求是没有单独的请求体，参数是跟随url的，叫查询参数
        // post 请求是直接放请求体就行
        // 关于 content-type，get请求类的是x-www-form-urlencode;
        // post根据后端要求会有不同值 formdata 和 application/json 等
      },
      option
    );
    // 这里qs是一个库,下面的功能就是专为url传参，也就是x-www-form-urlencode类格式
    options.data = qs.stringigy(oprion.data);
    // 判断是否是get类请求
    let isGet = /^(GET|DELETE|HEAD|OPTIONS)$/i.test(option.method);
    if (isGet && option.data) {
      let char = option.url.includes("?") ? "&" : "?";
      option.url += `${char}${option.data}`;
      option.data = null;
    }
    // 就单纯的对xhr过程做promise包装
    // 这里注意一定是return一个promise，这也是promise链式调用的基础
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(option.method, option.url);
      xhr.onreadystatechange = function () {
        if (!/^2\d{2}$/i.test(xhr.status)) {
          reject(xhr);
          return;
        }
        if (/^2\d{2}$/.test(xhr.status) && xhr.readyState === 4) {
          resolve(JSON.parse(xhr.responseText));
        }
      };
      xhr.send(option.data);
      //顺序很重要
    });
  }
  // axios 的多重调用方式实现
  ["get", "post", "put"].forEach((item) => {
    ajax2[item] = function (url = "", data = {}) {
      return ajax2({
        url,
        method: item,
        data,
      });
    };
  });
  // 函数既是函数，也是引用类型（就是可以打点，设置、访问属性）
  ```

- 实际使用中一般会对 axios 做二次封装，讲了 axios 的使用中的一些常规操作，慕课网有个详细的教程，这里不纠缠细节
- 主要是配置 axios 的默认 baseURL、timeout、请求头、transformRequest（参数转换函数）等；最重要的是两个拦截器，请求拦截器里一般带认证信息（token），但这里的处理上它这里处理的不太细致（token 的过期及加密问题）；响应拦截器主要是对状态做一个统一的处理，具体的分类还需要配合后台那边
- fetch 不管状态码是多少，只要服务器返回就算成功，只有断网才算失败，所以虽然是原生支持 promise 的 API，但实际使用时还是需要大量封装，核心是在第一个返回里做拦截操作（就是对状态码的判断），代码暂时不贴

```js
// Fetch 封装
function ajax3(option = {}) {

    // 这里就是对options的处理和其它一些与fetch无关的操作

    return fetch(url,options)
    .then(res => {
      // 这里处理的是多种状态码，包括非200
      if(!/^(2|3)\d{2}$/i.test(ress.status)){
        switch(res.status) {
          case 401:
            break;
          case 403:
            break;
          case 404:
            break;
        }
        return Promise.reject(res)
      }
      return res.json()  // fetch 方法
    })
    .catch(err) => {
      if(!window.navigatior.onLine){
        // 断网了，做相应的操作
        return
      }
      return Promise.reject(err)
    }
```

### 4. 跨域处理方案

- 跨域产生的原因
  - 跨域的理论原理，浏览器出于安全方面的原因考虑设置了**同源策略**，[详细参考这里](https://wangdoc.com/javascript/bom/same-origin.html)
  - **早些年**部署上前后没有分离，前后端部署在一个位置（同源、同一个文件夹、同一个端口），但开发中除非同一个人写，否则一定会有跨域问题（开发中后端还是有自己的服务）
  - 后面项目越来越复杂，衍生出**前后分离部署**、开发的情况，后端也分离服务器（web 静态资源服务器、图片服务器、数据服务器等）
  - 甚至现在出现了一些调用**第三方 API**的情况
- **伪方案**（仅解决线上为不分离的情况），**修改 host**，driver 下 etc 文件夹下的 host 文件（之前处理远程访问单点登陆问题的时候接触过）指定了本地的源，设为请求端的地址，骗过浏览器
- **最老旧**的方式 JSONP 方案，主要是 script 标签不存在跨域限制（image 标签也不存在）只支持 get 请求，但对老服务器兼容。具体使用就是在接口后带查询参数键名为 callback 键值为回调函数名，全局要定义回调函数，接口返回的是函数的执行，其中带实参[具体参考这里](https://wangdoc.com/javascript/bom/same-origin.html#jsonp)
- **最省事**的方式 CORS, 主要是通过设置`响应头`让浏览器允许即可，一般后端设置，一般设置三个`Access-Control-Allow-Origin: 需要的源`、` Access-Control-Allow-Headers：需要的请求头``Access-Control-Allow-Methods：需要的方式 `、`Access-Control-Allow-Credentiais:需要`、
  其中在需要的源位置，可以设置为 * ，但需要明确的是，设为*之后无法带 cookie，这也是跨域资源共享的缺点
- **最常用**的方式 Proxy, 开发中 webpack 中有自己代理模式来解决开发中的跨域问题，wbpack 会在本地建立自己的本地服务器（基于 node），网页端向本地服务器请求，本地服务器再代为请求接口服务器，从而避开浏览器的跨域限制；部署时一般通过 nginx 来实现代理
- 当然还有一些不太常用的方案自己可以再自己研究下，比如 postmessage 一般用于 H5 和 app 通信时用，iframe 来的快，死的也快[具体看这里](https://wangdoc.com/javascript/bom/same-origin.html#ajax)

## js 中的高频（8 种）设计模式

### 设计模式存在的必要

- 设计模式是一种思想，用来规范化编程，使代码整洁、易懂、好维护拓展

### 单例模式与命令模式

- `单例模式`相对最简单，思想就是基于单独的实例，来管理一个模块中的内容，实现模块之间的单独划分（但也可以实现模块之间方法的相互调用）
- 模块化最初使用闭包、后面有 AMD 、后面出现了 CMD（node）、以及标准的 esMOdule
- 一个闭包属于一个模块，且只有一个，也是单例的一种实现，后期 symbol 也可以用来实现传统写法的单利[symbol 实现单例](https://es6.ruanyifeng.com/#docs/symbol#%E5%AE%9E%E4%BE%8B%EF%BC%9A%E6%A8%A1%E5%9D%97%E7%9A%84-Singleton-%E6%A8%A1%E5%BC%8F)
- `命令模式 `按照一定的顺序执行对应的方法，来实现整个板块的开发，主要是可以控制执行的先后
- **单例模式特点**因为只有一个，所以多个之间会相互影响（这里就是全局只有一个的的意思，但这不正就是单例的特点嘛，这里相互影响更多说的是模块化的问题，所以对这种单例和模块结合论不太认同）
- 这个和蓝色那本 js 设计模式上讲的有些区别

### 构造器模式与工厂模式

- 面向对象的基础（缘由），实例之间既有相同（公共方法），又有区别（私有属性），来’弥补‘单例的缺点
- js 中没有类，但一定程度上，可以认为构造函数就是类
- es6 中 class 写法就是`构造器模式`（不传参的情况下 new 类名后面的括号可以不加，优先级能差 1）
- 插件组件封装、类库封装、框架封装一般用构造器模式
- `工厂模式` 帮助开发者实现调用切换，或者实现一些中转处理（就是保证逻辑固定的情况下根据不同输入产出），批量生产不准确
- 这里整了一下 jquery 的 innit 方法
- ```js
  (function () {
    var jquery = function (selector, context) {
      // 通过工厂模式转化，将需要实例化new的操作转为函数调用
      return new jquery.fn.init(selector, context);
    };
    // 这里有一个点 jquery._proto_ = init.prototype
    // 我的理解这里就是给prototype属性一个简写fn
    jquery.fn = jquery.prototype = {};
    // 这里就是编写具体的init方法，并存储变量
    var init = (jquery.fn.init = function (selector, context) {});
    // 这也是我至今不明白的点，为什么要刻意将init的原型指向jquery.prototype,这样就形成一个闭环，但作用嗯？？看一些文章说下面才是实现无new实现的核心
    // 等价于下面,
    // jquery._proto_ = jquery.prototype
    // 如果没有 jquery._proto_ = init.prototype
    // 而这里的 init.prototype 应该是Function，而这里的init实例化理论上是jquery的实例，也就是上面的jquery._proto_ = jquery.prototype
    init.prototype = jquery.fn;
    // 又一个想法是这样jquery实例去查找一些原型链上的方法时会直接去自己的prototype上找，而不是去Function.prototype
    window.$ = jquery;
  })();
  ```

### 观察者模式

- 定义上呢是`观察者` 观察`目标`,一个目标会被多次观察，目标变化后通过 一些手段，让观察它的观察者知道，并作出相应的行为
- 代码封装上 目标 =》 被观察 =》 目标变化 => 观察者收到消息
- 这种模式只有两个角色，`目标`对象上来实现该模式的核心，大部分功能在目标对象上封装 notify（触发通知）、add（添加、保存观察者）;`观察者`实现的 update 实际上实现的还是个性化需求,在通知到达时触发
- 观察者模式手写

  ```js
  // vue 2版本的响应式原理
  //观察者1
  class Observer {
    update() {
      //消息触达（达到触发条件）
    }
  }
  //观察者2
  class Demo {
    update(mes) {
      console.log("消息接收成功" + mes);
    }
  }

  //目标对象
  class Subject {
    //observers = new OvserverListr();
    observers = [];
    add(ob) {
      this.observers.add(ob);
    }
    remover(ob) {
      //和前面一样包一层
    }
    notify(...params) {
      for (let i = 0; i < this.observers.count(); i++) {
        // let item = this.observers.get(i);
        let item = this.observers[i];
        item.update(...params);
      }
    }
  }
  // 单独拎出来的目标群维护,可以直接在subject里写，不写有助于理解，写了有助于代码管理，这边直接不用
  class ObserverList {
    constructor() {
      this.obeserverList = [];
    }
    remove(ob) {
      this.oberverList = this.oberverList.filter((item) => ob !== item);
      return this;
    }
    add(ob) {
      this.observerList.push(ob);
      return this;
    }
    get(index) {
      return this.oberserList[index];
    }
    count() {
      return this.ObserverList.length;
    }
  }
  //这个实例化不带括号之前出现过（前面构造器模式）,这里格式化工具会自己带
  let sub = new Subjece();
  sub.add(new Observer());
  sub.add(new Demo());
  sub.add(new Observer());
  serTimeout(() => {
    sub.notify("触发通知");
  }, 1000);
  ```

### 中介模式

- 这里面 有三类角色 `甲方` `乙方`（可以多个） 和`中介`
- 里面 甲乙可以不经过任何封装，'协调'全在中介这
- 手写中介模式

  ```js
  let mediator = (function () {
    let topics = {};
    // 订阅： 订阅A组件中的某个方法（这里的方法可以认为是原始反应），
    let subscribe = function (topic) {
      !topics[topic] ? (topics[topic] = []) : null;
      topics[topic].push({
        context: this,
        callback,
      });
    // 发布  原始反应所带来的连带效应（之前关注过原始反应的组件B等）
    let publish= function(topic,...params) {
        if (!topics[topic]) return
        topics[topic].forEach(item => {
            let {
                callback,
                context
            } = item
            callback.call(context,...params)
        })
    }
    return {
        subscribe,
        publish
    }
  })();
  ```

### 发布订阅模式

- 和上述两种方式特别相似，也极易混淆，三种之间可以理解为一种晋级
- `发布订阅`结合 Event 模型，js 中就是给当前元素的某个行为绑定多个不同的方法（事件池机制），事件行为触发，会一次通知事件池中的方法执行
- 这里提一嘴 dom0 级和 dom2 级事件绑定（上面指的是 dom2 级绑定）
- dom0 事件绑定原理是对象的属性方式，绑定的事件也是'属性'（方法），所以存在覆盖属性现象
- 手写发布订阅
  ```js
  // 这里似乎用一种比较少见的写法实现，没太整明白，先把代码记下来
  (function () {
    // 事件池
    let pond = [];
    //向事件池注入方法
    function subscribe(func) {
      //去重
      if (pond.includes(func)) return;
      pond.push(func);
      //每次执行，返回的方法是用来移除当前新增的这一项的
      return function unsubscribe() {
        pond = pond.filter((item) => item !== func);
      };
    }
    // 通知事件池中的每个方法
    subscribe.fire = function (...params) {
      pond.forEach((item) => {
        if (typeof item === "function") {
          item(...params);
        }
      });
    };
    window.subscribe = subscribe;
  })();
  let unsubscribe1 = subscribe(function () {
    console.log(1, arguments);
  });
  //unsubscribe1();
  subscribe(function () {
    console.log(2, arguments);
  });
  subscribe(function () {
    console.log(3);
    unsubscribe1();
  });
  subscribe(function () {
    console.log(4);
  });
  setTimeout(() => {
    subscribe.fire(10, 20, 30);
  }, 1000);
  setTimeout(() => {
    subscribe.fire(10, 20, 30);
  }, 2000);
  ```
- 实际业务上，接口数据返回后需要同时修改多个不同模块，用发布订阅可维护性会好很多（但似乎上述两种种模式都适用这样的场景），但这个地方的写法在目前的我看来就是上面的中介模式
- 目前对着三种模式的理解都是，找地方保存未来在某个特定'节点'执行的操作，到达节点后，去列表中逐个触发
- 面向对象完善发布订阅
  ```js
  class Sub {
    constructor() {
      this.pond = [];
    }
    subscrobe() {
      // 向事件池中订阅任务
      let self = this,
        pond = self.pond;
      if (!pond.includes(func)) pond.push(func);
      return function unsubscribe() {
        // 不是很能理解这里非要用闭包来实现解绑的必要性
        // 该闭包唯一使用到的是func变量，但js事件的解绑机制就是相同的函数（堆内存地址一致）才可以解绑，也就是func应该在用户解绑时的传入决定
        pond = pond.filter((item) => item !== func);
      };
    }
    fire(...params) {
      //执行当前实例事件池中的所有任务
      pond.forEach((item) => {
        if (typeof item === "function") item(...params);
      });
    }
  }
  //这一套发布订阅和Event有点不一样，是用多个事件池来维护不同的事件
  //两个维度来解决，函数添加事件type`pond = [{type:'A',callback:func}]`；和从事件维度区分函数 `pond = {'A': [func1,func2]}`
  ```
- 最后还有一个最终版，就是之前我知道的 Event 写法
- 这里解绑时提到一点删除数组（splice 方法）时的问题，**数组塌陷问题**，一个正在被遍历（从前到后）的数组被 splice （修改）后会'丢失'数据，**可以将删除项设置为 null，下一次再删除；从后到前遍历也能解决；手动控制循环变量也可**

### 装饰器模式和 es7 中的装饰器（Decorator）

后期补充
