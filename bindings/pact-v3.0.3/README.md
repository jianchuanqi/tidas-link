# PACT Adapter

PACT Adapter 在 PACT ProductFootprint 与 TIDAS-Link PCF Profile 之间进行双向
转换。

## 文件

| 文件 | 作用 |
| --- | --- |
| [`adapter.js`](adapter.js) | ProductFootprint 导入和导出 |
| [`field-scope.json`](field-scope.json) | PACT 字段分类与对应关系 |
| [`method-scope.json`](method-scope.json) | PACT 接口和事件要求 |

## 导入

```bash
node bindings/pact-v3.0.3/adapter.js import \
  --input pact-product-footprint.json \
  --output tidas-link-pcf.json \
  --metadata pact-binding-metadata.json
```

导入结果通过 `pcf-profile.json` 校验。Adapter 元数据保存 PACT 专有的
`specVersion`、`created` 和扩展。

## 导出

```bash
node bindings/pact-v3.0.3/adapter.js export \
  --input tidas-link-pcf.json \
  --metadata pact-binding-metadata.json \
  --output pact-product-footprint.json
```

导出前先校验 TIDAS-Link PCF Profile，导出后再校验 PACT ProductFootprint。

## 当前覆盖

- ProductFootprint 和 CarbonFootprint 字段转换；
- PCF、温室气体分项、碳含量和土地占用等数值转换；
- 标准、产品规则、数据质量、背景数据来源和核验信息；
- PACT 专有元数据与 TIDAS-Link LCA 信息分离；
- 四个 PACT 官方样例的导入、导出和数值保持测试。

PACT REST、OAuth2、CloudEvents、分页和错误处理要求已经完成范围梳理，
由具体 Binding 服务或业务系统实现。
