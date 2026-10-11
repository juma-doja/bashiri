import logging
import json
import uuid

from django.utils import timezone
from django.db import transaction
from django.db.models import F
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings

from .models import ChatMessage, ChatUsage
from .utils import ChatProviderError, get_chat_response

logger = logging.getLogger(__name__)


def _get_daily_limit(user):
    if user and user.is_authenticated:
        if getattr(user, "is_subscription_active", False):
            return settings.BASHIRI["SUBSCRIBER_AI_CHAT_DAILY"]
        return settings.BASHIRI["FREE_AI_CHAT_DAILY"]
    return settings.BASHIRI["GUEST_AI_CHAT_DAILY"]


class ChatView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        raw_session_key = request.query_params.get("session_key", "")
        if raw_session_key is not None and not isinstance(raw_session_key, str):
            return Response({"detail": "session_key si sahihi."}, status=status.HTTP_400_BAD_REQUEST)
        if user:
            session_key = ""
        else:
            session_key = raw_session_key.strip() if raw_session_key else str(uuid.uuid4())
            if len(session_key) > 64:
                return Response({"detail": "session_key si sahihi."}, status=status.HTTP_400_BAD_REQUEST)

        messages = list(
            ChatMessage.objects.filter(user=user, session_key=session_key)
            .order_by("-created_at", "-id")[:50]
        )
        messages.reverse()
        usage = ChatUsage.objects.filter(
            user=user,
            session_key=session_key,
            date=timezone.localdate(),
        ).first()
        response_data = {
            "messages": [
                {
                    "id": message.id,
                    "role": message.role,
                    "content": message.content,
                    "created_at": message.created_at,
                    "tool_result": message.tool_result,
                }
                for message in messages
            ],
            "remaining_today": max(0, _get_daily_limit(user) - (usage.count if usage else 0)),
        }
        if not user:
            response_data["session_key"] = session_key
        return Response(response_data)

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        raw_message = request.data.get("message", "")
        if not isinstance(raw_message, str):
            return Response({"detail": "message lazima iwe maandishi."}, status=status.HTTP_400_BAD_REQUEST)
        message_text = raw_message.strip()

        if not message_text:
            return Response({"detail": "message inahitajika."}, status=status.HTTP_400_BAD_REQUEST)
        if len(message_text) > 2000:
            return Response({"detail": "Ujumbe usizidi herufi 2,000."}, status=status.HTTP_400_BAD_REQUEST)

        raw_session_key = request.data.get("session_key", "")
        if user:
            session_key = ""
        else:
            if raw_session_key is not None and not isinstance(raw_session_key, str):
                return Response({"detail": "session_key si sahihi."}, status=status.HTTP_400_BAD_REQUEST)
            session_key = raw_session_key.strip() if raw_session_key else str(uuid.uuid4())
            if len(session_key) > 64:
                return Response({"detail": "session_key si sahihi."}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.localdate()
        limit = _get_daily_limit(user)
        with transaction.atomic():
            usage, _created = ChatUsage.objects.get_or_create(
                user=user, session_key=session_key, date=today, defaults={"count": 0}
            )
            usage = ChatUsage.objects.select_for_update().get(pk=usage.pk)
            if usage.count >= limit:
                return Response(
                    {"detail": f"Umefikia kikomo cha maswali {limit} kwa siku. Jaribu kesho au panda PRO."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
            usage.count += 1
            usage.save(update_fields=["count"])
            remaining_today = max(0, limit - usage.count)

        history = list(
            ChatMessage.objects.filter(user=user, session_key=session_key)
            .order_by("-created_at", "-id")[:10]
        )
        history.reverse()
        history = [{"role": message.role, "content": message.content} for message in history]

        try:
            reply, tool_name, tool_data = get_chat_response(message_text, history)
        except ChatProviderError as exc:
            with transaction.atomic():
                ChatUsage.objects.filter(pk=usage.pk, count__gt=0).update(count=F("count") - 1)
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            logger.exception("Unexpected failure while generating Bashiri AI response")
            with transaction.atomic():
                ChatUsage.objects.filter(pk=usage.pk, count__gt=0).update(count=F("count") - 1)
            return Response(
                {"detail": "Imeshindikana kupata jibu kwa sasa. Tafadhali jaribu tena."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serialized_tool_data = (
            json.loads(json.dumps(tool_data, ensure_ascii=False, default=str))
            if tool_data is not None
            else None
        )
        with transaction.atomic():
            ChatMessage.objects.create(
                user=user,
                session_key=session_key,
                role="user",
                content=message_text,
            )
            assistant_message = ChatMessage.objects.create(
                user=user,
                session_key=session_key,
                role="assistant",
                content=reply,
                tool_result=serialized_tool_data,
            )

        response_data = {
            "reply": reply,
            "remaining_today": remaining_today,
            "message_id": assistant_message.id,
        }
        if not user:
            response_data["session_key"] = session_key
        if tool_name and tool_data is not None:
            response_data["tool_result"] = {"tool_name": tool_name, "data": tool_data}

        return Response(response_data)


class FeedbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        message_id = request.data.get("message_id")
        feedback = request.data.get("feedback")  # "positive" or "negative"
        raw_session_key = request.data.get("session_key", "")
        if raw_session_key is not None and not isinstance(raw_session_key, str):
            return Response({"detail": "session_key si sahihi."}, status=status.HTTP_400_BAD_REQUEST)
        session_key = raw_session_key.strip() if raw_session_key else ""
        if len(session_key) > 64:
            return Response({"detail": "session_key si sahihi."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not message_id or not feedback:
            return Response({"detail": "message_id na feedback zinahitajika."}, status=status.HTTP_400_BAD_REQUEST)
        
        if feedback not in ["positive", "negative"]:
            return Response({"detail": "feedback lazima iwe 'positive' au 'negative'."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = request.user if request.user.is_authenticated else None
            if user:
                session_key = ""
            message = ChatMessage.objects.get(id=message_id, user=user, session_key=session_key)
            if message.role != "assistant":
                return Response({"detail": "Feedback inaruhusiwa kwa jibu la AI pekee."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Don't allow duplicate feedback
            if message.feedback:
                return Response({"detail": "Feedback tayari imeshawekwa."}, status=status.HTTP_400_BAD_REQUEST)
            
            message.feedback = feedback
            message.save(update_fields=["feedback"])
            
            # Gamification: Update AI agreement score and give XP
            if user and user.is_authenticated:
                from gamification.models import UserProgress
                from gamification.services import award_achievement
                
                progress, created = UserProgress.objects.get_or_create(user=user)
                
                # Update AI agreement score
                if feedback == "positive":
                    progress.ai_agreement_score = min(100, progress.ai_agreement_score + 5)
                else:
                    progress.ai_agreement_score = max(0, progress.ai_agreement_score - 2)
                progress.save()
                
                # Give small XP for providing feedback
                progress.add_xp(5)
                
                # Check for AI_MASTER achievement
                if progress.ai_agreement_score >= 80:
                    award_achievement(user, "AI_MASTER")
            
            return Response({"success": True, "ai_agreement_score": user.progress.ai_agreement_score if user and hasattr(user, 'progress') else None})
        except ChatMessage.DoesNotExist:
            return Response({"detail": "Ujumbe haujapatikana."}, status=status.HTTP_404_NOT_FOUND)
