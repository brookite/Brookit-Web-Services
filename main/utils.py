def get_context_data(request, **kwargs):
    ctx = kwargs
    user = request.user
    if user.is_authenticated:
        if user.first_name or user.last_name:
            ctx["username"] = f"{user.first_name} {user.last_name}"
        else:
            ctx["username"] = user.username
    return ctx


class MainPagesMixin:
    def get_main_context(self, **kwargs):
        return get_context_data(self.request, **kwargs)