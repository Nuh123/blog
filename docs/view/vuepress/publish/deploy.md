##  deploy.sh 怎么用
   目前了解到三种使用方式，
   1. 双击使用
   2. package.json 中添加npx类命令(bash deploy.sh)
   3. 直接输入 bash deploy.sh
   
   第一类最粗暴实用，但前提是deploy.sh文件配置的没毛病。第一次部署时由于打包命令配置错误，且bash错误之后一直闪退，无法及时得到错误信息，弄了好久才发现问题所在。<br>
   第二类主要在windown端有问题，bash这条命令一直报错。<br>
   第三类不存在闪退及无法运行问题，观察报错信息对配置文件进行修改，很快就配置成功。

##  deploy.sh中几个难搞得点

### deploy.sh的位置

项目根目录，一定是项目根目录，也就是package.json 的同层。层次高的一看deploy.sh文件的内容就能准确判断出，层次一般只要是现代前端基本也能猜对地方（我是靠懵的）。

### deploy.sh所需的前置条件

准确配置打包命令,只要是从官网复制的deploy.sh文件只依赖一项前面的设置，就是对打包命令的配置，具体配置见开发部分。

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

```js {20}
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

