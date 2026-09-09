"""
herocarousel/models.py

CustomSlide — matangazo ya admin (mfano feature mpya, sherehe maalum).
Slides za kiotomatiki (Mechi ya Leo, Derby, Track Record, PRO, Fan of
Match, Did You Know) HAZIHIFADHIWI database — zinahesabiwa live kutoka
data iliyopo (herocarousel/services.py).

HeroImageConfig — picha za automatic slides zinaweza kubadilishwa na admin.
"""
from django.db import models


class HeroImageConfig(models.Model):
    """Picha za automatic slides (TOP_PICK, DERBY, n.k.) zinazodhibitiwa na admin."""
    SLIDE_TYPES = [
        ("top_pick", "Top Pick - Mechi ya Leo"),
        ("derby", "Derby - Mechi Kubwa"),
        ("track_record", "Track Record - Takwimu ya AI"),
        ("pro", "PRO - Subscription Promotion"),
        ("mic", "Fan of Match - MIC"),
        ("did_you_know", "Did You Know - Facts"),
    ]
    
    slide_type = models.CharField(
        max_length=20, 
        choices=SLIDE_TYPES, 
        unique=True,
        help_text="Aina ya slide ambayo picha hii inatumika"
    )
    image_url = models.URLField(
        max_length=500,
        help_text="URL ya picha kutoka Cloudinary"
    )
    cloudinary_public_id = models.CharField(
        max_length=200,
        blank=True,
        help_text="Cloudinary public ID kwa ajili ya kubadilisha picha"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "herocarousel_heroimageconfig"
        ordering = ["slide_type"]

    def __str__(self):
        return f"{self.get_slide_type_display()}"


class CustomSlide(models.Model):
    title = models.CharField(max_length=150)
    subtitle = models.CharField(max_length=200, blank=True, default="")
    image_url = models.URLField(max_length=500)
    cta_label = models.CharField(max_length=50, blank=True, default="Angalia")
    route = models.CharField(max_length=200, blank=True, default="")
    accent_color = models.CharField(max_length=7, default="#00FF87")
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "herocarousel_customslide"
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.title
