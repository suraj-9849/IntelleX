import Link from 'next/link';

export default function MainNavbar() {
  return (
    <nav className='mb-8 flex w-full items-center justify-between'>
      <Link href='/' className='text-2xl font-bold'>
        IntellexAI
      </Link>
      <Link href='/' className='text-sm hover:underline'>
        Back to Home
      </Link>
    </nav>
  );
}
