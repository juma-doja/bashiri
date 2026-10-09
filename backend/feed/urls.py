from django.urls import path

from .views import CardsListView, DebateListView, DebateVoteView, FeedListView, HighConfidenceCardsListView, PollVoteView

urlpatterns = [
    path("", FeedListView.as_view(), name="feed-list"),
    path("high-confidence/", HighConfidenceCardsListView.as_view(), name="high-confidence-cards-list"),
    path("cards/", CardsListView.as_view(), name="cards-list"),
    path("debates/", DebateListView.as_view(), name="debate-list"),
    path("polls/<int:card_id>/vote/", PollVoteView.as_view(), name="poll-vote"),
    path("polls/<int:card_id>/vote-check/", PollVoteView.as_view(), name="poll-vote-check"),
    path("debates/<int:card_id>/vote/", DebateVoteView.as_view(), name="debate-vote"),
]
