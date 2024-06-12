export function Footer() {
  return (
    <footer className="flex min-h-[80px] items-center justify-center px-3">
      <div className="flex items-center">
        <p className="flex items-center whitespace-nowrap text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
          Made with ♥️ using&nbsp;
          <a
            href="https://tailwindcss.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="actionable flex items-center font-semibold text-gray-800 transition duration-200 hover:-translate-y-1 dark:text-gray-50"
          >
            TailwindCSS,&nbsp;
          </a>
          <a
            href="https://ui.shadcn.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="actionable flex items-center font-semibold text-gray-800 transition duration-200 hover:-translate-y-1 dark:text-gray-50"
          >
            Shadcn&nbsp;
          </a>
          &&nbsp;
          <a
            href="https://ui.aceternity.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="actionable flex items-center font-semibold text-gray-800 transition duration-200 hover:-translate-y-1 dark:text-gray-50"
          >
            Aceternity.
          </a>
        </p>
      </div>
    </footer>
  );
}
