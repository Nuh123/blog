# 先设计 VNode 吧

上一章讲述了组件的本质，知道了一个组件的产出是 `VNode`，渲染器(`Renderer`)的渲染目标也是 `VNode`。可见 `VNode` 在框架设计的整个环节中都非常重要，甚至**设计 `VNode` 本身就是在设计框架**，`VNode` 的设计还会对后续算法的性能产生影响。本章我们就着手对 `VNode` 进行一定的设计，尝试用 `VNode` 描述各类渲染内容。

## 用 VNode 描述真实 DOM

一个 `html` 标签有它的名字、属性、事件、样式、子节点等诸多信息，这些内容都需要在 `VNode` 中体现，我们可以用如下对象来描述一个红色背景的正方形 `div` 元素：

```js
const elementVNode = {
  tag: "div",
  data: {
    style: {
      width: "100px",
      height: "100px",
      backgroundColor: "red",
    },
  },
};
```

我们使用 `tag` 属性来存储标签的名字，用 `data` 属性来存储该标签的附加信息，比如 `style`、`class`、事件等，通常我们把一个 `VNode` 对象的 `data` 属性称为 `VNodeData`。

为了描述子节点，我们需要给 `VNode` 对象添加 `children` 属性，如下 `VNode` 对象用来描述一个有子节点的 `div` 元素：

```js {4-7}
const elementVNode = {
  tag: "div",
  data: null,
  children: {
    tag: "span",
    data: null,
  },
};
```

若有多个子节点，则可以把 `children` 属性设计为一个数组：

```js {4-13}
const elementVNode = {
  tag: "div",
  data: null,
  children: [
    {
      tag: "h1",
      data: null,
    },
    {
      tag: "p",
      data: null,
    },
  ],
};
```

除了标签元素之外，DOM 中还有文本节点，我们可以用如下 `VNode` 对象来描述一个文本节点：

```js
const textVNode = {
  tag: null,
  data: null,
  children: "文本内容",
};
```

如上，由于文本节点没有标签名字，所以它的 `tag` 属性值为 `null`。由于文本节点也无需用额外的 `VNodeData` 来描述附加属性，所以其 `data` 属性值也是 `null`。

唯一需要注意的是我们使用 `children` 属性来存储一个文本节点的文本内容。有的同学可能会问：“可不可以新建一个属性 `text` 来存储文本内容呢？”

```js
const textVNode = {
  tag: null,
  data: null,
  children: null,
  text: "文本内容",
};
```

这完全没有问题，这取决于你如何设计，但是**尽可能的在保证语义能够说得通的情况下复用属性，会使 `VNode` 对象更加轻量**，所以我们采取使用 `children` 属性来存储文本内容的方案。

如下是一个以文本节点作为子节点的 `div` 标签的 `VNode` 对象：

```js
const elementVNode = {
  tag: "div",
  data: null,
  children: {
    tag: null,
    data: null,
    children: "文本内容",
  },
};
```

## 用 VNode 描述抽象内容

什么是抽象内容呢？组件就属于抽象内容，比如你在 模板 或 `jsx` 中使用了一个组件，如下：

```html
<div>
  <MyComponent />
</div>
```
