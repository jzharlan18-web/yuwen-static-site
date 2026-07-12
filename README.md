# 静态教学网站建设方案

## 一、基本判断

把原来单机版的课堂网页上传到线上，做成一个静态教学网站，是可行的。

比较适合的路线是：

> GitHub 存放网页文件，Netlify 自动发布，Codex 协助维护目录和链接。

这个方案适合当前需求：

- 不需要后台数据库。
- 不需要登录系统。
- 不需要复杂的网站开发。
- 可以保留原来已经做好的课堂网页。
- 后续新增课件时，只需要增加文件夹和目录链接。

真正需要提前规划的不是复杂技术，而是：

1. 网页越来越多以后如何分类。
2. 每节课之间如何导航。
3. 后续新增内容时如何避免混乱。

因此，不建议一开始把它当成复杂的网站系统，而应先做成一个“语文课堂网页课件资料库”。

## 二、推荐网站结构

建议采用如下目录结构：

```text
语文教学网站/
├─ index.html              # 网站首页，总目录
├─ assets/                 # 公共图片、字体、样式
│  ├─ css/
│  └─ images/
├─ lessons/                # 所有课堂网页
│  ├─ bixiu-shang/
│  │  ├─ index.html        # 必修上册目录
│  │  ├─ qinyuanchun-changsha/
│  │  │  ├─ index.html
│  │  │  └─ assets/
│  │  └─ xianglin-sao/
│  │     ├─ index.html
│  │     └─ assets/
│  └─ xuanbi/
├─ tools/                  # AI 教学小工具
└─ README.md
```

## 三、第一阶段：只做“总目录网站”

第一阶段不要急着统一所有网页，也不要重构已经能用的课件。

原来一堂课有 1 到 5 个网页，可以先保持原样。每节课单独建一个文件夹，里面放原网页和图片资源，然后在网站首页增加链接。

示例：

```text
lessons/qinyuanchun-changsha/
├─ index.html
├─ page1.html
├─ page2.html
├─ images/
```

首页可以先做成简单目录：

```text
必修上册
- 沁园春·长沙
- 乡土中国
- 赤壁赋

选择性必修
- 屈原列传
- 项脊轩志
```

这样能最快上线，也能避免陷入“先设计一个完美系统”的低效状态。

## 四、第二阶段：逐步统一页面导航

等课件数量增加后，再让 Codex 帮忙给每个课件页面增加统一导航。

建议每个页面至少包含：

- 返回首页
- 返回本册目录
- 上一篇
- 下一篇
- 本课目录

这样学生和教师打开网页后不容易迷路，也方便课堂使用。

## 五、第三阶段：再考虑目录数据化

当网页数量超过 30 个以后，可以考虑用一个简单的目录文件维护课程信息，例如 `lessons.json` 或 `data.js`。

这个文件可以记录：

- 课文标题
- 所属教材
- 年级或模块
- 页面链接
- 简短说明

但一开始不一定要这样做。

当前更适合的方式是：

> 先用普通 `index.html` 手动维护目录，等内容明显增多后，再改成数据化目录。

## 六、暂时不建议做的事

目前不建议：

1. 做登录系统。
2. 做数据库。
3. 做后台管理。
4. 使用复杂前端框架。
5. 把所有网页都堆在网站根目录。
6. 大量使用中文文件名、空格和特殊符号作为路径。

## 七、文件夹和路径命名建议

文件夹路径建议使用英文、拼音或简短拼音加英文。

示例：

```text
qinyuanchun-changsha
xianglin-sao
chibi-fu
gaokao-zuowen
```

页面标题可以继续使用中文，不影响展示效果。

不建议使用：

```text
沁园春·长沙
高考 作文
第1课：沁园春
```

原因是这些命名在 GitHub、Netlify、链接复制、跨平台同步时更容易出问题。

## 八、后续更新流程

以后每次新增课件，可以固定采用这个流程：

1. 用 Codex 生成或整理新的课堂网页。
2. 放入对应课程文件夹。
3. 让 Codex 更新首页目录链接。
4. 检查所有链接路径是否正确。
5. 推送到 GitHub。
6. Netlify 自动更新线上网站。

## 九、可直接复制给 Codex 的指令

以后新增课件时，可以直接使用下面这段指令：

```text
请把这个新课件加入静态教学网站：
1. 新建课程文件夹。
2. 把网页文件放入 lessons 对应目录。
3. 更新首页 index.html 的课程目录。
4. 检查所有链接路径是否正确。
5. 不要引入数据库或后台。
```

## 十、结论

这条路线适合当前实际情况。

关键不是先学会完整的网站开发，而是先建立三套规范：

1. 文件夹规范。
2. 命名规范。
3. 首页目录规范。

只要这三件事稳定，后续就可以长期使用 Codex 协助维护，逐步把分散的课堂网页整理成一个清晰、可访问、可持续更新的语文教学网站。

---

# 高二语文静态教学网站目录规划

## 一、用途说明

本文档用于把高二新学期课文目录整理成静态教学网站的栏目结构，同时预留作文教学、试卷讲评、专题复习和 AI 学习工具等拓展空间。

建议目标：

- 每个单元有一个单元目录页。
- 每篇课文有独立文件夹。
- 每篇课文后续可以放课堂网页、导学案、任务单、AI 学习工具、拓展材料等。
- 除课文教学外，网站还应能长期承载作文教学、试卷讲评、专题训练和阶段复习。
- 文件夹路径尽量使用拼音或英文，避免中文路径、空格和特殊符号。

## 二、推荐总目录结构

```text
语文教学网站/
├─ index.html
├─ lessons/
│  └─ gaoer/
│     ├─ index.html
│     ├─ textbook/              # 教材课文教学
│     │  ├─ unit-01/
│     │  ├─ unit-02/
│     │  ├─ unit-03/
│     │  ├─ unit-04/
│     │  └─ poetry-recitation/
│     ├─ writing/               # 作文教学
│     ├─ exam-review/           # 试卷讲评
│     ├─ thematic-study/         # 专题复习或专题训练
│     └─ ai-tools/              # AI 学习工具或课堂小工具
└─ assets/
```

## 三、高二首页栏目建议

```text
高二语文

教材课文
第一单元：革命传统与时代记录
第二单元：中华传统文化经典研读
第三单元：外国小说阅读
第四单元：逻辑的力量
古诗词诵读

作文教学
试卷讲评
专题训练
AI 学习工具
```

说明：单元名称可以根据教材正式表述再调整。当前名称主要用于网站栏目分类，便于教师和学生快速识别学习内容。

## 四、第一单元目录

建议路径：

```text
lessons/gaoer/textbook/unit-01/
```

课文目录与文件夹建议：

| 序号 | 课文                                   | 作者             | 建议文件夹                    |
| ---- | -------------------------------------- | ---------------- | ----------------------------- |
| 1    | 中国人民站起来了                       | 毛泽东           | `zhongguo-renmin-zhanqilaile` |
| 2    | 长征胜利万岁                           | 杨成武           | `changzheng-shengli-wansui`   |
| 3    | 大战中的插曲                           | 聂荣臻           | `dazhan-zhong-de-chaqu`       |
| 4    | 别了，“不列颠尼亚”                     | 周婷、杨兴       | `bie-le-buliediannia`         |
| 5    | 县委书记的榜样——焦裕禄                 | 穆青、冯健、周原 | `jiaoyulu`                    |
| 6    | 在民族复兴的历史丰碑上——2020中国抗疫记 | 钟华论           | `2020-kangyi-ji`              |
| 7    | 单元研习任务                           |                  | `unit-task`                   |

建议结构：

```text
unit-01/
├─ index.html
├─ zhongguo-renmin-zhanqilaile/
├─ changzheng-shengli-wansui/
├─ dazhan-zhong-de-chaqu/
├─ bie-le-buliediannia/
├─ jiaoyulu/
├─ 2020-kangyi-ji/
└─ unit-task/
```

## 五、第二单元目录

建议路径：

```text
lessons/gaoer/textbook/unit-02/
```

课文目录与文件夹建议：

| 序号 | 课文             | 来源     | 建议文件夹               |
| ---- | ---------------- | -------- | ------------------------ |
| 5-1  | 《论语》十二章   | 《论语》 | `lunyu-shierzhang`       |
| 5-2  | 大学之道         | 《礼记》 | `daxue-zhidao`           |
| 5-3  | 人皆有不忍人之心 | 《孟子》 | `renjie-burenren-zhixin` |
| 6-1  | 《老子》四章     | 《老子》 | `laozi-sizhang`          |
| 6-2  | 五石之瓠         | 《庄子》 | `wushi-zhi-hu`           |
| 7    | 兼爱             | 《墨子》 | `jianai`                 |
| 8    | 单元研习任务     |          | `unit-task`              |

建议结构：

```text
unit-02/
├─ index.html
├─ lunyu-shierzhang/
├─ daxue-zhidao/
├─ renjie-burenren-zhixin/
├─ laozi-sizhang/
├─ wushi-zhi-hu/
├─ jianai/
└─ unit-task/
```

## 六、第三单元目录

建议路径：

```text
lessons/gaoer/textbook/unit-03/
```

课文目录与文件夹建议：

| 序号 | 课文                  | 作者            | 建议文件夹          |
| ---- | --------------------- | --------------- | ------------------- |
| 8    | 大卫·科波菲尔（节选） | 狄更斯          | `david-copperfield` |
| 9    | 复活（节选）          | 列夫·托尔斯泰   | `fuhuo`             |
| 10   | 老人与海（节选）      | 海明威          | `laoren-yu-hai`     |
| 11   | 百年孤独（节选）      | 加西亚·马尔克斯 | `bainian-gudu`      |
| 12   | 单元研习任务          |                 | `unit-task`         |

建议结构：

```text
unit-03/
├─ index.html
├─ david-copperfield/
├─ fuhuo/
├─ laoren-yu-hai/
├─ bainian-gudu/
└─ unit-task/
```

## 七、第四单元目录

建议路径：

```text
lessons/gaoer/textbook/unit-04/
```

单元主题：

```text
逻辑的力量
```

学习活动与文件夹建议：

| 序号 | 学习活动           | 建议文件夹            |
| ---- | ------------------ | --------------------- |
| 1    | 发现潜藏的逻辑谬误 | `logic-fallacies`     |
| 2    | 运用有效的推理形式 | `logic-reasoning`     |
| 3    | 采用合理的论证方法 | `logic-argumentation` |

建议结构：

```text
unit-04/
├─ index.html
├─ logic-fallacies/
├─ logic-reasoning/
└─ logic-argumentation/
```

## 八、古诗词诵读目录

建议路径：

```text
lessons/gaoer/textbook/poetry-recitation/
```

课文目录与文件夹建议：

| 序号 | 篇目                        | 作者或来源    | 建议文件夹           |
| ---- | --------------------------- | ------------- | -------------------- |
| 1    | 无衣                        | 《诗经·秦风》 | `wuyi`               |
| 2    | 春江花月夜                  | 张若虚        | `chunjiang-huayueye` |
| 3    | 将进酒                      | 李白          | `jiangjinjiu`        |
| 4    | 江城子·乙卯正月二十日夜记梦 | 苏轼          | `jiangchengzi-yimao` |

建议结构：

```text
poetry-recitation/
├─ index.html
├─ wuyi/
├─ chunjiang-huayueye/
├─ jiangjinjiu/
└─ jiangchengzi-yimao/
```

## 九、单篇课文文件夹内部建议

每篇课文建议先保持简单结构：

```text
qinyuanchun-changsha/
├─ index.html          # 本课首页或主课件
├─ page-01.html        # 如有多个课堂网页，可继续保留
├─ page-02.html
├─ assets/
│  ├─ images/
│  └─ css/
└─ README.md           # 可选，用于记录本课说明
```

如果一篇课文只有一个网页，只保留 `index.html` 即可。

## 十、首页链接示例

网站首页可以先采用最简单的静态目录：

```html
<h1>高二语文教学网站</h1>

<h2>第一单元</h2>
<ul>
  <li><a href="lessons/gaoer/textbook/unit-01/zhongguo-renmin-zhanqilaile/">中国人民站起来了</a></li>
  <li><a href="lessons/gaoer/textbook/unit-01/changzheng-shengli-wansui/">长征胜利万岁</a></li>
  <li><a href="lessons/gaoer/textbook/unit-01/dazhan-zhong-de-chaqu/">大战中的插曲</a></li>
  <li><a href="lessons/gaoer/textbook/unit-01/bie-le-buliediannia/">别了，“不列颠尼亚”</a></li>
  <li><a href="lessons/gaoer/textbook/unit-01/jiaoyulu/">县委书记的榜样——焦裕禄</a></li>
  <li><a href="lessons/gaoer/textbook/unit-01/2020-kangyi-ji/">在民族复兴的历史丰碑上——2020中国抗疫记</a></li>
</ul>
```

## 十一、作文教学栏目建议

建议路径：

```text
lessons/gaoer/writing/
```

作文教学不要只按日期堆放，建议按“能力点”或“任务类型”分类。这样以后高三复习时也能继续使用。

推荐结构：

```text
writing/
├─ index.html
├─ material-reading/          # 材料审读
├─ argument-building/         # 立意与论证
├─ structure-training/        # 结构训练
├─ language-polishing/        # 语言提升
├─ sample-analysis/           # 范文评析
├─ revision-workshop/         # 作文升格
└─ exam-writing/              # 考场作文训练
```

作文课单个文件夹可以这样命名：

```text
writing/argument-building/renwu-qudong-xiezuo/
writing/revision-workshop/zuowen-shengge-01/
writing/exam-writing/2026-09-yuekao-zuowen/
```

每节作文课建议至少保留：

- 课堂主页面
- 写作任务
- 评价量表
- 学生修改清单
- 可复制的 AI 辅助修改提示词

注意：作文栏目应明确提醒学生，AI 可以用于审题、提纲、修改建议和自查，但不能直接代写成文。

## 十二、试卷讲评栏目建议

建议路径：

```text
lessons/gaoer/exam-review/
```

试卷讲评建议按考试时间和类型分类，而不是只按“第几次讲评”命名。

推荐结构：

```text
exam-review/
├─ index.html
├─ monthly-exam/              # 月考讲评
├─ midterm/                   # 期中讲评
├─ final-exam/                # 期末讲评
├─ weekly-practice/           # 周练讲评
└─ special-paper/             # 专项试卷讲评
```

试卷讲评单个文件夹可以这样命名：

```text
exam-review/monthly-exam/2026-09-yuekao/
exam-review/midterm/2026-11-qizhong/
exam-review/weekly-practice/zhouce-03/
```

每次试卷讲评建议至少保留：

- 讲评主页面
- 试题分类
- 典型错误
- 解题思路
- 变式训练
- 课后订正任务

如果涉及真实学生答卷或成绩数据，不建议上传可识别个人信息的内容。需要展示学生答案时，应先匿名化处理。

## 十三、专题训练与 AI 工具预留

专题训练建议路径：

```text
lessons/gaoer/thematic-study/
```

可以预留以下方向：

```text
thematic-study/
├─ index.html
├─ classical-chinese/         # 文言文专题
├─ poetry-reading/            # 古诗鉴赏专题
├─ modern-reading/            # 现代文阅读专题
├─ language-use/              # 语言文字运用
└─ exam-strategy/             # 应试策略
```

AI 学习工具建议路径：

```text
lessons/gaoer/ai-tools/
```

可以预留以下方向：

```text
ai-tools/
├─ index.html
├─ reading-helper/            # 阅读辅助工具
├─ writing-checker/           # 作文自查工具
├─ classical-translator/      # 文言文辅助理解
└─ argument-map/              # 论证结构梳理
```

AI 工具页面要保留必要提醒：

- 不上传个人隐私。
- 不直接提交 AI 生成内容作为作业。
- AI 输出需要核验。
- 最终判断和修改必须由学生自己完成。

## 十四、给 Codex 的固定更新指令

以后新增或整理某一课时，可以直接使用下面的指令：

```text
请把这节高二语文课件加入静态教学网站：
1. 先判断它属于教材课文、作文教学、试卷讲评、专题训练还是 AI 工具。
2. 根据类型，放入 lessons/gaoer/ 对应目录。
2. 为课文建立英文或拼音文件夹，不使用中文路径。
3. 如果只有一个网页，命名为 index.html。
4. 如果有多个网页，保留原网页，并建立一个本课 index.html 作为入口。
5. 更新网站首页和单元目录页的链接。
6. 检查所有相对路径、图片、样式和跳转是否可用。
7. 不要引入数据库、登录系统或后台管理。
```

## 十五、后续建议

当前最稳妥的推进顺序：

1. 先建立高二总目录页。
2. 再建立“教材课文、作文教学、试卷讲评、专题训练、AI 学习工具”五个一级栏目。
3. 教材课文下建立四个单元目录页和古诗词诵读目录页。
4. 每完成一篇课文或一次作文课、试卷讲评，就放入对应文件夹。
5. 每次新增内容后，只更新首页和对应栏目页。
6. 等内容数量达到 30 篇以上，再考虑是否使用 `data.js` 或 `lessons.json` 管理目录。

不要一开始追求复杂功能。先让网站稳定上线、路径清楚、学生能顺利打开课件，比做复杂系统更重要。

---

## 十六、统一导航模板（维护规范）

为保持各页面顶部导航一致、避免栏目在部分页面被遗漏，所有页面统一使用以下 6 个导航项：

| 导航项 | 作用 |
| ---- | ---- |
| 首页 | 返回网站总入口 |
| 教材课文 | 高二课文总目录 |
| 作文教学 | 作文训练栏目 |
| 试卷讲评 | 试卷讲评栏目 |
| 专题训练 | 专题复习栏目 |
| AI 工具 | AI 学习工具栏目 |

不同层级页面的相对路径写法（以栏目链接为例）：

- 根层级（index.html、pages/*.html）：`gaoer/textbook/index.html` 等
- gaoer 层级（gaoer/index.html）：`textbook/index.html` 等
- gaoer/textbook 层级：`../../index.html` 回首页，`../writing/index.html` 等栏目，`index.html` 指教材课文自身
- gaoer/textbook/unit-xx 层级：`../../../index.html` 回首页，`../index.html` 回教材课文，`../../writing/index.html` 等栏目
- gaoer/writing、exam-review、ai-tools、thematic-study 层级：`../../index.html` 回首页，`../textbook/index.html` 等栏目，`index.html` 指当前栏目自身

新增或调整页面时，先按上表核对导航项是否齐全（尤其「专题训练」），再发布。

