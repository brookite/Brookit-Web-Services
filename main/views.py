from typing import Any, Dict
from django.db.models.query import QuerySet
from django.shortcuts import render, redirect
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, Http404
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from django.views.generic import ListView, DetailView, CreateView, UpdateView
from django.contrib.auth import logout, login
from django.urls import reverse_lazy, reverse
from main.forms import (
    LoginUserForm,
    PostCreationForm,
    RegisterUserForm,
    UserEditingForm,
)
from main.utils import get_context_data, MainPagesMixin
from main.models import User, Post


def index(request):
    return render(
        request, "index.html", get_context_data(request, title="Brookit Services")
    )


def about(request):
    return render(request, "about.html", get_context_data(request, title="О нас"))


class AuthorizationView(MainPagesMixin, LoginView):
    template_name = "login.html"
    form_class = LoginUserForm

    def get_success_url(self):
        if self.request.GET.get("next"):
            return self.request.GET.get("next")
        return reverse_lazy("index")

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        context = super().get_context_data(**kwargs)
        return self.get_main_context(title="Вход", **context)


class ProfileView(MainPagesMixin, UpdateView):
    template_name = "profile.html"
    model = User
    form_class = UserEditingForm
    context_object_name = "profile"
    slug_url_kwarg = "username"
    pk_url_kwarg = "profile_id"
    success_url = reverse_lazy("to_profile")

    def get_slug_field(self):
        return "username"

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        context = super().get_context_data(**kwargs)
        name = f"{self.get_object().first_name} {self.get_object().last_name}"
        is_user_logged_in = self.get_object().pk == self.request.user.pk
        user_id = self.get_object().pk
        return self.get_main_context(
            title=name, user_id=user_id, is_user_logged_in=is_user_logged_in, **context
        )


class BlogView(MainPagesMixin, ListView):
    model = Post
    template_name = "blog.html"
    context_object_name = "posts"
    ordering = ["-publish_date"]

    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
        userid = self.request.GET.get("user")
        user = User.objects.filter(pk=userid).first()
        if user:
            return super().get(request, *args, **kwargs)
        else:
            raise Http404

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        context = super().get_context_data(**kwargs)
        context["form"] = PostCreationForm
        userid = self.request.GET.get("user")
        user = User.objects.filter(pk=userid).first()
        username = f"{user.first_name} {user.last_name}".strip() or user.username
        is_user_logged_in = user.pk == self.request.user.pk
        return self.get_main_context(
            title=f"Блог пользователя {username}",
            username=username,
            is_user_logged_in=is_user_logged_in,
            **context,
        )

    def get_queryset(self) -> QuerySet[Any]:
        userid = self.request.GET.get("user")
        user = User.objects.filter(pk=userid).first()
        return Post.objects.filter(owner=user).order_by(*self.ordering)


class PostView(DetailView):
    model = Post
    template_name = "post.html"
    context_object_name = "post"


class RegistrationView(MainPagesMixin, CreateView):
    template_name = "register.html"
    success_url = reverse_lazy("login")
    form_class = RegisterUserForm

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return HttpResponseRedirect(reverse("index"))
        else:
            return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs: Any) -> Dict[str, Any]:
        context = super().get_context_data(**kwargs)
        return self.get_main_context(title="Регистрация", **context)

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        return redirect(reverse("index"))


def logout_user(request):
    logout(request)
    return redirect(reverse("login"))


def create_post(request):
    form = PostCreationForm(request.POST)
    post = form.save(commit=False)
    post.owner = request.user
    post.save()
    return redirect(reverse("blog") + f"?user={request.user.pk}")


def delete_post(request):
    post_id = request.POST.get("post_id")
    post = Post.objects.filter(pk=post_id).first()
    if post:
        if request.user.pk == post.owner.pk:
            post.delete()
    return redirect(reverse("blog") + f"?user={request.user.pk}")


def edit_post(request):
    post_id = request.POST.get("post_id")
    post = Post.objects.get(id=post_id)
    form = PostCreationForm(request.POST, instance=post)
    post = form.save()
    return redirect(reverse("blog") + f"?user={request.user.pk}")


@login_required
def logged_in_profile(request):
    return redirect(reverse("profile", args=(request.user.username,)))
