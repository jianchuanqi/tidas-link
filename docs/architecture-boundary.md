# 架构边界

```text
PACT 系统 <-> PACT Adapter <-> TIDAS-Link Schema 套件 <-> TIDAS
```

| 层次 | 负责内容 |
| --- | --- |
| TIDAS | 完整 LCA 过程、流、来源、单位、模型和 LCIA 方法数据 |
| TIDAS-Link | LCI、LCIA 结果、PCF Profile 及其计算输入 |
| PACT Adapter | PACT ProductFootprint 与 TIDAS-Link PCF Profile 的字段转换 |
| 具体系统 | 请求、交付、授权、存储和业务流程 |

## TIDAS-Link 内部

- 公共 LCA 结构；
- LCI 和 LCIA 两类结果，以及 LCIA 下的 PCF Profile；
- 结果计算中实际采用的供应商结果或背景数据；
- 必要的 TIDAS 对象引用。

## 业务与系统机制

数据请求、发送、接收、授权、保密、逐级追溯问答、更新通知、分页、
错误处理、存储和审计由供应链机制、协议 Binding 或具体系统承担。

## PACT

PACT Adapter 负责 PCF 载荷转换。PACT 的接口、事件、认证、分页和错误要求
在 Binding 范围内处理，不改变 TIDAS-Link 的 LCA 数据结构。
