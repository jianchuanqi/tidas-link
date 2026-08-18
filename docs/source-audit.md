# 来源核对

## 本地来源

| 来源 | 用途 |
| --- | --- |
| `/Users/jianchuan/Dev/tidas/static/schemas/` | LCA 字段含义和对象引用 |
| `/Users/jianchuan/Dev/data-exchange-protocol/spec/v3/` | PACT 字段、Schema、接口和事件要求 |
| WP03 供应链追溯研究工作区 | 多级结果组合和计算来源追溯需求 |

## 纳入判断

| 信息 | 处理 |
| --- | --- |
| LCI、LCIA 结果及 PCF Profile | 对应的 TIDAS-Link Schema |
| 实际采用的上游结果或背景数据 | `calculationInputs` |
| 完整过程、流、来源、单位、模型和 LCIA 方法数据 | TIDAS |
| PACT 载荷、接口和事件规则 | PACT Adapter |
| 请求、交付、授权、追溯问答、通知、存储和审计 | 研究机制或具体系统 |

PACT 字段分类记录在 `field-scope.json`，传输方法记录在
`method-scope.json`。Adapter 已通过四个 PACT 官方 ProductFootprint
样例的导入、导出和数值保持测试。
