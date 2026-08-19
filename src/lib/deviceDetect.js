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
    screenSize: `${window.screen.width}x${window.screen.height}`,
  };
}