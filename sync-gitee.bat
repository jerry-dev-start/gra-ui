@echo off
chcp 65001 >nul
REM 同步代码到 Gitee 镜像仓库

set GITEE_REMOTE=gitee
set GITEE_URL=git@gitee.com:sgcnpm/gra-ui.git

REM 添加 gitee remote（如果不存在）
git remote | findstr /x "%GITEE_REMOTE%" >nul 2>&1
if errorlevel 1 (
    echo 添加 gitee remote...
    git remote add %GITEE_REMOTE% %GITEE_URL%
)

echo 同步分支到 Gitee...
git push %GITEE_REMOTE% --all

echo 同步标签到 Gitee...
git push %GITEE_REMOTE% --tags

echo 同步完成。
pause
