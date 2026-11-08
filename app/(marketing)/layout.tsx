import Navbar from '@/components/Navbar'
import { MarketingFooter } from '@/components/layout/MarketingFooter'

export default function MarketingLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Navbar />
      <div className='flex flex-1 flex-col'>{children}</div>
      <MarketingFooter />
    </>
  )
}
