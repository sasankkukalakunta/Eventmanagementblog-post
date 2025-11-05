import Link from 'next/dist/client/link'
import Image from 'next/image';
export const Navbar = () => {
  return (
    <header>
        <nav>
            <Link href='/' className='logo'>
            <Image src="/icons/logo.png" alt="logo" width={24} height={24} />

<p>DevEvent</p>
            </Link>
            <ul>
                <li><Link href ='#'>Home</Link></li>
                <li><Link href ='#'>Events</Link></li>
                <li><Link href ='#'>Create Events</Link></li>
            </ul>
        </nav>
    </header>
  )
}
