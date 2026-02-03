from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),

    # Your API app
    path('api/', include('api.urls')),

    # 🔑 Token auth endpoint
    path('api/token/', obtain_auth_token),
]
