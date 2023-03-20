/*

*/

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/hugo-tailwindcss-template/service-worker.js", {
    scope: "/hugo-tailwindcss-template/",
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.controller?.postMessage({ command: "trimCaches" });
  });
}
