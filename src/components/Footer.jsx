export default function Footer({ name = "Zaudin" }) {
  return (
    <footer className="mx-auto mt-10 max-w-6xl px-5 py-10 text-center text-sm text-muted">
      <div className="web-divider mb-6" />© {new Date().getFullYear()} {name} — Built with care.
    </footer>
  );
}
