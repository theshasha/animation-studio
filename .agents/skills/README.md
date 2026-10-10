# 项目技能

本目录安装了 5 个技能，供 OpenCode 按任务发现和加载。技能和配套资料保持英文原文；工作室约定见根目录 `AGENTS.md`。来源以 [来源记录](../SOURCES.md) 为准，安装、恢复和更新以 [维护指南](../../docs/setup-and-updates.md) 为准。

| 技能 | 来源 | 固定版本 |
| --- | --- | --- |
| `remotion-best-practices` | [remotion-dev/skills](https://github.com/remotion-dev/skills) 的 `skills/remotion-best-practices/` 完整目录 | 提交 `32b241b97f4e0e4ab61fe9a41b05e6e64503f8c5`；技能声明版本 `4.0.534` |
| `gsap-core` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) 的同名技能目录 | 提交 `aed9cfd3277740755f6bfc1155c7aa645403b760` |
| `gsap-timeline` | 同上 | 同上 |
| `gsap-react` | 同上 | 同上 |
| `writing-for-agents` | 原样复制自 `C:/project/openchamber/.agents/skills/writing-for-agents/SKILL.md`，保留文件内的作者署名 Matt Pocock | 本地文件快照 |

Remotion 总入口通过相对路径加载各领域参考，因此保留完整配套目录，其中地图等暂时用不到的资料不会默认加载。配套示例不属于本项目用户素材库。

GSAP 的 MIT 许可证原文随各技能保存。所选 Remotion 技能仓库快照没有根目录许可证文件，此处不另行推定其许可；`writing-for-agents` 保留本地来源与署名，不擅自添加许可证。

## 校验与更新

`upstream-lock.json` 记录下载文件的仓库、提交、路径和原始 SHA-256，用于核对远端文件是否保持原样。`writing-for-agents` 已与上述本地来源逐字节核对。

`sync-upstream.py` 是本次导入使用的固定版本下载脚本，只补缺失文件，不覆盖已有文件。它不负责升级，也不会自动安装库依赖或运行技能中的命令。

需要升级时先检查上游变动，再更新选定文件和来源记录。项目特有约定放在 `AGENTS.md` 或作品文档，避免直接改写上游技能。
