from pathlib import Path
from shutil import copy2

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(r"D:\VScode\yaspretty")
SOURCE = ROOT / "Yas_Pretty 视觉设计素材.docx"
BACKUP = ROOT / ".qa" / "Yas_Pretty 视觉设计素材.before-warm-rose-20261104.docx"
BRIGHT_BACKUP = ROOT / ".qa" / "Yas_Pretty 视觉设计素材.before-bright-warm-20261104.docx"
SECTION_TITLE = "暖玫瑰全局色彩基线"
DOCUMENT_VERSION = "1.3"
ROSE_ACCENT = "E48AA1"
BRAND_ROSE = "C95E7B"
ROSE_DEEP = "B84267"
INK = "4F363A"
LINE = "F3D7D5"

CORE_PALETTE = [
    ("珠光暖白", "#FFF9F5", "主背景色", "网页背景、品牌留白、主视觉底色"),
    ("蜜桃柔粉", "#FFE3E6", "核心辅助色", "柔和分区、选中背景和插画填色"),
    ("明亮玫瑰", "#E47A96", "品牌强调色", "Logo 局部、重点标签和装饰线条"),
    ("香槟珊瑚", "#F2AA9F", "暖色点缀", "高光、细节材质和少量动效粒子"),
    ("莓果墨色", "#4F363A", "文字主色", "正文、深色 Logo 和重要轮廓"),
]

CURRENT_WEBSITE_PALETTE = [
    ("Opening Blush", "#FFD8E4", "开幕背景主色、情绪层", "只用于品牌开幕，不扩散到产品信息背景"),
    ("Warm Paper", "#FFF9F5", "全站页面背景", "首页、产品库、品牌页保持稳定暖亮底色"),
    ("Surface", "#FFFEFC", "搜索框、详情内容面", "保持轻微对比，不使用玻璃拟态"),
    ("Yas Rose", "#D9577D", "开幕主标题 Yas", "保持明亮暖调，配合充分留白"),
    ("Rose Deep", "#B84267", "主要按钮、导航强调", "只用于主要动作和 active 状态"),
    ("Rose Accent", "#E48AA1", "下划线、边缘线、装饰", "低密度、小面积使用"),
    ("Warm Sage", "#6F9C82", "已记录、成功、正向状态", "不表示授权、核验或推荐必然适配"),
]

GLOBAL_PALETTE = [
    ("Warm Paper", "#FFF9F5", "全站页面底色", "大面积使用；保持明亮温暖，不偏黄或偏灰"),
    ("Surface", "#FFFEFC", "表单、详情、浮层", "与底色保持轻微层次，不做纯白强反差"),
    ("Opening Blush", "#FFD8E4", "品牌开幕主背景", "只用于开幕情绪层，不铺满信息页"),
    ("Yas Rose", "#D9577D", "开幕标题 Yas", "用于大字标；必须配粉白高光和充足留白"),
    ("Pretty Rose", "#EC7897", "开幕标题 Pretty", "作为同标题的亮部，不扩展为正文色"),
    ("Brand Rose", "#C95E7B", "页眉页脚 YasPretty 字标", "用于品牌识别，不用于大段正文"),
    ("Rose Accent", "#E48AA1", "标签、状态、局部强调", "小面积使用，不表示事实已核验或必然适配"),
    ("Rose Deep", "#B84267", "主要按钮和选中态", "仅用于明确动作；避免大面积深粉色背景"),
    ("Peach Surface", "#FFE8E2", "选中背景、柔和分区", "必须与边线或文字形成可识别层级"),
    ("Champagne Gold", "#F0C879", "3D 金属环、泵头、高光", "只做细节；不得变成大面积金色渐变"),
    ("Pearl Mirror", "#FFF3F5", "镜面、柔雾、珍珠亮面", "与粉白背景区分，避免冷灰镜面"),
    ("Ink", "#4F363A", "标题、重要正文", "替代纯黑，保持清晰对比"),
    ("Muted", "#8C696C", "说明、元信息", "不可用于小字号关键操作"),
    ("Line", "#F3D7D5", "分隔线、边框", "使用 1px 细线，不叠加厚阴影"),
]


def set_run_font(run, size=10.5, bold=False, color="000000", font="Microsoft YaHei"):
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)
    fonts = run._element.get_or_add_rPr().get_or_add_rFonts()
    fonts.set(qn("w:ascii"), font)
    fonts.set(qn("w:hAnsi"), font)
    fonts.set(qn("w:eastAsia"), font)


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_borders(cell, color="D9D9D9", size="6"):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        element = borders.find(qn(f"w:{edge}"))
        if element is None:
            element = OxmlElement(f"w:{edge}")
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def set_cell_margins(cell, top=110, start=110, bottom=110, end=110):
    tc_pr = cell._tc.get_or_add_tcPr()
    margins = tc_pr.first_child_found_in("w:tcMar")
    if margins is None:
        margins = OxmlElement("w:tcMar")
        tc_pr.append(margins)
    for name, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = margins.find(qn(f"w:{name}"))
        if node is None:
            node = OxmlElement(f"w:{name}")
            margins.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_cell_text(cell, text, size=9.2, bold=False, color=INK, align=None):
    paragraph = cell.paragraphs[0]
    paragraph.clear()
    paragraph.paragraph_format.space_after = Pt(0)
    paragraph.paragraph_format.line_spacing = 1.08
    if align is not None:
        paragraph.alignment = align
    run = paragraph.add_run(text)
    set_run_font(run, size=size, bold=bold, color=color)


def remove_paragraph_borders(paragraph):
    paragraph_properties = paragraph._p.get_or_add_pPr()
    borders = paragraph_properties.find(qn("w:pBdr"))
    if borders is not None:
        paragraph_properties.remove(borders)


def set_style_color(style, color):
    style.font.color.rgb = RGBColor.from_string(color)
    run_properties = style._element.get_or_add_rPr()
    color_node = run_properties.find(qn("w:color"))
    if color_node is None:
        color_node = OxmlElement("w:color")
        run_properties.append(color_node)
    color_node.attrib.pop(qn("w:themeColor"), None)
    color_node.attrib.pop(qn("w:themeTint"), None)
    color_node.attrib.pop(qn("w:themeShade"), None)
    color_node.set(qn("w:val"), color)


def remove_style_borders(style):
    paragraph_properties = style._element.get_or_add_pPr()
    borders = paragraph_properties.find(qn("w:pBdr"))
    if borders is not None:
        paragraph_properties.remove(borders)


def replace_paragraph(doc, old_text, new_text, color=None):
    for paragraph in doc.paragraphs:
        if paragraph.text != old_text:
            continue
        paragraph.clear()
        run = paragraph.add_run(new_text)
        if color:
            set_run_font(run, color=color)
        return True
    return False


def contrasting_text_color(hex_color):
    value = hex_color.removeprefix("#")
    red, green, blue = (int(value[index:index + 2], 16) for index in (0, 2, 4))
    luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255
    return "FFFFFF" if luminance < 0.55 else INK


def set_paragraph_bottom_border(paragraph, color=ROSE_ACCENT, size="10"):
    paragraph_properties = paragraph._p.get_or_add_pPr()
    borders = paragraph_properties.find(qn("w:pBdr"))
    if borders is None:
        borders = OxmlElement("w:pBdr")
        paragraph_properties.append(borders)
    bottom = borders.find(qn("w:bottom"))
    if bottom is None:
        bottom = OxmlElement("w:bottom")
        borders.append(bottom)
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), "4")
    bottom.set(qn("w:color"), color)


def normalize_document_version(doc):
    for paragraph in doc.paragraphs:
        for run in paragraph.runs:
            for old_version in ("版本 1.1", "版本 1.2"):
                if old_version in run.text:
                    run.text = run.text.replace(old_version, f"版本 {DOCUMENT_VERSION}")
            for old_version in ("Version 1.0", "Version 1.2"):
                if old_version in run.text:
                    run.text = run.text.replace(old_version, f"Version {DOCUMENT_VERSION}")

    for section in doc.sections:
        for paragraph in section.footer.paragraphs:
            for run in paragraph.runs:
                for old_version in ("Version 1.0", "Version 1.2"):
                    if old_version in run.text:
                        run.text = run.text.replace(old_version, f"Version {DOCUMENT_VERSION}")


def normalize_warm_rose_title(doc):
    for paragraph in doc.paragraphs:
        if SECTION_TITLE not in paragraph.text:
            continue
        paragraph.paragraph_format.page_break_before = True
        remove_paragraph_borders(paragraph)
        for run in paragraph.runs:
            set_run_font(run, size=22, bold=True, color=INK)


def update_table(
    table,
    rows,
    header_fill=ROSE_DEEP,
    swatch_column=None,
    swatch_value_column=1,
):
    if len(table.rows) != len(rows) + 1:
        raise ValueError(f"Unexpected table row count: {len(table.rows)}")

    for index, cell in enumerate(table.rows[0].cells):
        set_cell_shading(cell, header_fill)
        set_cell_borders(cell, color=LINE)
        set_cell_margins(cell)
        set_cell_text(
            cell,
            cell.text,
            size=9.2,
            bold=True,
            color="FFFFFF",
            align=WD_ALIGN_PARAGRAPH.CENTER if index < 3 else WD_ALIGN_PARAGRAPH.LEFT,
        )

    for row_index, values in enumerate(rows, start=1):
        cells = table.rows[row_index].cells
        for column_index, (cell, value) in enumerate(zip(cells, values)):
            set_cell_borders(cell, color=LINE)
            set_cell_margins(cell)
            fill = "FFFFFF" if row_index % 2 else "FFF8F6"
            if swatch_column is not None and column_index == swatch_column:
                fill = values[swatch_value_column].removeprefix("#")
            set_cell_shading(cell, fill)
            text_color = INK
            if swatch_column is not None and column_index == swatch_column:
                text_color = contrasting_text_color(values[swatch_value_column])
            set_cell_text(
                cell,
                value,
                size=8.9,
                bold=column_index == 0,
                color=text_color,
                align=WD_ALIGN_PARAGRAPH.CENTER if column_index < 2 else WD_ALIGN_PARAGRAPH.LEFT,
            )


def apply_bright_warm_palette(doc):
    replacements = {
        "低饱和艺术美妆  ·  极简时尚编辑风": "明亮暖粉艺术美妆  ·  极简时尚编辑风",
        "Yas Pretty 的视觉目标，是建立一个具有辨识度、艺术气质与现代感的美妆品牌形象。整体不走甜美少女风，也不采用过度装饰的传统轻奢路线，而是以低饱和色彩、清晰字体、真实美妆材质和原创手绘笔触，形成简洁、大气、耐看的品牌识别。": "Yas Pretty 的视觉目标，是建立一个具有辨识度、艺术气质与现代感的美妆品牌形象。整体不走甜美少女风，也不采用过度装饰的传统轻奢路线，而是以高明度暖粉、清晰字体、真实美妆材质和原创手绘笔触，形成明亮、大气、耐看的品牌识别。",
        "低饱和、留白、艺术感、真实质感、轻盈、时尚编辑风、克制的视觉记忆点。": "明亮暖粉、留白、艺术感、真实质感、轻盈、时尚编辑风、克制的视觉记忆点。",
        "新版配色降低粉色饱和度，以暖奶油白作为大面积底色，雾感裸粉和灰玫瑰作为品牌识别色，奶咖棕与深可可负责文字和线稿。整体避免荧光粉、亮金和强烈渐变。": "新版配色以高明度珠光暖白作为大面积底色，以蜜桃柔粉和明亮玫瑰建立品牌识别，香槟珊瑚提供暖光点缀，莓果墨色负责文字和关键结构。整体保持明亮、温暖和清晰，避免灰紫、浑浊米灰、荧光粉与紫蓝渐变。",
        "暖奶油白 60%  ·  雾感裸粉 20%  ·  灰玫瑰 10%  ·  奶咖棕 7%  ·  深可可 3%": "珠光暖白 65%  ·  蜜桃柔粉 20%  ·  明亮玫瑰 8%  ·  香槟珊瑚 4%  ·  莓果墨色 3%",
        "大面积页面优先使用暖奶油白，不建议整页铺满粉色。": "大面积页面优先使用珠光暖白，以蜜桃柔粉建立轻层次，不建议整页铺满粉色。",
        "灰玫瑰和裸粉用于局部强调，深可可保证文字清晰易读。": "明亮玫瑰用于品牌重点和主要动作，莓果墨色保证文字清晰易读。",
        "香槟金可作为极少量的特殊印刷或细节材质，不作为常规主色。": "香槟金和珊瑚杏色只用于高光、金属细节和少量粒子，不作为常规主色。",
        "避免高饱和玫红、紫粉渐变、镜面金属大面积效果和过多闪光。": "避免荧光玫红、灰紫粉、紫蓝渐变、镜面金属大面积效果和过多闪光。",
        "版本：深可可色版、暖白反白版；必要时增加灰玫瑰单色版。": "版本：莓果墨色版、暖白反白版；必要时增加明亮玫瑰单色版。",
        "手绘图案是 Yas Pretty 的重要品牌资产。建议第一轮制作 16 个独立元素，采用细线稿、轻微不规则笔触和局部淡色填充。线条颜色以深可可、奶咖棕、灰玫瑰为主，少量使用雾感裸粉填色。": "手绘图案是 Yas Pretty 的重要品牌资产。建议第一轮制作 16 个独立元素，采用细线稿、轻微不规则笔触和局部淡色填充。线条颜色以莓果墨色、明亮玫瑰和暖珊瑚为主，少量使用蜜桃柔粉填色。",
        "背景使用暖奶油白或极淡裸粉。": "背景使用珠光暖白或极淡蜜桃粉。",
        "YasPretty 的视觉中心是珠光藕粉、玫瑰灰棕和深度克制的衬线字体。质感来自留白、纸张般的低对比层次、细线和少量高光，而不是深色压迫、厚重渐变或装饰堆叠。开幕可以更有情绪，但进入站内页面后应回到资料库和编辑工作台的清晰秩序。": "YasPretty 的视觉中心是珠光暖白、蜜桃柔粉、明亮玫瑰和克制的衬线字体。质感来自留白、清透层次、细线、暖金属和少量高光，而不是灰紫压迫、厚重渐变或装饰堆叠。开幕可以更有情绪，但进入站内页面后仍应保持资料库和编辑工作台的清晰秩序。",
        "阶段一：珠光藕粉背景建立，散粉云和粉末点从中心下方缓慢上升。": "阶段一：明亮蜜桃粉背景建立，散粉云和粉末点从中心下方缓慢上升。",
    }
    for old_text, new_text in replacements.items():
        replace_paragraph(doc, old_text, new_text)

    set_style_color(doc.styles["Title"], INK)
    set_style_color(doc.styles["Heading 1"], INK)
    set_style_color(doc.styles["Heading 2"], BRAND_ROSE)
    remove_style_borders(doc.styles["Title"])
    for paragraph in doc.paragraphs:
        if paragraph.text == "01  品牌设计方向":
            paragraph.paragraph_format.page_break_before = True
        if paragraph.style.name == "Title":
            remove_paragraph_borders(paragraph)
        if paragraph.style.name in ("Title", "Heading 1", "Heading 2"):
            color = BRAND_ROSE if paragraph.style.name == "Heading 2" else INK
            for run in paragraph.runs:
                set_run_font(run, bold=True, color=color)

    update_table(doc.tables[0], CORE_PALETTE, swatch_column=1)
    update_table(doc.tables[2], CURRENT_WEBSITE_PALETTE)

    global_rows = []
    for token, value, usage, boundary in GLOBAL_PALETTE:
        global_rows.append(("", token, value, usage, boundary))
    update_table(
        doc.tables[4],
        global_rows,
        header_fill=INK,
        swatch_column=0,
        swatch_value_column=2,
    )


def add_heading(doc, text, level=1):
    paragraph = doc.add_paragraph(style=f"Heading {level}")
    paragraph.paragraph_format.space_before = Pt(14 if level == 1 else 10)
    paragraph.paragraph_format.space_after = Pt(6)
    paragraph.paragraph_format.keep_with_next = True
    run = paragraph.add_run(text)
    set_run_font(run, size=15 if level == 1 else 12, bold=True, color=INK)
    return paragraph


def add_body(doc, text, bold_lead=None):
    paragraph = doc.add_paragraph(style="Normal")
    paragraph.paragraph_format.space_after = Pt(7)
    paragraph.paragraph_format.line_spacing = 1.25
    if bold_lead and text.startswith(bold_lead):
        lead = paragraph.add_run(bold_lead)
        set_run_font(lead, bold=True)
        body = paragraph.add_run(text[len(bold_lead):])
        set_run_font(body)
    else:
        run = paragraph.add_run(text)
        set_run_font(run)
    return paragraph


def add_bullet(doc, text):
    paragraph = doc.add_paragraph(style="List Bullet")
    paragraph.paragraph_format.left_indent = Inches(0.25)
    paragraph.paragraph_format.space_after = Pt(4)
    paragraph.paragraph_format.line_spacing = 1.2
    run = paragraph.add_run(text)
    set_run_font(run, size=10)
    return paragraph


def add_palette_table(doc, rows):
    table = doc.add_table(rows=1, cols=5)
    table.style = "Table Grid"
    table.autofit = False
    widths = [0.58, 1.18, 0.92, 1.5, 2.48]
    headers = ["色块", "Token", "HEX", "主要用途", "使用边界"]
    for index, header in enumerate(headers):
        cell = table.rows[0].cells[index]
        cell.width = Inches(widths[index])
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        set_cell_shading(cell, "4A3738")
        set_cell_borders(cell)
        set_cell_margins(cell)
        paragraph = cell.paragraphs[0]
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER if index < 3 else WD_ALIGN_PARAGRAPH.LEFT
        paragraph.paragraph_format.space_after = Pt(0)
        run = paragraph.add_run(header)
        set_run_font(run, size=9.2, bold=True, color="FFFFFF")
    header_tr_pr = table.rows[0]._tr.get_or_add_trPr()
    repeat = OxmlElement("w:tblHeader")
    repeat.set(qn("w:val"), "true")
    header_tr_pr.append(repeat)

    for row_index, (token, value, usage, boundary) in enumerate(rows):
        cells = table.add_row().cells
        values = ["", token, value, usage, boundary]
        for index, text in enumerate(values):
            cell = cells[index]
            cell.width = Inches(widths[index])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_borders(cell)
            set_cell_margins(cell)
            if index == 0:
                set_cell_shading(cell, value.removeprefix("#"))
            elif row_index % 2 == 1:
                set_cell_shading(cell, "FFF8F6")
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER if index < 3 else WD_ALIGN_PARAGRAPH.LEFT
            paragraph.paragraph_format.space_after = Pt(0)
            paragraph.paragraph_format.line_spacing = 1.08
            if text:
                run = paragraph.add_run(text)
                set_run_font(run, size=8.8, bold=index == 1)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def main():
    BACKUP.parent.mkdir(parents=True, exist_ok=True)
    if not BACKUP.exists():
        copy2(SOURCE, BACKUP)
    if not BRIGHT_BACKUP.exists():
        copy2(SOURCE, BRIGHT_BACKUP)

    doc = Document(SOURCE)

    normalize_document_version(doc)
    if any(SECTION_TITLE in paragraph.text for paragraph in doc.paragraphs):
        normalize_warm_rose_title(doc)
        apply_bright_warm_palette(doc)
        doc.save(SOURCE)
        return

    doc.add_page_break()
    title = doc.add_paragraph(style="Title")
    title.paragraph_format.space_after = Pt(9)
    run = title.add_run(SECTION_TITLE)
    set_run_font(run, size=22, bold=True, color=INK)
    set_paragraph_bottom_border(title)

    add_body(doc, "记录日期：2026 年 11 月 4 日。该色彩基线来自当前网站已通过视觉复核的开幕标题、3D 花瓣妆台、页眉字标和全局页面色阶。后续页面、动效和素材应优先复用本节 Token；本节与旧色表冲突时，以本节为准，同时保留旧记录用于追溯。")

    add_heading(doc, "审美结论", 1)
    add_body(doc, "全局方向是明亮、温暖、粉嫩且克制。仙气来自珠光粉白背景、透明层、细小星芒、柔雾和香槟金高光；质感来自深浅层级、留白、细线和受控对比。不得用灰紫大色块、荧光粉或高饱和粉色铺满页面，也不得让装饰压过产品信息和决策流程。")

    add_heading(doc, "当前色彩 Token", 1)
    add_palette_table(doc, GLOBAL_PALETTE)

    add_heading(doc, "建议使用比例", 1)
    add_body(doc, "暖粉白和浅表面色约 65%，柔和粉色层约 20%，玫瑰强调色约 8%，香槟金约 4%，深色文字与结构线约 3%。比例用于控制页面整体观感，不要求逐像素计算。")

    add_heading(doc, "场景应用规则", 1)
    add_bullet(doc, "品牌开幕：Opening Blush 建立情绪，Yas Rose 与 Pretty Rose 形成同色系明暗差；星芒和闪粒使用粉白高光，不用大颗粒持续闪烁。")
    add_bullet(doc, "主站页面：Warm Paper 为底，Surface 承载可读内容，Rose Deep 只用于主要动作；页面不因追求粉色而牺牲文字对比。")
    add_bullet(doc, "3D 花瓣妆台：Canvas 透明叠加页面渐层；镜面使用 Pearl Mirror，金属细节使用 Champagne Gold，阴影采用低透明柔和接触阴影。")
    add_bullet(doc, "产品图片和产品事实：品牌色只能作为界面环境，不得改变真实产品图片色彩，也不得用综合色调暗示未核验的色号、质地或功效。")
    add_bullet(doc, "动效扩展：后续花瓣、薄雾、流光和粒子必须复用本节色阶，优先低密度、短时、高光点状表现，避免持续大范围闪动。")

    add_heading(doc, "禁止方式", 1)
    add_bullet(doc, "禁止使用大面积灰紫、冷灰粉或浑浊米灰，使页面显暗、显脏或削弱品牌温度。")
    add_bullet(doc, "禁止使用荧光粉、紫蓝粉渐变、彩虹金属光或过强发光描边。")
    add_bullet(doc, "禁止把所有组件改成同一种粉色；必须保留粉白、玫瑰、香槟金和深色文字之间的层级。")
    add_bullet(doc, "禁止用星星、花瓣和高光填满界面；装饰只服务品牌氛围，不遮挡任务入口、来源、限制和隐私说明。")

    apply_bright_warm_palette(doc)
    doc.save(SOURCE)


if __name__ == "__main__":
    main()
