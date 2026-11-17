// Build one list row for a saved scan (used by the Home and Scan History pages)
export function createScanItem(scan) {
  const item = document.createElement("li");
  item.className = "list-group-item d-flex justify-content-between align-items-start gap-3";

  const details = document.createElement("div");
  details.className = "text-break";

  // textContent keeps the scanned link as plain text, never as HTML
  const link = document.createElement("div");
  link.className = "fw-semibold";
  link.textContent = scan.url;

  const date = document.createElement("small");
  date.className = "text-muted";
  date.textContent = scan.scanDate ? "Scanned " + scan.scanDate.toDate().toLocaleString() : "Scanned just now";

  details.append(link, date);

  // Same rule as the scanner: any malicious or suspicious result is a warning
  const isSuspicious = (scan.malicious || 0) > 0 || (scan.suspicious || 0) > 0;
  const badge = document.createElement("span");
  badge.className = "badge rounded-pill " + (isSuspicious ? "text-bg-danger" : "text-bg-success");
  badge.textContent = isSuspicious ? "Suspicious" : "Looks safe";

  item.append(details, badge);
  return item;
}
