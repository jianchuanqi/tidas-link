# Schema 套件

## 结构

| 文件 | 类型 | 作用 |
| --- | --- | --- |
| [`common.json`](../schemas/common.json) | 公共结构 | 供其他 Schema 引用 |
| [`calculation-input.json`](../schemas/calculation-input.json) | 计算组成 | 表示实际采用的上游结果或背景数据 |
| [`lca-result.json`](../schemas/lca-result.json) | 公共基础 | 规定 LCI 和 LCIA 共用字段 |
| [`lci-result.json`](../schemas/lci-result.json) | 专业结果 | 只允许生命周期清单流 |
| [`lcia-result.json`](../schemas/lcia-result.json) | 专业结果 | 要求生命周期影响评价结果 |
| [`pcf-profile.json`](../schemas/pcf-profile.json) | LCIA 专门表达 | 要求产品碳足迹主要气候变化结果 |

```text
LCA Result
├── LCI Result
└── LCIA Result
    └── PCF Profile
```

## 公共结果字段

`lca-result.json` 规定所有结果共有的：

- 结果身份和状态；
- 数据责任方和评价对象；
- 参考量、系统边界、时期和地域；
- 清单结果、环境影响结果和补充参数；
- 建模、质量、核验和限制；
- 计算输入。

`resultType` 只取 `lci` 或 `lcia`。PCF 是 LCIA 的专门表达，通过
`profile: "pcf"` 标明，并使用 `pcf-profile.json` 校验。

## 结果数值

| 数组 | 内容 |
| --- | --- |
| `inventoryResults` | LCI 输入或输出流 |
| `impactResults` | 影响类别、指标、数值、单位和评价方法 |
| `reportedParameters` | 碳含量、土地占用等补充参数 |

分开存放后，数组名称已经说明数值性质，不需要为每项重复增加类型字段。

## 计算输入

`calculationInputs` 是 LCA 结果的一部分。每项输入通过 `sourceResult`
引用供应商或其他上游结果，或者通过 `sourceDataset` 引用 TIDAS
背景数据。两种来源不能同时出现。
