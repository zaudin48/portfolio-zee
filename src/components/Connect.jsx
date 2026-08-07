export default function Connect({ settings }) {
  if (!settings?.linkedinUrl && !settings?.instagramUrl) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
     {settings?.linkedinUrl && (
  <a
    href={settings.linkedinUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="pointer-events-auto absolute -right-3 top-5 flex h-10 w-10 animate-float items-center justify-center rounded-full bg-card text-white border border-line transition-all duration-300 hover:scale-110 hover:bg-crimson hover:border-crimson"
  >
    <i className="ri-linkedin-fill text-lg"></i>
  </a>
)}

{settings?.instagramUrl && (
  <a
    href={settings.instagramUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="pointer-events-auto absolute -right-3 bottom-5 flex h-10 w-10 animate-float-delayed items-center justify-center rounded-full bg-card text-white border border-line transition-all duration-300 hover:scale-110 hover:bg-crimson hover:border-crimson"
  >
    <i className="ri-instagram-line text-lg"></i>
  </a>
)}
    </div>
  );
}