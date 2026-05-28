import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-md text-center">
          <p className="text-7xl font-bold text-slate-200 mb-4">404</p>
          <h1 className="text-2xl font-bold mb-3">Pagina nu a fost găsită</h1>
          <p className="text-muted-foreground mb-8">
            Pagina pe care o cauți nu există sau a fost mutată.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tractari">
              <Button variant="default">Acasă</Button>
            </Link>
            <a href="tel:+40721999922">
              <Button variant="outline">+40 721 999 922</Button>
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
