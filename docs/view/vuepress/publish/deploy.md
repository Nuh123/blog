##  deploy.sh 怎么用
   目前了解到三种使用方式，
   1. 双击使用
   2. package.json 中添加npx类命令(bash deploy.sh)
   3. 直接输入 bash deploy.sh
   
   **第一类：** 最粗暴实用，但前提是deploy.sh文件配置的没毛病。第一次部署时由于打包命令配置错误，且bash错误之后一直闪退，无法及时得到错误信息，弄了好久才发现问题所在。<br>
   **第二类：** 主要在windown端有问题，bash这条命令一直报错。<br>
   **第三类：** 不存在闪退及无法运行问题，观察报错信息对配置文件进行修改，很快就配置成功。
   :::tip
   我一开始git没配置秘钥，再加上打包命令字母输错，还有deploy.sh文件双击后报错闪退（真难）一直捕获不到错误原因耽误了好久，后面改为在命令行行输入bssh命令得到错误信息，修改对应的地方很快就解决了。
   :::

##  deploy.sh中几个难搞得点

### deploy.sh的位置

项目根目录，一定是项目根目录，也就是**package.json 的同层**。层次高的一看deploy.sh文件的内容就能准确判断出，层次一般只要是现代前端基本也能猜对地方（我是靠懵的）。

### deploy.sh所需的前置条件

准确配置**打包命令**,只要是从官网复制的deploy.sh文件只依赖一项前面的设置，就是对打包命令的配置，具体配置见开发部分。

```js {7}
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```
如果是按照之前的文档配的话一般都没有问题。

### deploy.sh唯一需要修改的地方

```js {23}
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```
 **如果只是简单的部署到gitpage上（没对gitpage做域名映射），修改的代码就只有高亮行一条**。整个文件有三个地方可供自定义修改，也就是原始文件中对应的三处高亮，**第一处**自定义域名的用处就是让你的gitpage页显示你自定义的域名，目前没有研究过。**剩下的两处**分别对应发布到用户github下的page（一个github只有一个，且固定）和发布到用户github对应项目下的page（一个github可以通过创建不同仓库来实现多个）。

正常情况采用发布到项目下面的模式，也就是修改高亮行。有两处需注意

1. 一般情况下有两个变量需要替换 `<USERNAME>`和`<REPO>`注意这两个是要带括号替换，（我第一次就把括号没替换掉，折腾了很久）分别对应用户github名和仓库名（区分大小写）。
2. ssh问题，注释中使用的https模式，但命令中却是ssh模式，两种解决方案，git没有配置ssh的配置一下，或者将命令中修改为https模式（没有试验过不知道会不会有其它坑）地址。至于git部分的知识不在这里过多赘述。

