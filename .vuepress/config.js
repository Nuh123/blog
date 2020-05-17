/*
* @Author: name
* @Date:   2020-05-17 11:55:42
* @Last Modified by:   name
* @Last Modified time: 2020-05-17 23:52:37
*/

module.exports = {
  title: 'Hello VuePress',
  description: 'Just playing around',
  themeConfig: {
        // navbar: false,
        // repo: 'https://github.com/Nuh123/gitpage-study',
        // 自定义仓库链接文字。
        // repoLabel: 'GitHub',
        nav: [
            { text: '主页', link: '/' },
            { text: '指南', link: '/view/guide/' },
            { text: '储备', link: '/view/knowledge/' },
            { text: '项目', link: '/view/project/' },
            // { text: '个人展示', link: '/view/myProject/' },
            // {text: 'Languages',
            //     ariaLabel: 'Language Menu',
            //     items: [
            //       { text: 'Chinese', link: '/language/chinese/' },
            //       { text: 'Japanese', link: '/language/japanese/' }
            //     ]
            // }
        ],
        sidebar: {
            '/view/knowledge/': [
                {
                    title: 'JS相关',   // 必要的
                    //path: '/foo/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
                    //collapsable: false, // 可选的, 默认值是 true,
                    sidebarDepth: 2,    // 可选的, 默认值是 1
                    children: [
                        ['./js/base', '基础'],
                        ['./js/object-oriented', '面向对象'],
                        ['./js/BOM', '浏览器对象模型'],
                        ['./js/DOM', '文档对象模型'],
                        ['./js/senior', '高阶']
                    ]
                },
                {
                    title: 'ES6相关',   // 必要的
                    //path: '/foo/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
                    //collapsable: false, // 可选的, 默认值是 true,
                    sidebarDepth: 2,    // 可选的, 默认值是 1
                    children: [
                        ['./es6/asyn-reslove', '异步处理'],
                        ['./es6/class', '类写法'],

                    ]
                },
                {
                    title: 'vue相关',   // 必要的
                    //path: '/foo/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
                    //collapsable: false, // 可选的, 默认值是 true,
                    sidebarDepth: 2,    // 可选的, 默认值是 1
                    children: [
                        ['./vue/base', 'vue基础'],
                        ['./es6/class', '类写法'],

                    ]
                },
            ],

            '/view/project/': [
            //''      /* /bar/ */

            ],

            '/view/guide/': [
                ['toal', '该项目指南'],
                {
                    title: '第一大类',   // 必要的
                    //path: '/foo/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
                    collapsable: false, // 可选的, 默认值是 true,
                    sidebarDepth: 2,    // 可选的, 默认值是 1
                    children: [
                        ['one', '第一项'],
                        ['two', '第二项']
                    ]
                },
                //['two', '第二项'],
                ['three', '第三项']
            ],

            // '/view/myProject/': [
            // //''      /* /bar/ */

            // ],

            // fallback
            '/': [
            ''       /*  */
            ]
        }
    },
    plugins: ['@vuepress/back-to-top']
}