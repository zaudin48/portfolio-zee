// Lightweight User-Agent sniffing — good enough to bucket visitors into
// the categories the dashboard cares about, without pulling in a whole
// UA-parsing library for a personal portfolio's traffic scale.
export function detectDevice() {
  const ua = navigator.userAgent || "";

  let deviceType = "desktop";
  if (/iPad|Tablet/i.test(ua)) {
    deviceType = "tablet";
  } else if (/Mobi|Android|iPhone/i.test(ua)) {
    deviceType = "phone";
  }

  let osType = "Other";
  if (/Windows/i.test(ua)) osType = "Windows";
  else if (/iPhone|iPad|iPod/i.test(ua)) osType = "iOS";
  else if (/Android/i.test(ua)) osType = "Android";
  else if (/Mac OS X/i.test(ua)) osType = "Mac";
  else if (/Linux/i.test(ua)) osType = "Linux";

  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  return {
    deviceType,
    osType,
    browser,
    brand: detectBrand(ua, osType),
    screenSize: `${window.screen.width}x${window.screen.height}`,
  };
}

// Best-effort brand/model guess. Android UAs often embed the model code
// (e.g. "SM-G991B", "Redmi Note 11") — this is a heuristic, not exact,
// since manufacturers don't standardize this. iOS UAs never reveal the
// specific device model at all (Apple deliberately doesn't expose it),
// so "iPhone" is as specific as it gets there.
function detectBrand(ua, osType) {
  if (osType === "iOS") return "Apple (model not exposed by iOS)";
  if (osType !== "Android") return "";

  const patterns = [
    [/SM-[A-Z0-9]+/i, "Samsung"],
    [/Redmi|Xiaomi|POCO|Mi\s?\d/i, "Xiaomi"],
    [/OnePlus/i, "OnePlus"],
    [/Pixel/i, "Google Pixel"],
    [/Realme/i, "Realme"],
    [/OPPO|CPH\d+/i, "Oppo"],
    [/vivo/i, "Vivo"],
    [/Motorola|Moto\s?[A-Z]/i, "Motorola"],
    [/Nokia/i, "Nokia"],
    [/HUAWEI|Honor/i, "Huawei/Honor"],
  ];
  for (const [pattern, brand] of patterns) {
    if (pattern.test(ua)) return brand;
  }
  return "Android (brand unknown)";
}