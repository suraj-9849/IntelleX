import { signInAction } from '@/app/actions';
import { FormMessage, type Message } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <div className='flex h-[90vh] w-full flex-col bg-background md:flex-row'>
      <div className='flex w-full flex-col items-start justify-end bg-[rgb(74,32,138)] p-8 md:w-1/2'>
        <div className='max-w-md text-white'>
          <h1 className='bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,32,138,0.5))] bg-clip-text text-4xl font-semibold tracking-tighter text-transparent md:text-8xl'>
            IntellexAI.
          </h1>
          <p className='mb-8 bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,32,138,0.5))] bg-clip-text text-xl tracking-tighter text-transparent'>
            Sign in to access your account and continue your journey.
          </p>
        </div>
      </div>
      <div className='flex w-full items-center justify-center p-4 md:w-1/2'>
        <div className='w-full max-w-md'>
          <form className='flex w-full flex-col space-y-6 rounded-lg bg-card p-8 shadow-lg'>
            <h1 className='text-center text-3xl font-bold'>Sign in</h1>
            <p className='text-center text-sm text-muted-foreground'>
              Don't have an account?{' '}
              <Link
                className='font-medium text-primary underline'
                href='/sign-up'
              >
                Sign up
              </Link>
            </p>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-base'>
                  Email
                </Label>
                <Input
                  name='email'
                  id='email'
                  placeholder='you@example.com'
                  required
                  className='text-base'
                />
              </div>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='password' className='text-base'>
                    Password
                  </Label>
                  <Link
                    className='text-sm text-primary underline'
                    href='/forgot-password'
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  type='password'
                  name='password'
                  id='password'
                  placeholder='Your password'
                  required
                  className='text-base'
                />
              </div>
              <SubmitButton
                pendingText='Signing In...'
                formAction={signInAction}
                className='w-full text-base'
              >
                Sign in
              </SubmitButton>
              <FormMessage message={searchParams} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
