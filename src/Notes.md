## generator log
```
# 1. 监听 release分支到develop的pr ，拉取当前 ref 和上一个 tag 的ref 的compare中的所有pr
# 2. 提取 pr list 的所有 body 的 更新日志
# 3. 根据分类格式化 的 logs 输出到模版
# 4. 输出评论到 pr 的 comment
# 5. 检测到 评论的 done，提交 changelog 添加到 changelog.md。
# 6. 确任 md 更改，合并。

# 7. 监听 release 分支的合并，进行 git tag 对应version
# 8. git tag push 监听，发包
# 9. 监听发完包，release 这次的 changelog（从 md 或者 pr 文件取）
# 10. 同步到微信群。（mk 内网不能同步）
// 现有的开源工具都是根据 commit 的message 去pr查找。。。显得有点蠢

// 比较两个commit的提交
// https://docs.github.com/en/rest/reference/commits#compare-two-commits
// 见 compare.json 可以获取

// 列出与提交关联的拉取请求
// https://docs.github.com/en/rest/reference/commits#list-pull-requests-associated-with-a-commit

// 行不通：尝试通过参数 head 列出请求 （最简单的方式）
// https://docs.github.com/en/rest/reference/pulls#list-pull-requests
// demo

// 行不通：调用 github 的 自动生成接口 这里可能存在鉴权问题，因为不是 直接的 api 接口
// https://github.com/94dreamer/tdesign-vue-next/releases/notes?commitish=0.11.2&tag_name=0.11.2&previous_tag_name=
```
