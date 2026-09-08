from django.conf import settings
from django.db import models


class VisitorLog(models.Model):
	"""Daily unique visitor activity for registered users and guests."""

	visitor_key = models.CharField(max_length=64, db_index=True)
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		null=True,
		blank=True,
		on_delete=models.SET_NULL,
		related_name="visitor_logs",
	)
	path = models.CharField(max_length=500, default="/")
	visit_date = models.DateField(db_index=True)
	visited_at = models.DateTimeField(auto_now=True)
	user_agent = models.CharField(max_length=500, blank=True, default="")

	class Meta:
		ordering = ["-visited_at"]
		constraints = [
			models.UniqueConstraint(
				fields=["visitor_key", "visit_date", "path"],
				name="unique_visitor_path_per_day",
			)
		]
from django.db import models

# Create your models here.
