from django.contrib.auth.decorators import login_required
from django.shortcuts import render


class PageView:
    template_view_name = None
    template_page_name = None

    def context(self, request):
        return {}

    def view(self):
        callable = lambda request: render(
            request, self.template_view_name, self.context(request)
        )
        return login_required(callable)

    def page(self):
        callable = lambda request: render(
            request, self.template_page_name, self.context(request)
        )
        return login_required(callable)
