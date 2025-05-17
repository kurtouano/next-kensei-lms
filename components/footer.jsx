export function Footer() {
  return (
    <footer className="border-t border-[#dce4d7] bg-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-[#5c6d5e]">
          © {new Date().getFullYear()} 日本語ガーデン (Japanese Garden). All rights reserved.
        </p>
      </div>
    </footer>
  )
}
