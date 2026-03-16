import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-beige bg-beige-deep py-8">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <p className="flex items-center justify-center gap-1 text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Hala Hamdan. Made with
          <Heart size={14} className="text-terracotta" fill="currentColor" />
          for education.
        </p>
      </div>
    </footer>
  );
}
