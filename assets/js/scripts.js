/*
{{ $serviceWorker := resources.Get "js/service-worker.js" | resources.ExecuteAsTemplate "service-worker.js" . }}
*/

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("{{ $serviceWorker.RelPermalink }}", {
    scope: "{{ "" | relURL }}",
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.controller?.postMessage({ command: "trimCaches" });
  });
}
