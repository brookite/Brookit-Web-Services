import re


def form_trackname(title, artist):
    title = re.sub(r"[0-9.,]+ [M|m]i?n$", "", title).strip()
    return f"{artist} - {title}"