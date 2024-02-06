function addToast(title, annotation, container, id) {
    if (id == undefined) {
      id = Math.floor(Math.random() * 10000);
    }
    const body = `
    <div class="toast hide" id="${id}" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
      <strong class="me-auto">${title}</strong>
      <small class="text-muted">${annotation}</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${container}
    </div>
    </div>
    `;
    document.querySelector(".toast-container").innerHTML += body;
    let toast = new bootstrap.Toast(document.getElementById(id));
    toast.show();
}