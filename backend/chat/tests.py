from types import SimpleNamespace
from unittest.mock import Mock, patch

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from chat.models import ChatMessage, ChatUsage
from chat.utils import ChatProviderError, get_chat_response


class ChatApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("chat.views.get_chat_response", return_value=("Habari! Bashiri AI hapa.", None, None))
    def test_guest_chat_is_isolated_and_history_is_restored(self, _mock_response):
        session_a = "guest-session-a"
        session_b = "guest-session-b"

        first = self.client.post(
            "/api/chat/",
            {"message": "Habari", "session_key": session_a},
            format="json",
        )
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.data["session_key"], session_a)
        self.assertEqual(first.data["remaining_today"], 2)

        second = self.client.post(
            "/api/chat/",
            {"message": "Mechi gani?", "session_key": session_b},
            format="json",
        )
        self.assertEqual(second.status_code, 200)
        self.assertEqual(
            ChatMessage.objects.filter(user__isnull=True, session_key=session_a).count(),
            2,
        )
        self.assertEqual(
            ChatMessage.objects.filter(user__isnull=True, session_key=session_b).count(),
            2,
        )

        history = self.client.get(f"/api/chat/?session_key={session_a}")
        self.assertEqual(history.status_code, 200)
        self.assertEqual(len(history.data["messages"]), 2)
        self.assertEqual(history.data["messages"][0]["content"], "Habari")
        self.assertEqual(history.data["messages"][1]["id"], first.data["message_id"])

    @patch("chat.views.get_chat_response", return_value=("Jibu la AI.", None, None))
    def test_history_uses_latest_ten_messages_in_chronological_order(self, _mock_response):
        session_key = "guest-session-history"
        ChatMessage.objects.bulk_create([
            ChatMessage(session_key=session_key, role="user", content=f"old-{index}")
            for index in range(12)
        ])

        response = self.client.post(
            "/api/chat/",
            {"message": "Swali jipya", "session_key": session_key},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        _mock_response.assert_called_once()
        sent_history = _mock_response.call_args.args[1]
        self.assertEqual(len(sent_history), 10)
        self.assertEqual(sent_history[0]["content"], "old-2")
        self.assertEqual(sent_history[-1]["content"], "old-11")

    @patch("chat.views.get_chat_response", side_effect=ChatProviderError("Provider hayupo."))
    def test_provider_failure_does_not_save_messages_or_consume_quota(self, _mock_response):
        response = self.client.post(
            "/api/chat/",
            {"message": "Nisaidie", "session_key": "guest-session-failure"},
            format="json",
        )
        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            ChatUsage.objects.get(session_key="guest-session-failure").count,
            0,
        )
        self.assertFalse(ChatMessage.objects.exists())

    @patch("chat.views.get_chat_response", return_value=("Jibu la AI.", None, None))
    def test_chat_validates_input_and_enforces_guest_daily_limit(self, _mock_response):
        invalid = self.client.post(
            "/api/chat/",
            {"message": ["not", "text"], "session_key": "guest-session-validation"},
            format="json",
        )
        self.assertEqual(invalid.status_code, 400)

        too_long = self.client.post(
            "/api/chat/",
            {"message": "a" * 2001, "session_key": "guest-session-validation"},
            format="json",
        )
        self.assertEqual(too_long.status_code, 400)

        for _ in range(3):
            response = self.client.post(
                "/api/chat/",
                {"message": "Habari", "session_key": "guest-session-limit"},
                format="json",
            )
            self.assertEqual(response.status_code, 200)
        limited = self.client.post(
            "/api/chat/",
            {"message": "Swali la nne", "session_key": "guest-session-limit"},
            format="json",
        )
        self.assertEqual(limited.status_code, 429)
        self.assertEqual(_mock_response.call_count, 3)

    def test_feedback_is_limited_to_ai_responses_and_cannot_be_repeated(self):
        message = ChatMessage.objects.create(
            session_key="guest-session-feedback",
            role="assistant",
            content="Jibu",
        )
        feedback = self.client.post(
            "/api/chat/feedback/",
            {
                "message_id": message.id,
                "feedback": "positive",
                "session_key": "guest-session-feedback",
            },
            format="json",
        )
        self.assertEqual(feedback.status_code, 200)

        duplicate = self.client.post(
            "/api/chat/feedback/",
            {
                "message_id": message.id,
                "feedback": "negative",
                "session_key": "guest-session-feedback",
            },
            format="json",
        )
        self.assertEqual(duplicate.status_code, 400)

        user_message = ChatMessage.objects.create(
            session_key="guest-session-feedback",
            role="user",
            content="Swali",
        )
        invalid_feedback = self.client.post(
            "/api/chat/feedback/",
            {
                "message_id": user_message.id,
                "feedback": "positive",
                "session_key": "guest-session-feedback",
            },
            format="json",
        )
        self.assertEqual(invalid_feedback.status_code, 400)


class ChatToolFlowTests(TestCase):
    @override_settings(GROQ_API_KEY="test-key", GROQ_MODEL="test-model")
    @patch("chat.utils.Groq")
    def test_tool_result_is_sent_back_to_model_before_reply(self, groq_constructor):
        tool_call = SimpleNamespace(
            id="tool-call-1",
            function=SimpleNamespace(
                name="app_help",
                arguments='{"query": "Prediction Leagues"}',
            ),
        )
        tool_message = SimpleNamespace(
            content=None,
            tool_calls=[tool_call],
        )
        final_message = SimpleNamespace(
            content="Fungua Prediction Leagues kutoka hapa.",
            tool_calls=None,
        )
        first_response = SimpleNamespace(
            choices=[SimpleNamespace(message=tool_message)]
        )
        final_response = SimpleNamespace(
            choices=[SimpleNamespace(message=final_message)]
        )
        client = Mock()
        client.chat.completions.create.side_effect = [first_response, final_response]
        groq_constructor.return_value = client

        reply, tool_name, tool_data = get_chat_response("Ligi zinapatikana wapi?", [])

        self.assertIn("Fungua Prediction Leagues", reply)
        self.assertEqual(tool_name, "app_help")
        self.assertTrue(tool_data["success"])
        self.assertEqual(tool_data["data"]["features"][0]["route"], "/leagues")
        self.assertEqual(client.chat.completions.create.call_count, 2)
        final_call_messages = client.chat.completions.create.call_args.kwargs["messages"]
        self.assertEqual(final_call_messages[-1]["role"], "tool")
        self.assertEqual(final_call_messages[-1]["tool_call_id"], "tool-call-1")

    @override_settings(GROQ_API_KEY="")
    def test_missing_provider_configuration_is_reported(self):
        with self.assertRaises(ChatProviderError):
            get_chat_response("Habari", [])


class AppHelpToolTests(TestCase):
    def test_app_help_returns_only_real_routes_and_empty_search_is_explicit(self):
        from chat.tools import tool_app_help

        result = tool_app_help("Nataka kuunda Prediction League")
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["features"][0]["route"], "/leagues")

        no_match = tool_app_help("something unrelated")
        self.assertTrue(no_match["success"])
        self.assertEqual(no_match["data"]["features"], [])
