"""chat/utils.py — Groq function-calling: LLM inaita tools, si kubuni jibu."""
import json
import logging

from django.conf import settings
from groq import Groq

from .tools import (
    tool_predict_fixture,
    tool_team_form,
    tool_head_to_head,
    tool_ai_track_record,
    tool_active_derby,
    tool_search_matches,
    tool_app_help,
)

logger = logging.getLogger(__name__)


class ChatProviderError(Exception):
    """Provider haikuweza kutoa jibu la Bashiri AI."""


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "predict_fixture",
            "description": "Tumia hii tool wakati mtu anauliza kuhusu PREDICTION ya mechi fulani au anataka kujua nani atashinda mechi. Inahitaji jina la timu ya nyumbani, timu ya ugenini, na kodi ya ligi. Mfano: 'Man City vs Arsenal' au 'Nani atashinda Chelsea vs Liverpool?'",
            "parameters": {
                "type": "object",
                "properties": {
                    "league_code": {
                        "description": "Kodi ya ligi (EPL kwa Premier League, LaLiga kwa La Liga, Bundesliga, Ligue1)",
                        "type": "string"
                    },
                    "home_team": {
                        "description": "Jina la timu ya nyumbani (mfano: Manchester City, Chelsea, Man City, Liverpool). System inatambua abbreviations na spelling errors.",
                        "type": "string"
                    },
                    "away_team": {
                        "description": "Jina la timu ya ugenini (mfano: Arsenal, Liverpool, Spurs, Man Utd). System inatambua abbreviations na spelling errors.",
                        "type": "string"
                    }
                },
                "required": ["league_code", "home_team", "away_team"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "team_form",
            "description": "Tumia hii tool wakati mtu anauliza kuhusu FORM ya timu moja tu, matokeo ya mwisho, au utendaji wa timu fulani pekee. Inahitaji jina la timu moja tu. Mfano: 'Form ya Man City', 'Arsenal wamekuwaje', 'Simba form yake'",
            "parameters": {
                "type": "object",
                "properties": {
                    "team_name": {
                        "description": "Jina la timu moja tu (mfano: Manchester City, Simba, Arsenal, Man City, Liverpool). System inatambua abbreviations na spelling errors.",
                        "type": "string"
                    }
                },
                "required": ["team_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "head_to_head",
            "description": "Tumia hii tool wakati mtu anauliza kuhusu HISTORIA ya mechi kati ya timu mbili, mechi za awali, au head-to-head. Inahitaji majina ya timu mbili. Mfano: 'Head to head Man City vs Liverpool', 'Mechi za awali Chelsea vs Arsenal'",
            "parameters": {
                "type": "object",
                "properties": {
                    "team1_name": {
                        "description": "Jina la timu ya kwanza (mfano: Manchester City, Man City, Liverpool). System inatambua abbreviations na spelling errors.",
                        "type": "string"
                    },
                    "team2_name": {
                        "description": "Jina la timu ya pili (mfano: Arsenal, Spurs, Chelsea). System inatambua abbreviations na spelling errors.",
                        "type": "string"
                    }
                },
                "required": ["team1_name", "team2_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "ai_track_record",
            "description": "Tumia hii tool wakati mtu anauliza kuhusu TRACK RECORD ya AI, accuracy ya predictions, au utendaji wa AI. Mfano: 'AI track record', 'Accuracy ya AI', 'AI imeshinda ngapi'",
            "parameters": {
                "type": "object",
                "properties": {
                    "league_code": {
                        "description": "Kodi ya ligi (optional - kama haipatikani, rudisha overall accuracy)",
                        "type": "string"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "active_derby",
            "description": "Tumia hii tool wakati mtu anauliza kuhusu DERBY zinazoendelea sasa au mechi kubwa za rivalry. Mfano: 'Kuna derby leo?', 'Derby zinazoendelea'",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_matches",
            "description": "Tumia hii tool wakati mtu anataka kutafuta mechi kwa jina la timu, au anataka kuona mechi zote za timu fulani. Mfano: 'Mechi za Man City', 'Tafuta Arsenal', 'Simba mechi zake'",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "description": "Jina la timu au sehemu ya jina la timu unayotaka kutafuta mechi zake",
                        "type": "string"
                    },
                    "status": {
                        "description": "Status ya mechi (optional: SCHEDULED, LIVE, FINISHED)",
                        "type": "string"
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "app_help",
            "description": "Tumia wakati user anauliza jinsi ya kutumia Bashiri, kipengele kiko wapi, au anahitaji msaada wa app. Rudisha maelezo na route halisi ya app.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "description": "Swali la mtumiaji kuhusu feature au namna ya kutumia Bashiri.",
                        "type": "string",
                    },
                },
                "required": ["query"],
            },
        },
    },
]

SYSTEM_PROMPT = (
    "Wewe ni Bashiri AI, msaidizi wa Bashiri app nzima na uchambuzi wa mpira. "
    "Jibu kwa Kiswahili fasaha, kwa ufupi, kwa huruma na hatua zinazoweza kufuatwa. "
    "Msaada wa app: mechi na ratiba (/matches), AI (/ai), tips (/tips), Saved Markets (/saved-markets), "
    "Prediction Leagues (/leagues), Reels (/reels), AI Track Record (/track-record), "
    "Pick Analytics (/bashiri-pick-analytics), Derby Hub (/derby), Pulse (/pulse), "
    "wasifu (/profile), na usajili (/subscribe). Tumia app_help kwa swali la feature, "
    "mahali pa kuipata, au hatua za kuitumia; usibuni uwezo ambao haupo kwenye taarifa hizi au tool. "
    "Tumia tool husika kila mara kwa data ya prediction, form, head-to-head, track record, derby, "
    "kutafuta mechi, au maelekezo ya app. Data ya tool ndiyo ukweli: usibuni score, ratiba, asilimia, "
    "feature, au matokeo. "
    "Baada ya tool, eleza matokeo yake kwa kawaida na kwa kifupi; usionyeshe JSON, majina ya tool, "
    "au ujumbe wa ndani wa mfumo. Ikiwa tool imeshindwa au haina data, sema hivyo wazi na usikisie. "
    "Kwa maswali ya jumla yasiyohitaji data ya sasa, eleza kwa lugha rahisi na utoe njia ya app inayofaa."
)


def get_chat_response(user_message: str, history: list) -> tuple[str, str | None, dict | None]:
    """
    Rudisha tuple: (reply_text, tool_name, tool_data)
    - reply_text: Maandishi ya jibu la AI
    - tool_name: Jina la tool iliyoitwa (au None kama hakuna tool)
    - tool_data: Matokeo ya tool (au None kama hakuna tool)
    """
    if not settings.GROQ_API_KEY:
        raise ChatProviderError("Bashiri AI haijasanidiwa kwa sasa. Tafadhali jaribu tena baadaye.")

    client = Groq(api_key=settings.GROQ_API_KEY)
    messages = []
    for msg in history:
        if msg["role"] == "user":
            messages.append({"role": "user", "content": msg["content"]})
        elif msg["role"] == "assistant":
            messages.append({"role": "assistant", "content": msg["content"]})
    
    # Add system prompt
    messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})
    
    # Add current user message
    messages.append({"role": "user", "content": user_message})

    tool_functions = {
        "predict_fixture": tool_predict_fixture,
        "team_form": tool_team_form,
        "head_to_head": tool_head_to_head,
        "ai_track_record": tool_ai_track_record,
        "active_derby": tool_active_derby,
        "search_matches": tool_search_matches,
        "app_help": tool_app_help,
    }

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )
        if not response.choices:
            raise ChatProviderError("Bashiri AI haikurudisha jibu. Tafadhali jaribu tena.")

        assistant_message = response.choices[0].message
        tool_calls = assistant_message.tool_calls or []
        if not tool_calls:
            reply = assistant_message.content
            if not isinstance(reply, str) or not reply.strip():
                raise ChatProviderError("Bashiri AI haikurudisha jibu linalosomeka. Tafadhali jaribu tena.")
            return reply.strip(), None, None

        messages.append({
            "role": "assistant",
            "content": assistant_message.content,
            "tool_calls": [
                {
                    "id": tool_call.id,
                    "type": "function",
                    "function": {
                        "name": tool_call.function.name,
                        "arguments": tool_call.function.arguments,
                    },
                }
                for tool_call in tool_calls
            ],
        })

        tool_result_name = None
        tool_result_data = None
        for tool_call in tool_calls:
            tool_name = tool_call.function.name
            tool_result_name = tool_result_name or tool_name
            try:
                arguments = json.loads(tool_call.function.arguments or "{}")
                tool_function = tool_functions.get(tool_name)
                if not tool_function:
                    raise ValueError(f"Tool '{tool_name}' haipatikani")
                result = tool_function(**arguments)
            except (TypeError, ValueError, json.JSONDecodeError) as exc:
                logger.warning("Bashiri AI returned invalid arguments for tool %s: %s", tool_name, exc)
                result = {"success": False, "error": "Imeshindikana kutumia taarifa za swali hili."}
            except Exception:
                logger.exception("Bashiri AI tool %s failed", tool_name)
                result = {"success": False, "error": "Huduma hii imeshindwa kupata taarifa kwa sasa."}

            if tool_result_data is None:
                tool_result_data = result
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result, ensure_ascii=False, default=str),
            })

        final_response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
        )
        if not final_response.choices:
            raise ChatProviderError("Bashiri AI haikuweza kufafanua taarifa zilizopatikana. Tafadhali jaribu tena.")

        reply = final_response.choices[0].message.content
        if not isinstance(reply, str) or not reply.strip():
            raise ChatProviderError("Bashiri AI haikurudisha jibu linalosomeka. Tafadhali jaribu tena.")
        return reply.strip(), tool_result_name, tool_result_data
    except ChatProviderError:
        raise
    except Exception as exc:
        logger.exception("Bashiri AI provider request failed")
        raise ChatProviderError(
            "Imeshindikana kuwasiliana na Bashiri AI kwa sasa. Tafadhali jaribu tena."
        ) from exc