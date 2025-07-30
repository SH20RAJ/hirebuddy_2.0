import { redirect } from 'next/navigation';

const SignIn = () => {
  // Simply redirect to home page when sign-in page is accessed directly
  return redirect('/');
};

export default SignIn;