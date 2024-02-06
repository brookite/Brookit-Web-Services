from django.urls import path, include

from articles.views import *


urlpatterns = [
    path("", main_page),
]
