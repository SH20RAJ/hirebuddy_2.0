import { Navigate } from 'react-router-dom';

const SignIn = () => {
  // Simply redirect to home page when sign-in page is accessed directly
  return <Navigate to="/" replace />;
};

export default SignIn;