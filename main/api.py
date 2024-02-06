from main.models import Post
from django.http import JsonResponse
from django.urls import path


def get_post_by_id(request):
    post = Post.objects.filter(pk=request.GET.get("post_id")).first()
    if post:
        result = {"title": post.title, "content": post.content}
    else:
        result = {}
    return JsonResponse(result)


urls = [
    path("api/get_post_by_id", get_post_by_id, name="get_post_by_id"),
]