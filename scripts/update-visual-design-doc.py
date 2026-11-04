from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(r"D:\VScode\yaspretty")
SOURCE = ROOT / "Yas_Pretty 视觉设计素材.docx"
BACKUP = ROOT / ".qa" / "Yas_Pretty 视觉设计素材.before-ui-unification.docx"


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_borders(cell, color="D9D9D9", size="6"):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = "w:" + edge
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def style_run(run, size=10.5, bold=False, color="000000", font="Aptos"):
    run.font.name = font
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), font)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), font)
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)


def add_body(doc, text, bold_lead=None):
    paragraph = doc.add_paragraph(style="Normal")
    paragraph.paragraph_format.space_after = Pt(7)
    paragraph.paragraph_format.line_spacing = 1.25
    if bold_lead and text.startswith(bold_lead):
        lead = paragraph.add_run(bold_lead)
        style_run(lead, bold=True)
        tail = paragraph.add_run(text[len(bold_lead):])
        style_run(tail)
    else:
        run = paragraph.add_run(text)
        style_run(run)
    return paragraph


def add_bullet(doc, text):
    paragraph = doc.add_paragraph(style="List Bullet")
    paragraph.paragraph_format.space_after = Pt(4)
    paragraph.paragraph_format.left_indent = Inches(0.25)
    paragraph.paragraph_format.line_spacing = 1.2
    run = paragraph.add_run(text)
    style_run(run, size=10)
    return paragraph


def add_heading(doc, text, level=1):
    paragraph = doc.add_paragraph(style=f"Heading {level}")
    paragraph.paragraph_format.space_before = Pt(14 if level == 1 else 9)
    paragraph.paragraph_format.space_after = Pt(6)
    run = paragraph.add_run(text)
    style_run(run, size=15 if level == 1 else 12, bold=True)
    return paragraph


def add_table(doc, headers, rows, widths):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.autofit = False
    for index, header in enumerate(headers):
        cell = table.rows[0].cells[index]
        cell.width = Inches(widths[index])
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        set_cell_shading(cell, "6F4D55")
        set_cell_borders(cell)
        paragraph = cell.paragraphs[0]
        paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
        paragraph.paragraph_format.space_after = Pt(0)
        run = paragraph.add_run(header)
        style_run(run, size=9.5, bold=True, color="FFFFFF")
    for row_index, values in enumerate(rows):
        cells = table.add_row().cells
        for index, value in enumerate(values):
            cell = cells[index]
            cell.width = Inches(widths[index])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_borders(cell)
            if row_index % 2 == 1:
                set_cell_shading(cell, "F8F1F3")
            paragraph = cell.paragraphs[0]
            paragraph.paragraph_format.space_after = Pt(0)
            paragraph.paragraph_format.line_spacing = 1.1
            run = paragraph.add_run(str(value))
            style_run(run, size=9.2)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return table


def main():
    BACKUP.parent.mkdir(parents=True, exist_ok=True)
    if not BACKUP.exists():
        BACKUP.write_bytes(SOURCE.read_bytes())
    doc = Document(SOURCE)

    for paragraph in doc.paragraphs:
        if "版本 1.0" in paragraph.text:
            for run in paragraph.runs:
                run.text = run.text.replace("版本 1.0", "版本 1.1")
            break

    doc.add_page_break()
    title = doc.add_paragraph(style="Title")
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = title.add_run("Current Website Visual System")
    style_run(run, size=22, bold=True)

    add_body(doc, "本节将当前网站已经落地的开幕效果、颜色、字体、素材搭配和动效节奏统一记录为可执行规范。首页、产品库、产品详情、品牌文化页和小Y界面应以本节为共同视觉基线；历史素材仍保留来源和授权状态，不因视觉统一而被改写。")

    add_heading(doc, "视觉结论", 1)
    add_body(doc, "YasPretty 的视觉中心是珠光藕粉、玫瑰灰棕和深度克制的衬线字体。质感来自留白、纸张般的低对比层次、细线和少量高光，而不是深色压迫、厚重渐变或装饰堆叠。开幕可以更有情绪，但进入站内页面后应回到资料库和编辑工作台的清晰秩序。")

    add_heading(doc, "统一颜色", 1)
    add_table(doc, ["Token", "值", "使用位置", "限制"], [
        ("Pearl Pink", "#E9C8CE", "开幕背景主色、情绪层", "只用于品牌开幕，不扩散到产品信息背景"),
        ("Warm Paper", "#FBF2E9", "全站页面背景", "首页、产品库、品牌页保持稳定底色"),
        ("Surface", "#FFFDF A".replace(" ", ""), "搜索框、详情内容面", "保持轻微对比，不使用玻璃拟态"),
        ("Rose Gray", "rgba(103,70,83,.78)", "开幕主标题", "保留透明度，避免纯黑和压抑"),
        ("Rose Deep", "#5B3635", "主要按钮、导航强调", "只用于主要动作和 active 状态"),
        ("Dusty Rose", "#D6B9B7", "下划线、边缘线、装饰", "低密度使用"),
        ("Sage", "#758D82", "已记录、成功、正向状态", "不表示授权、核验或推荐必然适配"),
    ], [1.15, 1.25, 2.05, 2.1])

    add_heading(doc, "字体与层级", 1)
    add_table(doc, ["层级", "字体", "规则"], [
        ("开幕主标题", "Bodoni 72 / Didot / Bodoni MT / Times New Roman", "大字号、高对比衬线；颜色半透明玫瑰灰棕；只在开幕使用"),
        ("中文标题", "Noto Serif SC / Songti SC / serif", "页面标题和长句标题，保持编辑式节奏"),
        ("正文与控件", "Noto Sans SC / Microsoft YaHei / sans-serif", "信息清晰、行距舒展，不使用装饰字体"),
        ("标签与元信息", "DM Mono", "小字号、字距明确，用于状态、编号和来源"),
        ("开幕副标", "Segoe Script / Snell Roundhand / Brush Script MT / cursive", "You are so pretty；只做情绪副标，不承担信息说明"),
    ], [1.35, 2.6, 2.6])

    add_heading(doc, "开幕动效与素材编排", 1)
    add_bullet(doc, "阶段一：珠光藕粉背景建立，散粉云和粉末点从中心下方缓慢上升。")
    add_bullet(doc, "阶段二：少量花瓣、sparkle 和 glint 围绕字标出现，保持中心聚焦，不铺满四角。")
    add_bullet(doc, "阶段三：Yas Pretty 主标题浮现，You are so pretty 作为艺术字副标随后出现。")
    add_bullet(doc, "阶段四：开幕结束前只让 Pretty 单词闪亮一次，闪光约 560ms，随后消失，不循环闪烁。")
    add_bullet(doc, "总时长约 3000ms；跳过按钮至少 72 x 44px；减少动效偏好只保留不超过 120ms 的淡入。")

    add_heading(doc, "全站统一规则", 1)
    add_bullet(doc, "Header 和 Footer 统一使用 public/assets/logo/yaspretty-wordmark-dark.svg；不再以纯文字或旧 JPG 作为替代 logo。")
    add_bullet(doc, "Hero 不重复放大 wordmark，使用 YASPRETTY / BEAUTY DECISION LIBRARY 信息行，让主标题承担页面任务。")
    add_bullet(doc, "CultureView 使用 yaspretty-monogram.svg 和文字信息块，不再引用 /brand/ 旧 JPG。")
    add_bullet(doc, "产品库、详情和收藏页使用暖纸色、细线、稳定图片比例；彩色只承担状态和少量编辑强调。")
    add_bullet(doc, "所有图片和裁切素材继续显示来源、授权待核验和删除联系入口；参考图裁切散粉云、粒子点仅在授权状态明确前作为预览素材。")

    add_heading(doc, "验收与边界", 1)
    add_body(doc, "本规范是当前 UI-A/UI-B 视觉统一基线，不代表阶段 5 已完成。后续页面调整应先复用本节 token 和素材角色，再新增视觉元素。新增字体、图片或第三方素材前，必须记录来源、许可证或授权待核验状态，并完成桌面与 360px 视口检查。")

    doc.save(SOURCE)


if __name__ == "__main__":
    main()
