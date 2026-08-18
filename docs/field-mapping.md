# 字段对应关系

```text
PACT 字段 <-> PACT Adapter <-> TIDAS-Link <-> TIDAS 含义
```

## LCA 结果

| LCA 信息 | TIDAS-Link 字段 |
| --- | --- |
| 结果类型和专门表达 | `resultType`、`profile` |
| 结果编号和修订 | `resultId`、`resultVersion`、`precedingResultIds` |
| 结果状态 | `resultStatus`、`validityPeriod` |
| 数据责任方 | `dataOwner` |
| 产品、材料、部件或批次 | `subject` |
| 声明单位、功能单位或参考流 | `referenceQuantity` |
| 生命周期范围 | `systemBoundary` |
| 数据时期和地域 | `referencePeriod`、`geography` |
| 标准、分配、截断和背景数据 | `modeling` |
| LCI 清单结果 | `inventoryResults[]` |
| LCIA 环境影响结果 | `impactResults[]` |
| 补充参数 | `reportedParameters[]` |
| 质量和不确定性 | `dataQuality`、各结果数组中的 `dataQuality` 和 `uncertainty` |
| 核验与限制 | `verification`、`limitations` |

## 计算输入

| 计算信息 | TIDAS-Link 字段 |
| --- | --- |
| 输入编号 | `calculationInputs[].inputId` |
| 上游结果 | `calculationInputs[].sourceResult` |
| 背景数据 | `calculationInputs[].sourceDataset` |
| 来源类型 | `calculationInputs[].sourceType` |
| 实际采用量 | `calculationInputs[].usedQuantity` |
| 数量或单位换算 | `calculationInputs[].conversionDescription` |
| 计算位置 | `calculationInputs[].calculationPosition` |

## PACT

PACT Adapter 将 ProductFootprint 和 CarbonFootprint 中具有 LCA 含义的
字段转换到 PCF Profile。PACT 专有的格式与创建信息保存在 Adapter 元数据中。

完整字段分类见
[`bindings/pact-v3.0.3/field-scope.json`](../bindings/pact-v3.0.3/field-scope.json)。

## TIDAS 引用

TIDAS-Link 通过对象类型、编号和对象修订引用 TIDAS 数据，不复制完整数据集。
