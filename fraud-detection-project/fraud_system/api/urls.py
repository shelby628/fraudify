from django.urls import path
from .views import dashboard_stats
from . import views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path("register/", views.register_user, name="register_user"), # New registration endpoint
    path("predict/", views.predict, name="predict"),
    path("transactions/", views.transactions_list, name="transactions_list"),
    path("review/", views.review_transaction, name="review_transaction"),
    path("audit-logs/", views.audit_logs_list, name="audit_logs_list"),
    path("api/token/", obtain_auth_token),
    path("dashboard/stats/", dashboard_stats),
    path("dashboard/stats/me/", views.user_dashboard_stats, name="user_dashboard_stats"),
    path("me/", views.get_me, name="get_me"),
]
