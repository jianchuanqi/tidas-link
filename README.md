# TIDAS-Link

TIDAS-Link 是面向供应链 LCA 结果交换与追溯的轻量 Schema 套件。它建立在
TIDAS 的 LCA 数据语义之上，用于企业之间交换 LCI、LCIA 结果及其实际采用的
上游计算来源。

## Schema 套件

| Schema | 用途 |
| --- | --- |
| [`common.json`](schemas/common.json) | 评价对象、参考量、边界、时期、质量、核验和 TIDAS 引用等公共结构 |
| [`calculation-input.json`](schemas/calculation-input.json) | 结果计算中实际采用的上游结果或背景数据 |
| [`lca-result.json`](schemas/lca-result.json) | LCI 和 LCIA 共用的结果结构 |
| [`lci-result.json`](schemas/lci-result.json) | 生命周期清单结果 |
| [`lcia-result.json`](schemas/lcia-result.json) | 生命周期影响评价结果 |
| [`pcf-profile.json`](schemas/pcf-profile.json) | 产品碳足迹对 LCIA 结果的专门要求 |

Schema 层级为：

```text
LCA Result
├── LCI Result
└── LCIA Result
    └── PCF Profile
```

`lca-result.json` 提供公共基础。交换 LCI 或 LCIA 时分别使用对应 Schema；
产品碳足迹使用 `pcf-profile.json`。

## LCA 结果结构

每个结果包括：

- 结果编号、修订、状态和数据责任方；
- 产品、材料、部件、批次、服务或场地产出；
- 参考量、系统边界、数据时期和地域；
- LCI 清单流、LCIA 环境影响结果和必要的补充参数；
- 建模规则、数据质量、不确定性、核验和限制；
- 计算中实际采用的上游结果或背景数据。

结果数值分为三个相互清楚的数组：

- `inventoryResults`：物质、能源等输入输出清单；
- `impactResults`：经过影响评价得到的环境影响结果；
- `reportedParameters`：碳含量、土地占用等补充参数。

`resultType` 只区分 `lci` 和 `lcia`。产品碳足迹属于 LCIA，通过
`profile: "pcf"` 表示。

## 计算输入

目标结果通过 `calculationInputs` 记录实际进入计算的来源。每项输入包括：

- 来源结果，或 TIDAS 背景数据引用；
- 来源类型；
- 实际采用数量；
- 数量或单位换算；
- 在目标计算中的位置。

目标就是包含该输入的 LCA 结果，因此不需要重复记录目标结果。沿
`calculationInputs` 可逐级查找上游来源，也可建立反向索引识别受上游变化
影响的下游结果。

## 与 TIDAS 和 PACT 的关系

```text
PACT 系统 <-> PACT Adapter <-> TIDAS-Link Schema 套件 <-> TIDAS
```

- TIDAS 管理完整的过程、流、来源、单位、模型和 LCIA 方法数据。
- TIDAS-Link 交换结果及其计算输入。
- PACT Adapter 在 PACT ProductFootprint 与 TIDAS-Link PCF Profile
  之间转换。

消息传输、身份认证、授权、分页、交付状态、存储和业务流程由协议 Binding
或具体系统处理。

## PACT Adapter

实现文件：

[`bindings/pact-v3.0.3/adapter.js`](bindings/pact-v3.0.3/adapter.js)

导入 PACT：

```bash
node bindings/pact-v3.0.3/adapter.js import \
  --input pact-product-footprint.json \
  --output tidas-link-pcf.json \
  --metadata pact-binding-metadata.json
```

导出 PACT：

```bash
node bindings/pact-v3.0.3/adapter.js export \
  --input tidas-link-pcf.json \
  --metadata pact-binding-metadata.json \
  --output pact-product-footprint.json
```

Adapter 元数据保留 PACT 专有的 `specVersion`、`created` 和扩展信息；
TIDAS-Link 结果只保留通用 LCA 含义。

## 示例

- [`battery-cell-lci.json`](examples/battery-cell-lci.json)
- [`battery-cell-lcia.json`](examples/battery-cell-lcia.json)
- [`battery-cell-pcf.json`](examples/battery-cell-pcf.json)
- [`battery-pack-pcf.json`](examples/battery-pack-pcf.json)

电池包示例同时展示供应商结果和背景过程两类计算输入。

## 校验

```bash
npm run validate
```

校验覆盖 Schema、示例、计算输入、PACT 官方样例双向转换，以及 TIDAS 和
PACT 外部基线。
