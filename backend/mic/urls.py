from django.urls import path

from .views import (
    FanOfMatchView, MicActiveMatchesView, MicCanPostView, MicMoodSummaryView,
    MicReactionCreateView, MicReactionDeleteView, MicReactionListView, MicReactionVoteView, 
    MicUploadSignatureView, UserMicReactionsView, ReelPostCommentListCreateView,
    ReelPostDetailView, ReelPostLikeView, ReelPostListCreateView,
    ReelPostShareView, ReelUploadSignatureView,
)

urlpatterns = [
    path("upload-signature/", MicUploadSignatureView.as_view(), name="mic-upload-signature"),
    path("active-matches/", MicActiveMatchesView.as_view(), name="mic-active-matches"),
    path("my-reactions/", UserMicReactionsView.as_view(), name="mic-my-reactions"),
    path("reels/upload-signature/", ReelUploadSignatureView.as_view(), name="reel-upload-signature"),
    path("reels/", ReelPostListCreateView.as_view(), name="reel-list-create"),
    path("reels/<int:post_id>/", ReelPostDetailView.as_view(), name="reel-detail"),
    path("reels/<int:post_id>/like/", ReelPostLikeView.as_view(), name="reel-like"),
    path("reels/<int:post_id>/comments/", ReelPostCommentListCreateView.as_view(), name="reel-comments"),
    path("reels/<int:post_id>/share/", ReelPostShareView.as_view(), name="reel-share"),
    path("", MicReactionCreateView.as_view(), name="mic-create"),
    path("<int:match_id>/", MicReactionListView.as_view(), name="mic-list"),
    path("<int:match_id>/can-post/", MicCanPostView.as_view(), name="mic-can-post"),
    path("<int:match_id>/mood-summary/", MicMoodSummaryView.as_view(), name="mic-mood-summary"),
    path("<int:match_id>/fan-of-match/", FanOfMatchView.as_view(), name="mic-fan-of-match"),
    path("reactions/<int:reaction_id>/vote/", MicReactionVoteView.as_view(), name="mic-vote"),
    path("reactions/<int:reaction_id>/", MicReactionDeleteView.as_view(), name="mic-delete"),
]