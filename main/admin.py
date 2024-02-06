from django.contrib import admin

from main.models import Post, User

admin.site.register(User)
admin.site.register(Post)