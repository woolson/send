# 发送文件至S3

## 安装

```shell
git clone
cd send-file
npm install -g .
```

## 使用

```shell
# send 跟上本地文件路径或线上文件链接
send path/to/file/demo.jpg
# or 从网络图片上传
send http://file/link.jpg
# or 从剪贴板上传，仅支持macOS
send -c

# 选项
Options:
-c, --clipboard  从剪贴板中上传

send path/to/file/demo.jpg --hash
# 会在文件名后面拼上随机字符串，如下：
# http://link-of-file/path/demo-2ker3kd.jpg

send path/to/file/demo.jpg --path somewhere/
# 指定文件存在桶下那个目录中，默认为：it-platform/
```

## 配置

配置文件在`~/.sendrc`，可在该文件中自定义配置，如下：

__已弃用__

```yaml
# 支持以下配置：
# S3_ACCESS_ID: ''      # S3的登录ID
# S3_ACCESS_SECRET: ''  # S3的登录秘钥
# S3_BUCKET_NAME: ''    # 目标桶(Bucket)名
# S3_REGION: ''         # S3所在地区名称，默认为：cn-north-1
# S3_PATH: ''           # 文件存储路径（Bucket下路径）
```

__请使用__

```yaml
# imagur client ID
# 申请地址：https://api.imgur.com/oauth2/addclient
# 或者使用：1dfa83c47f8a089
IMAGUR_CLIENT_ID：''
```

### 查看配置

```shell
send config -s
# or
send config --show
# or
vim ~/.sendrc
```
