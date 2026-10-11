from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import User
from mic.models import ReelPost


@override_settings(CLOUDINARY_STORAGE={"CLOUD_NAME": "test-cloud"})
class ReelPostApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number="+255700000001",
            username="reel_creator",
            password="test-password",
        )
        self.client = APIClient()

    def create_post(self):
        self.client.force_authenticate(self.user)
        return self.client.post(
            "/api/mic/reels/",
            {
                "media_type": "IMAGE",
                "media_url": (
                    "https://res.cloudinary.com/test-cloud/image/upload/"
                    "v1/bashiri/reels/match.png"
                ),
                "caption": "Huu ndio mkeka wangu #Bashiri",
            },
            format="json",
        )

    def test_create_post_and_feed_return_real_creator_and_engagement(self):
        response = self.create_post()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["username"], "reel_creator")
        self.assertEqual(response.data["media_type"], "IMAGE")
        self.assertEqual(response.data["likes_count"], 0)
        self.assertEqual(response.data["comments_count"], 0)
        self.assertEqual(response.data["shares_count"], 0)

        feed = self.client.get("/api/mic/reels/")
        self.assertEqual(feed.status_code, 200)
        self.assertEqual(feed.data["count"], 1)
        self.assertEqual(feed.data["results"][0]["id"], response.data["id"])

    def test_likes_toggle_and_are_unique_per_user(self):
        post_response = self.create_post()
        post_id = post_response.data["id"]

        first_like = self.client.post(f"/api/mic/reels/{post_id}/like/")
        self.assertEqual(first_like.data, {"liked": True, "likes_count": 1})

        feed = self.client.get("/api/mic/reels/")
        self.assertTrue(feed.data["results"][0]["user_liked"])

        unlike = self.client.post(f"/api/mic/reels/{post_id}/like/")
        self.assertEqual(unlike.data, {"liked": False, "likes_count": 0})
        self.assertEqual(ReelPost.objects.get(pk=post_id).likes.count(), 0)

    def test_comments_and_shares_update_feed_counts(self):
        post_response = self.create_post()
        post_id = post_response.data["id"]

        comment = self.client.post(
            f"/api/mic/reels/{post_id}/comments/",
            {"content": "Nimeipenda hii post!"},
            format="json",
        )
        self.assertEqual(comment.status_code, 201)
        self.assertEqual(comment.data["username"], "reel_creator")

        share = self.client.post(
            f"/api/mic/reels/{post_id}/share/",
            {"platform": "COPY"},
            format="json",
        )
        self.assertEqual(share.status_code, 201)
        self.assertEqual(share.data["shares_count"], 1)

        feed = self.client.get("/api/mic/reels/")
        self.assertEqual(feed.data["results"][0]["comments_count"], 1)
        self.assertEqual(feed.data["results"][0]["shares_count"], 1)

    def test_create_requires_auth_and_only_accepts_bashiri_cloudinary_media(self):
        self.assertEqual(self.create_post().status_code, 201)
        self.client.force_authenticate(user=None)
        unauthenticated = self.client.post(
            "/api/mic/reels/",
            {"media_type": "IMAGE", "media_url": "https://example.com/photo.png"},
            format="json",
        )
        self.assertEqual(unauthenticated.status_code, 401)

        self.client.force_authenticate(self.user)
        invalid_media = self.client.post(
            "/api/mic/reels/",
            {"media_type": "IMAGE", "media_url": "https://example.com/photo.png"},
            format="json",
        )
        self.assertEqual(invalid_media.status_code, 400)
