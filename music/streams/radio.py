from abc import abstractmethod
from django.shortcuts import redirect


class Radio:
    @staticmethod
    @abstractmethod
    def stream_url() -> str:
        pass

    @classmethod
    @abstractmethod
    def as_view(cls, request):
        return redirect(cls.stream_url())
