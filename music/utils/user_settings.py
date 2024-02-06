from music.models import UserSettings
import json

DEFAULT_SETTINGS = {
    "allowVideo": False
}


def set_if_not_exists(obj: dict, key, value):
    if key not in obj:
        obj[key] = value


def _form_settings(obj: str):
    obj = json.loads(obj)
    for key in DEFAULT_SETTINGS:
        set_if_not_exists(obj, key, DEFAULT_SETTINGS[key])
    return json.dumps(obj, ensure_ascii=False)


def get_user_settings(user):
    settings = UserSettings.objects.filter(user=user)
    if settings:
        settings = settings.first()
        settings.json = _form_settings(settings.json)
        settings.save()
    else:
        settings = UserSettings.objects.create(user=user, json=_form_settings("{}"))
    return json.loads(settings.json), settings


def update_user_settings(user, new_obj):
    obj, settings = get_user_settings(user)
    for key in new_obj:
        if key in DEFAULT_SETTINGS.keys():
            obj[key] = new_obj[key]
    settings.json = json.dumps(obj, ensure_ascii=False)
    settings.save()
    return True