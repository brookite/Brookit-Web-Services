from django.urls import path

from main.views import *
from main.api import urls as api_urls

urlpatterns = [
    path("", index, name="index"),
    path("about", about),
    path("login/", AuthorizationView.as_view(), name="login"),
    path("register", RegistrationView.as_view(), name="register"),
    path("logout", logout_user, name="logout"),
    path("profile/<slug:username>", ProfileView.as_view(), name="profile"),
    path("profile/<int:profile_id>", ProfileView.as_view(), name="profile"),
    path("profile", logged_in_profile, name="to_profile"),
    path("blog", BlogView.as_view(), name="blog"),
    path("createpost", create_post, name="createpost"),
    path("deletepost", delete_post, name="deletepost"),
    path("editpost", edit_post, name="editpost"),
    path("post<int:pk>", PostView.as_view(), name="post"),
    *api_urls
]