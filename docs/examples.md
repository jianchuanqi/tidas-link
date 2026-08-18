# 示例

所有数值仅用于说明结构，不代表真实产品或核验结论。

| 文件 | 内容 |
| --- | --- |
| [`battery-cell-lci.json`](../examples/battery-cell-lci.json) | 电池单体生产的 LCI 输入和输出 |
| [`battery-cell-lcia.json`](../examples/battery-cell-lcia.json) | 气候变化、酸化和水资源使用结果 |
| [`battery-cell-pcf.json`](../examples/battery-cell-pcf.json) | 电池单体产品碳足迹（LCIA 下的 PCF Profile） |
| [`battery-pack-pcf.json`](../examples/battery-pack-pcf.json) | 包含供应商结果和背景数据输入的电池包 PCF Profile |

电池包示例中的 `calculationInputs` 展示：

1. 采用供应商提供的电池单体 PCF Profile；
2. 采用 TIDAS 背景电力过程；
3. 分别记录实际数量、换算说明和计算位置。
