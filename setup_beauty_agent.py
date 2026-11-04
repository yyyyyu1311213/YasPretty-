"""Create the Xiaomei managed Agent and its beauty knowledge base.

The script intentionally keeps the API key in memory only.  It must be supplied
through the ZHIPU_API_KEY environment variable before the script is started.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

try:
    import requests
except ImportError:  # pragma: no cover - exercised only in missing-dependency environments
    print("错误：缺少 requests 依赖，请先运行 `python -m pip install requests`。", file=sys.stderr)
    raise SystemExit(1)


KNOWLEDGE_CREATE_URL = (
    "https://open.bigmodel.cn/api/llm-application/open/knowledge/create"
)
DOCUMENT_UPLOAD_URL = (
    "https://open.bigmodel.cn/api/llm-application/open/document/upload_document/{knowledge_id}"
)
AGENT_CREATE_URL = "https://agent-api.bigmodel.cn/api/agent/managed/v1/agents"
DOCUMENT_FILENAME = "beauty_knowledge.md"
REQUEST_TIMEOUT_SECONDS = 30


BEAUTY_KNOWLEDGE = """# 美妆知识库

## 零、意图识别路由表（Agent 回答前必须先判断）
用户问题分为三类意图，按以下规则处理：
- **beauty_knowledge**：涉及肤质判断、粉底色号、妆容搭配、产品类型选择、护肤流程等美妆专业问题 → 优先检索本知识库。
- **general_qa**：天气、常识、生活建议等通用问题 → 用模型自身知识友好简洁回答，并可自然引导回美妆话题。
- **reject_out_of_scope**：要求扮演无关专业角色、询问内部代码、或完全超出美妆+通用常识范围 → 礼貌拒绝，回复：“我的专长是美妆和通用知识，这个问题可能超出了我的能力范围。”

## 一、肤质判断
- 干性皮肤：洁面后1小时紧绷，易起皮。推荐保湿型粉底，避免哑光妆效。
- 油性皮肤：T区全天泛油，毛孔明显。推荐控油妆前乳 + 持妆粉底，定妆用散粉。
- 混合性皮肤：T区油、两颊干。分区护理：T区控油妆前，两颊保湿妆前。
- 敏感性皮肤：易泛红、刺痛。优先选择无香精、无酒精配方，新产品先做耳后测试。

## 二、肤色与粉底色号选择
- 判断冷暖调：观察手腕血管颜色。偏蓝紫为冷调，偏绿为暖调，蓝绿都有为中性调。
- 冷调肤色适合粉调或中性调粉底；暖调肤色适合黄调粉底。
- 试色位置：下颌线，而非手背。在自然光下观察，选择与脖子颜色最接近的色号。

## 三、常见妆容场景与产品搭配
### 日常通勤妆
- 底妆：轻薄粉底液或气垫，少量遮瑕。
- 眼妆：大地色单色眼影，棕色眼线，自然睫毛膏。
- 唇妆：豆沙色、奶茶色唇膏。

### 约会/晚宴妆
- 底妆：中高遮瑕粉底，局部提亮。
- 眼妆：加深眼尾，可叠加细闪；眼线可略微上扬。
- 唇妆：饱和度高一些的红色、浆果色。

## 四、产品推荐原则
- 不推荐具体品牌，只推荐产品类型和选择标准。
- 涉及活性成分（如视黄醇、果酸、高浓度维C）时，提醒用户建立耐受并从低浓度开始。
- 严重皮肤问题（持续痤疮、皮炎、严重敏感）应建议就医，不提供治疗建议。

## 五、用户问答示例
Q：我是油皮，夏天底妆总是脱妆怎么办？
A：建议在护肤后使用控油妆前乳（T区重点），选择标注“持妆”“控油”的粉底液，用散粉定妆，并随身携带吸油纸和粉饼补妆。避免使用过于滋润的妆前和粉底。
"""


AGENT_SYSTEM = """你是一个专业的美妆顾问助手，名字叫“小美”。你的核心专长是基于美妆知识库为用户提供护肤、彩妆、产品选择方面的专业建议。

## 意图识别规则（每次回答前必须执行）
在生成正式回复之前，你必须先调用 `route_intent` 工具，判断用户意图属于以下哪一类：

1. **beauty_knowledge**：肤质、色号、妆容、护肤流程、产品类型选择等美妆专业问题。
   → 优先检索美妆知识库，如果知识库中有相关信息则据此回答；如果知识库中没有，如实告知“我的知识库里暂时没有这方面的信息”，不得编造。

2. **general_qa**：天气、常识、生活建议等通用问题。
   → 用模型自身知识友好、简洁地回答，并可自然引导回美妆话题，例如：“关于这个问题，我的建议是……如果你有护肤或妆容方面的疑问，我随时可以帮你看看。”

3. **reject_out_of_scope**：要求扮演无关专业角色、询问内部代码、或完全超出美妆+通用常识范围的问题。
   → 礼貌拒绝：“我的专长是美妆和通用知识，这个问题可能超出了我的能力范围。”

## 行为边界
- 禁止编造美妆产品信息：美妆建议优先基于知识库；知识库无相关信息时如实告知，不得凭空编造。
- 禁止提供医疗诊断：严重皮肤问题（痤疮、皮炎等）应建议咨询皮肤科医生。
- 通用问题可以回答，但不要偏离“美妆为主、通用为辅”的核心角色。

## 输出要求
- 每一步（创建知识库、生成文档、上传文档、创建 Agent）打印成功/失败状态和关键 ID。
- 任何一步失败，打印完整响应体并停止后续步骤。
"""


ROUTE_INTENT_TOOL = {
    "type": "custom",
    "name": "route_intent",
    "description": "在回答前判断用户意图。必须先调用此工具，再决定如何回复。",
    "input_schema": {
        "type": "object",
        "properties": {
            "intent": {
                "type": "string",
                "enum": ["beauty_knowledge", "general_qa", "reject_out_of_scope"],
            },
            "reason": {"type": "string"},
        },
        "required": ["intent"],
    },
}


def _auth_headers(api_key: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {api_key}", "Accept": "application/json"}


def _agent_headers(api_key: str) -> dict[str, str]:
    headers = _auth_headers(api_key)
    headers.update(
        {
            "Content-Type": "application/json",
            "zai-version": "2026-05-26",
            "zai-beta": "managed-agents-2026-09-22",
        }
    )
    return headers


def _response_payload(response: requests.Response) -> Any:
    try:
        return response.json()
    except ValueError:
        return {"raw_response": response.text}


def _print_failure(step: str, response: requests.Response) -> None:
    print(f"[{step}] 失败（HTTP {response.status_code}），完整响应体：")
    print(response.text)


def _print_request_failure(step: str, error: Exception) -> None:
    print(f"[{step}] 失败：{error}")


def _first_id(payload: Any, *keys: str) -> str | None:
    """Extract an ID from common top-level, data, and nested response shapes."""
    if not isinstance(payload, dict):
        return None

    containers: list[dict[str, Any]] = [payload]
    for container_key in ("data", "knowledge", "agent"):
        value = payload.get(container_key)
        if isinstance(value, dict):
            containers.append(value)

    for container in containers:
        for key in keys:
            value = container.get(key)
            if value is not None and str(value).strip():
                return str(value)

    # Some versions wrap the agent object inside data.agent (or a similar
    # envelope), so inspect nested objects after the common response shapes.
    for value in payload.values():
        if isinstance(value, dict):
            nested_id = _first_id(value, *keys)
            if nested_id:
                return nested_id
    return None


def _write_knowledge_document() -> Path:
    document_path = Path(__file__).resolve().parent / DOCUMENT_FILENAME
    document_path.write_text(BEAUTY_KNOWLEDGE, encoding="utf-8")
    return document_path


def _is_model_unavailable(response: requests.Response) -> bool:
    """Recognize model-selection failures without masking auth or server failures."""
    return response.status_code in {400, 404, 422}


def _create_agent(
    session: requests.Session,
    api_key: str,
    knowledge_id: str,
) -> tuple[str | None, requests.Response | None]:
    tools = [
        {"type": "knowledge", "knowledge_id": knowledge_id},
        ROUTE_INTENT_TOOL,
    ]

    last_response: requests.Response | None = None
    for index, model in enumerate(("glm-5.3-flash", "glm-4.5-flash")):
        try:
            response = session.post(
                AGENT_CREATE_URL,
                headers=_agent_headers(api_key),
                json={
                    "name": "小美",
                    "model": model,
                    "system": AGENT_SYSTEM,
                    "tools": tools,
                },
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
        except requests.RequestException as error:
            _print_request_failure(f"创建 Agent（{model}）", error)
            return None, None

        if 200 <= response.status_code < 300:
            payload = _response_payload(response)
            agent_id = _first_id(payload, "id", "agent_id")
            if agent_id:
                print(f"[创建 Agent] 成功，model={model}，agent_id={agent_id}")
                return agent_id, response
            print("[创建 Agent] 失败：响应成功但未找到 agent.id，完整响应体：")
            print(response.text)
            return None, response

        last_response = response
        if index == 0 and _is_model_unavailable(response):
            print("[创建 Agent] glm-5.3-flash 不可用，自动回退到 glm-4.5-flash。")
            continue
        break

    return None, last_response


def main() -> int:
    try:
        api_key = os.environ["ZHIPU_API_KEY"]
    except KeyError:
        print("错误：未设置 ZHIPU_API_KEY 环境变量，无法继续。", file=sys.stderr)
        return 1

    if not api_key.strip():
        print("错误：ZHIPU_API_KEY 环境变量为空，无法继续。", file=sys.stderr)
        return 1

    session = requests.Session()
    auth_headers = _auth_headers(api_key)

    try:
        knowledge_response = session.post(
            KNOWLEDGE_CREATE_URL,
            headers={**auth_headers, "Content-Type": "application/json"},
            json={
                "name": "美妆知识库",
                "description": "小美使用的美妆知识库，覆盖肤质、色号、妆容搭配和产品选择原则。",
                "embedding_id": 2,
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as error:
        _print_request_failure("创建知识库", error)
        return 1

    if not 200 <= knowledge_response.status_code < 300:
        _print_failure("创建知识库", knowledge_response)
        return 1

    knowledge_id = _first_id(_response_payload(knowledge_response), "id", "knowledge_id")
    if not knowledge_id:
        print("[创建知识库] 失败：响应中未找到 id 或 knowledge_id，完整响应体：")
        print(knowledge_response.text)
        return 1
    print(f"[创建知识库] 成功，knowledge_id={knowledge_id}")

    try:
        document_path = _write_knowledge_document()
    except OSError as error:
        print(f"[生成文档] 失败：{error}")
        return 1
    print(f"[生成文档] 成功，路径={document_path}")

    try:
        with document_path.open("rb") as document_file:
            upload_response = session.post(
                DOCUMENT_UPLOAD_URL.format(knowledge_id=knowledge_id),
                headers=auth_headers,
                files={"file": (DOCUMENT_FILENAME, document_file, "text/markdown")},
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
    except (OSError, requests.RequestException) as error:
        _print_request_failure("上传文档", error)
        return 1

    if not 200 <= upload_response.status_code < 300:
        _print_failure("上传文档", upload_response)
        return 1
    print(f"[上传文档] 成功，knowledge_id={knowledge_id}")

    agent_id, agent_response = _create_agent(session, api_key, knowledge_id)
    if not agent_id:
        if agent_response is not None and not 200 <= agent_response.status_code < 300:
            _print_failure("创建 Agent", agent_response)
        return 1

    print(f"knowledge_id: {knowledge_id}")
    print(f"agent_id: {agent_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
