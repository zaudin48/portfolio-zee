export default function Connect({ settings }) {
  if (!settings?.linkedinUrl && !settings?.instagramUrl) return null;

  return (
    <div className="absolute left-full top-1/2 ml-6 -translate-y-1/2 z-20 flex flex-col gap-4">
      {settings?.linkedinUrl && (
        <a
          href={settings.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 animate-float items-center justify-center rounded-full border border-crimson bg-card text-white transition-all duration-300 hover:scale-110 hover:border-white hover:bg-crimson"
        >
          <i className="ri-linkedin-fill text-2xl"></i>
        </a>
      )}

      {settings?.instagramUrl && (
        <a
          href={settings.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 animate-float-delayed items-center justify-center rounded-full border border-crimson bg-card text-white transition-all duration-300 hover:scale-110 hover:border-white hover:bg-crimson"
        >
          <i className="ri-instagram-line text-2xl"></i>
        </a>
      )}
    </div>
  );
}