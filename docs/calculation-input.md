# 计算输入

`calculationInputs` 记录形成当前 LCA 结果时实际采用的来源。

## 两类来源

| 来源 | 字段 | 典型用途 |
| --- | --- | --- |
| 上游结果 | `sourceResult` | 供应商特定 LCI、LCIA 或 PCF Profile |
| 背景数据 | `sourceDataset` | 数据库过程、流或其他 TIDAS 对象 |

每项输入只能选择一种来源。

## 主要字段

| 字段 | 含义 |
| --- | --- |
| `inputId` | 当前结果内的输入编号 |
| `sourceType` | 供应商特定、供应商平均、替代或背景来源 |
| `usedQuantity` | 实际进入计算的数量和单位 |
| `conversionDescription` | 数量或单位换算 |
| `calculationPosition` | 在当前 LCA 模型中的位置 |
| `limitations` | 必要的限制说明 |

当前 LCA 结果就是这些输入的目标。沿上游结果引用可以逐级还原供应链计算
来源；对来源引用建立反向索引，可以识别上游变化影响的下游结果。
