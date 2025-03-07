import { signUpAction } from '@/app/actions';
import { FormMessage, type Message } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { SmtpMessage } from '../smtp-message';

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ('message' in searchParams) {
    return (
      <div className='flex h-screen w-full flex-1 items-center justify-center gap-2 p-4 sm:max-w-md'>
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className='flex h-[90vh] w-full flex-col bg-background md:flex-row'>
      <div className='hidden w-full flex-col justify-end bg-[rgb(74,32,138)] p-8 sm:flex md:w-1/2'>
        <div className='max-w-md text-white'>
          <h1 className='bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,32,138,0.5))] bg-clip-text text-4xl font-semibold tracking-tighter text-transparent md:text-8xl md:leading-none'>
            IntellexAI.
          </h1>
          <p className='mb-8 bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,32,138,0.5))] bg-clip-text text-xl font-semibold tracking-tighter text-transparent md:leading-none'>
            Join thousands of users and start your journey today.
          </p>
        </div>
      </div>

      <div className='flex w-full items-center justify-center md:w-1/2'>
        <div className='w-full max-w-md'>
          <form className='flex w-full flex-col space-y-6 rounded-lg bg-card p-8 shadow-lg'>
            <div className='space-y-2 text-center'>
              <h1 className='text-3xl font-bold'>Sign up</h1>
              <p className='text-sm text-muted-foreground'>
                Already have an account?{' '}
                <Link
                  className='font-medium text-primary underline'
                  href='/sign-in'
                >
                  Sign in
                </Link>
              </p>
            </div>
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
                <Label htmlFor='password' className='text-base'>
                  Password
                </Label>
                <Input
                  type='password'
                  name='password'
                  id='password'
                  placeholder='Your password'
                  minLength={6}
                  required
                  className='text-base'
                />
              </div>
              <SubmitButton
                formAction={signUpAction}
                pendingText='Signing up...'
                className='w-full text-base'
              >
                Sign up
              </SubmitButton>
              <FormMessage message={searchParams} />
            </div>
          </form>
          <SmtpMessage />
        </div>
      </div>
    </div>
  );
}
