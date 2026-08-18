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

1. 记录新的 TIDAS 发布或提交；
2. 比较 TIDAS Schema 基线；
3. 检查 TIDAS-Link 公共结构和引用含义；
4. 更新受影响的对应关系、示例和测试。

当前核对基线记录在
[`compatibility-baseline.json`](compatibility-baseline.json)。
