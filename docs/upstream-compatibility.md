# TIDAS 上游兼容与 SSCM 影响评估

本流程只管理 TIDAS-Link 对只读 TIDAS 语义上游的采用。它不修改 TIDAS，
不把 TIDAS-Link 并入 SSCM Contracts，也不增加传输、身份、授权、存储或业务
流程能力。

## 固定基线

`compatibility-baseline.json` 中的 TIDAS 基线必须包含：

- 公共仓库地址和完整 40 位 commit；
- commit 时间、发布 Schema 根目录和文件数；
- 按文件名排序后计算的全量 Schema manifest SHA-256；
- 关键过程、流、来源、单位组和 LCIA 方法 Schema 的 SHA-256；
- 从上一固定点到新固定点的评估记录路径。

分支名、`main`、`latest`、日期或宽泛版本范围不能作为可接受基线。CI 必须检出
完整 commit，并验证 HEAD、manifest 和关键文件摘要。TIDAS-Link 不复制完整
TIDAS 数据集，只记录身份和兼容证据。

## 同步步骤

1. 在独立、只读用途的 TIDAS checkout 中取得上一固定 commit 和候选 commit。
2. 运行检测器，确认候选是上一固定点的后代，并记录提交、变更文件、Schema
   manifest、逐项 JSON Schema 差异和初步分类。
3. 人工评估 TIDAS-Link Schema、Binding、示例、校验器及 SSCM 消费方影响。
4. 对破坏性或不明确变化先完成迁移方案和必要的逐仓 Issue，不移动基线。
5. 同步获准后，同时更新基线、评估记录、CI 固定 commit 和适用测试。
6. 使用包含两个 commit 的 checkout 重放检测，并运行完整验证。

检测命令：

```bash
TIDAS_ROOT=/path/to/tidas npm run assess:tidas -- \
  --from <previous-commit> \
  --to <candidate-commit>
```

验证已记录评估：

```bash
TIDAS_ROOT=/path/to/tidas npm run assess:tidas -- \
  --verify-baseline docs/compatibility-baseline.json
```

## 差异分类

| 分类 | 含义 | 默认处理 |
| --- | --- | --- |
| `documentation-only` | 只改标题、说明或治理材料，不改可接受实例 | 记录后可同步 |
| `compatible-relaxation` | 移除约束，旧有效实例仍有效 | 验证引用语义后可同步 |
| `additive-compatible` | 增加可选属性或枚举选择，旧实例仍有效 | 检查 Binding 和示例是否需要展示 |
| `breaking` | 新增必填、收窄枚举/格式、删除已支持属性或 Schema | 必须迁移、版本化和提供消费者验证 |
| `manual-review` | 自动规则不能可靠判断 | 失败关闭，人工给出分类和证据前不得同步 |

自动分类是门禁输入，不代替语义判断。TIDAS 对象含义、单位、标识、修订规则
或数据所有权变化，即使 JSON 结构未变，也必须人工升级影响等级。

## TIDAS-Link 影响面

每份评估必须逐项给出 `unaffected`、`verification-only`、`change-required` 或
`blocked`：

| 影响面 | 必查内容 |
| --- | --- |
| Schema | `TidasObjectReference`、结果字段、`calculationInputs` 和引用约束 |
| Binding | PACT 字段映射、版本专有元数据和双向转换 |
| 示例 | 公开或合成引用是否仍有效，是否需要展示新增语义 |
| 校验器 | 引用类型、语义规则、manifest 和关键文件摘要 |

只有 manifest 更新而本地结构不变时，校验器为 `verification-only`；不能借同步
把完整 TIDAS Schema 或数据资源复制到 TIDAS-Link。

## SSCM 影响矩阵与分发

| SSCM 范围 | 何时受影响 | 所有权与处理 |
| --- | --- | --- |
| `tiangong-sscm-contracts` | 已确认的跨仓平台接口需要改变 | Contracts 只拥有共享连接契约；不得收录 TIDAS-Link Schema |
| Connector Plugin / Bundle | 明确消费 TIDAS-Link 的客户端映射或失败路径变化 | 在 Plugin 仓建立实现 Issue；TIDAS-Link 不因此成为 Plugin 或 Bundle |
| Exchange、EDL 等独立平台 | 平台选择的 TIDAS-Link 版本、存储解释或 API 需要改变 | 在实际平台仓建立 Issue；平台继续拥有传输、身份、授权、存储和流程 |
| Managed Profile | 已选 Bundle/Plugin/Contracts 的锁定或组合验收变化 | 在 Connector 仓验证实际 Profile；TIDAS-Link 没有固定 Profile |

两个及以上仓库需要变更或独立验收时，先在 Engineering OS 建跨仓父 Issue，
再逐仓分发。只读且无新证据责任的消费者不为凑数建 Issue。评估为无影响时，
只在 TIDAS-Link 记录证据，不修改其他仓库。

## 兼容、弃用和失败关闭

- 兼容变化仍需固定版本、重放检测，并运行 Schema、示例、Binding 和基线验证。
- 破坏性变化不得直接覆盖旧基线。先保留上一支持点，建立版本化迁移说明、
  正反例、消费者验证和弃用期限；删除旧支持前必须满足记录的退出条件。
- 候选 commit 不可访问、不是上一固定点的后代、Schema 无法解析、manifest 或
  文件摘要不一致、出现 `manual-review`、缺少数据/许可结论或任一必需验证失败时，
  都必须保持旧基线并返回非零状态。
- 检测器不访问密钥、受控端点或企业数据。评估记录只能包含公开上游差异、
  合成样例和脱敏验证结论。

当前同步证据记录在
[`compatibility-assessments/tidas-e26953d-to-073e182.json`](compatibility-assessments/tidas-e26953d-to-073e182.json)。
