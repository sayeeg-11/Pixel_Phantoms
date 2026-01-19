let loader = null;

export function showLoader() {
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "global-loader";
    loader.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(loader);
  }
  loader.style.display = "flex";
}

export function hideLoader() {
  if (loader) loader.style.display = "none";
}

