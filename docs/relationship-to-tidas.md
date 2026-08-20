# 与 TIDAS 的关系

| 层次 | 负责内容 |
| --- | --- |
| TIDAS | 完整 LCA 数据及其字段含义 |
| TIDAS-Link | LCA 结果及其计算输入 |
| 协议 Binding | 外部协议转换 |
| 具体系统 | 传输、授权、存储和流程 |

TIDAS-Link 使用 TIDAS 的过程、流、来源、单位和 LCIA 方法语义。引用这些
对象时，TIDAS-Link 携带对象类型、编号和必要的对象修订；完整数据仍由
TIDAS 管理。

## TIDAS 更新处理

1. 以完整 commit 固定候选和既有基线；
2. 比较全部发布 Schema、文件清单和 manifest 摘要；
3. 分类破坏性、增量兼容、兼容放宽、仅文档和需要人工判断的差异；
4. 分别检查 TIDAS-Link Schema、Binding、示例和校验器；
5. 评估 Contracts、Connector Plugin、平台和 Managed Profile 的 SSCM 影响；
6. 提交评估记录并通过固定上游验证后，才更新兼容基线。

当前核对基线记录在
[`compatibility-baseline.json`](compatibility-baseline.json)。
完整流程和失败关闭规则见
[`upstream-compatibility.md`](upstream-compatibility.md)。
