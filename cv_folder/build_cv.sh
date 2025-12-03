#!/bin/bash

# 进入当前脚本所在目录
cd "$(dirname "$0")" || exit

# 编译英文学术简历
echo "Compiling cv.tex..."
xelatex cv.tex

# 编译中文学术简历
echo "Compiling cv_cn.tex..."
xelatex cv_cn.tex

# 编译英文商业简历
echo "Compiling cv_business.tex..."
xelatex cv_business.tex

echo "All CVs compiled."
