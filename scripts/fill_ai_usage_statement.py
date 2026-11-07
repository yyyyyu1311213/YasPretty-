from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.shared import Pt


SOURCE = Path(r"D:\xwechat_files\wxid_45i9cl66d2u722_af17\msg\file\2026-11\2026年第十四届全国大参赛团队数字媒体科技作品及创意竞赛人工智能工具使用情况说明(2).docx")
OUTPUT = Path(r"D:\VScode\yaspretty\docs\2026年第十四届全国大学生数字媒体科技作品及创意竞赛人工智能工具使用情况说明-修订版.docx")


def set_cell(cell, value, font_size=9):
    cell.text = str(value)
    for paragraph in cell.paragraphs:
        paragraph.paragraph_format.space_after = Pt(0)
        paragraph.paragraph_format.line_spacing = 1.05
        for run in paragraph.runs:
            run.font.size = Pt(font_size)


def set_row(table, row_index, values, font_size=9):
    row = table.rows[row_index]
    for cell, value in zip(row.cells, values):
        set_cell(cell, value, font_size)


def ensure_rows(table, count):
    while len(table.rows) < count:
        new_row = table.add_row()
        source_row = table.rows[1]._tr if len(table.rows) > 1 else None
        if source_row is not None:
            new_row._tr.get_or_add_trPr()


def main():
    document = Document(SOURCE)

    # Basic information table.
    basic = document.tables[0]
    set_row(basic, 1, ["作品名称", "YasPretty 小Y——个性化智能选妆与妆容推荐平台"])
    set_row(basic, 2, ["作品编号（如有）", "待报名系统生成"])
    set_row(basic, 3, ["参赛赛道／赛项", "智慧生活与沉浸式新消费／超级个体（OPC）专项赛"])
    set_row(basic, 4, ["AI使用情况", "☑ 已使用　□ 未使用"])

    # Main tools table.
    tools = document.tables[1]
    tool_rows = [
        ["OpenAI Codex", "产品开发、组件适配、测试与文档整理、视觉资产代码化导出", "协助代码编写、组件适配、测试整理、文档整理及部分 SVG/栅格资产导出", "学生确定产品定位、架构、数据规则和视觉方向；人工筛选、修改、联调、测试并决定最终是否采用"],
        ["DeepSeek", "产品思路沟通、需求拆解与提示词设计", "辅助梳理用户问题、功能流程、推荐边界和提示词结构，提供迭代建议", "学生判断建议是否符合项目目标、竞赛规则和技术边界，并改写为实际方案；未直接把对话输出当作最终成果"],
        ["Lovart", "视觉素材生成与方案探索", "根据项目视觉方向生成部分页面/演示素材图片的候选版本", "学生筛选、裁切、调整和整合；逐项核对来源、平台条款、输入素材权限及最终提交位置"],
    ]
    for index, values in enumerate(tool_rows, start=1):
        set_row(tools, index, values, 8.5)

    # Representative AI-use process table.
    process = document.tables[2]
    process_values = [
        ["使用环节及目的", "开发辅助、产品思路沟通与提示词设计、视觉素材生成三个环节；目的是提高方案整理、开发迭代和视觉探索效率"],
        ["主要工具／模型", "OpenAI Codex、DeepSeek、Lovart；运行时方案还接入智谱 GLM 与 web-search-pro（仅由服务端按需调用）"],
        ["主要输入或素材来源", "项目需求、竞赛规则、React/Fastify 代码、数据 schema、界面与视觉规范、人工核验产品资料，以及具有明确用途的参考素材；不输入真实密钥、用户照片或未授权个人信息"],
        ["AI主要输出", "DeepSeek 输出需求拆解、功能流程、提示词结构和迭代建议；Codex 输出代码/组件/测试/文档辅助建议及部分 SVG/栅格导出方案；Lovart 输出部分页面或演示视觉素材候选版本"],
        ["学生筛选、修改或再创作", "学生负责产品判断、架构设计、数据核验、代码修改、视觉筛选/裁切/调整、系统联调、测试、来源与授权核查，并决定哪些内容进入最终提交版本"],
        ["最终成果中的应用位置", "React 主站、Fastify 网关、结构化妆容方案、提示词/技术文档，以及最终冻结版本中实际保留的页面或演示视觉素材；未保留的 AI 输出仅作为探索稿"],
        ["可核验材料（如有）", "脱敏后的提示词、对话或版本对比记录、代码提交记录、测试结果、asset-manifest.json、图片版本及来源/授权台账；按实际留存情况归档"],
    ]
    for index, values in enumerate(process_values, start=1):
        set_row(process, index, values, 8.5)

    # Final-result AI content table.
    final_content = document.tables[3]
    final_values = [
        ["程序代码与技术文档", "Codex 提供代码、组件、测试和文档辅助；DeepSeek 提供需求拆解、结构沟通和提示词迭代建议，直接对话文本未原样保留", "学生完成需求判断、架构设计、代码修改、数据核验、测试和最终整合", "首页与产品资料库（src/App.jsx）、小Y助手与妆容工作台（src/components/XiaoYAssistant.jsx、MakeupWorkbench.jsx）、Fastify 网关与服务（server/app.cjs、server/services/）、推荐规则、schema、测试文件和参赛说明"],
        ["视觉素材图片", "Lovart 生成部分页面或展示视觉素材的候选图片版本", "学生筛选、裁切、调整并核对平台条款、输入素材权限、来源记录和公开使用边界", "首页 Hero/品牌开幕及作品评审或展示材料中最终冻结并实际保留的视觉素材图片；未保留的生成版本不作为最终成果"],
        ["运行时 AI 推荐内容", "智谱 GLM 可在服务端辅助生成小Y回答和结构化妆容方案；web-search-pro 提供按需检索结果", "服务端执行硬条件、schema、产品 ID、来源和降级校验；学生确定推荐规则与最终产品边界", "主站小Y助手回答区和妆容工作台生成结果区；未配置 Key 时展示本地规则降级，真实模型链路按最终验收状态填写"],
    ]
    ensure_rows(final_content, len(final_values) + 1)
    for index, values in enumerate(final_values, start=1):
        set_row(final_content, index, values, 8.5)

    # Original contribution paragraphs.
    paragraphs = document.paragraphs
    paragraphs[26].text = "学生自主完成产品选题、用户需求分析、产品定位、核心流程、界面与交互设计、产品数据清洗与核验、推荐规则、API 网关、结构化妆容方案、隐私边界、测试和参赛材料整理。"
    paragraphs[27].text = "学生负责对 Codex、DeepSeek 和 Lovart 的输出进行筛选、改写、人工制作或修改、系统集成、运行验证和最终取舍；AI 工具不替代学生对产品事实、功能状态、来源和合规边界的判断。"
    paragraphs[29].text = "DeepSeek 用于思路沟通和提示词迭代，Codex 用于开发与文档辅助，Lovart 用于部分视觉素材生成。三者的输出均不自动进入最终成果，必须经过学生人工审核、修改、测试和来源/授权检查。"
    paragraphs[30].text = "对于图片素材，最终提交仅保留来源、授权状态和使用范围能够说明清楚的内容；权属或授权范围不明确的素材标记待核验、替换或不公开使用。"

    # Third-party resource table. Replace example rows with the actual resources.
    resources = document.tables[4]
    resource_values = [
        ["OpenAI Codex（AI开发辅助）", "OpenAI Codex 服务；平台条款以实际使用版本为准", "程序开发、组件适配、测试/文档整理和部分视觉资产代码化导出", "按服务条款使用；学生人工修改、联调、测试并保留开发记录，不将 Codex 直接成果表述为学生独立原创"],
        ["DeepSeek（AI沟通与提示词）", "DeepSeek 服务平台；平台条款以实际使用版本为准", "需求拆解、产品思路沟通、提示词设计和方案迭代", "按平台服务条款使用；输入内容应脱敏，不提交真实密钥、用户照片、完整个人信息或未公开敏感数据；输出经人工审核"],
        ["Lovart（AI生成图片素材）", "Lovart 服务平台；具体模型、生成记录和平台条款按实际使用版本留档", "生成部分页面/演示视觉素材候选图片", "仅在平台条款允许且输入素材具有合法使用依据时使用；逐项记录生成时间、素材用途、是否保留和公开授权状态，权属不明确时待核验或替换"],
        ["智谱 GLM 与 web-search-pro（运行时AI服务）", "智谱开放平台及其服务条款", "服务端小Y对话、结构化妆容方案和按需联网检索", "服务端密钥管理；模型输出经过规则、schema、产品 ID 和来源校验；未把第三方模型表述为自主研发"],
        ["React、Vite、Fastify、Zod、Three.js、React Three Fiber、Drei、GSAP、Framer Motion、OGL 等开源代码/插件", "各项目官方仓库及随依赖安装的许可证文件", "前端、构建、API 网关、数据校验、3D 化妆桌和动效", "按各项目许可证使用并随提交包保留许可证与来源说明；具体版本以 package-lock.json 为准"],
        ["产品图片及核验资料（图片素材）", "品牌官网、零售商/媒体页面、淘宝人工核验表及项目核验档案", "产品详情封面、规格/商品事实核验和购买入口说明", "逐张记录来源页面、权利人、采集日期和授权状态；当前图片授权状态仍需按产品档案披露“来源已披露、授权待核验”，不得写成已授权或学生原创"],
    ]
    ensure_rows(resources, len(resource_values) + 1)
    for index, values in enumerate(resource_values, start=1):
        set_row(resources, index, values, 8.2)

    # Keep the title and template framing, but make the filled copy identifiable.
    for paragraph in document.paragraphs:
        if paragraph.text.strip() == "（参赛团队参考模板）":
            paragraph.text = "（参赛团队填写稿）"
            break

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    main()
