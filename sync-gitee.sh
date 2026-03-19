#!/bin/bash
# 同步代码到 Gitee 镜像仓库

GITEE_REMOTE="gitee"
GITEE_URL="git@gitee.com:sgcnpm/gra-ui.git"

# 添加 gitee remote（如果不存在）
if ! git remote | grep -q "^${GITEE_REMOTE}$"; then
    echo "添加 gitee remote..."
    git remote add "$GITEE_REMOTE" "$GITEE_URL"
fi

# 推送所有分支和标签
echo "同步分支到 Gitee..."
git push "$GITEE_REMOTE" --all

echo "同步标签到 Gitee..."
git push "$GITEE_REMOTE" --tags

echo "同步完成。"
