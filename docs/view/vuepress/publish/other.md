## conifg中base的设置

关于基路径的设置，官方文档描述的很详尽，但这里还是特别说一下。目前的部署方式，也就是部署的仓库级gietpage，base需要设置为`/<REPO>/`和deploy.sh文件中一样，变量对应仓库名（区分大小写）。特别注意前后是都需要/。

## gitpage的部署

若采用官方推荐的部署到gitpage的方式，只要建好仓库后是不需要做特殊的处理的，只需要进入仓库的setting找到对应的gitpage的访问地址即可。

进入仓库后点击

![仓库setting](/blog/vuepress/gitpage-setting.jpg)

向下拉找到

![gitpages的url](/blog/vuepress/girpage-url.jpg)

标出的url即为部署好的访问地址

由于官方推荐的方式是会自己创建一个部署好的gh-page分支，所以也**可以直接访问项目对应的gitpage地址**。一般部署的仓库级gietpage对应地址为 `https://<USERNAME>.github.io/<REPO>/`。和deploy.sh文件中一样，两个变量分别对应用户github账号名和仓库名（区分大小写）。
