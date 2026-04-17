export function downloadTemplateFile(relativePath, fileName) {
  if (typeof document === "undefined") return;

  const base = import.meta.env.BASE_URL || "/";
  const href = `${base.replace(/\/?$/, "/")}${relativePath.replace(/^\//, "")}`;
  const link = document.createElement("a");

  link.href = href;
  link.download = fileName;
  link.rel = "noopener";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();
}
