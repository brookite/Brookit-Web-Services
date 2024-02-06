def enumerate(iterable, start_index=1):
    return [(i + start_index, iterable[i]) for i in range(len(iterable))]