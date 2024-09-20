import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Authenticator, View, Image, Text, Button, Heading, ThemeProvider, Theme, TextField, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './index.css'; // Import the custom styles
import awsExports from './aws-exports';
import Home from './pages/Home';
import DreamStreamer from './components/DreamStreamer/DreamStreamer';
import { fetchAuthSession } from '@aws-amplify/auth';

// Import the admin components
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import UploadAlbum from './components/Admin/UploadAlbum';
import EditAlbum from './components/Admin/EditAlbum';

Amplify.configure(awsExports);

// Define custom purple theme
const theme: Theme = {
  name: 'custom-purple-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          '90': '#6200ea', // Primary purple color
        },
      },
    },
  },
};

// Custom components for header, footer, and forms
const components = {
  Header() {
    return (
      <View textAlign="center" padding="large">
        <Image
          alt="Custom Logo"
          src="https://github.com/krm-aadil/GIT-IMAGES/blob/main/Black_and_pink_Circle_Music_Logo-removebg-preview.png?raw=true"  // Replace with your logo URL
          height="120px"
          marginBottom="20px"
        />
      </View>
    );
  },
  Footer() {
    return (
      <View textAlign="center" padding="large">
        <Text>&copy; {new Date().getFullYear()} All Rights Reserved</Text>
      </View>
    );
  },
  SignUp: {
    Header() {
      return (
        <Heading level={3} textAlign="center" marginBottom="medium">
          Join Us! Create a new account
        </Heading>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View textAlign="center">
          <Button onClick={toSignIn} size="small" variation="link">
            Back to Sign In
          </Button>
        </View>
      );
    },
    FormFields() {
      return (
        <>
          {/* Default form fields excluding password and confirm_password */}
          <Authenticator.SignUp.FormFields exclude={['password', 'confirm_password']} />

          {/* Custom form fields */}
          <TextField
            label="Full Name"
            placeholder="Enter your full name"
            name="name"
            required
          />
          <TextField
            label="Gender"
            placeholder="Enter your gender"
            name="gender"
            required
          />
          <TextField
            label="Birthdate"
            placeholder="Enter your birthdate"
            name="birthdate"
            type="date"
            required
          />

          {/* Only Password field, Confirm Password removed */}
        </>
      );
    },
  },
};

// Customize form fields (placeholders, labels, etc.)
const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter your email',
      label: 'Email',
    },
    password: {
      placeholder: 'Enter your password',
      label: 'Password',
    },
  },
  signUp: {
    email: {
      placeholder: 'Your email address',
      label: 'Email Address',
    },
  },
};

// Component to handle protected routes
function ProtectedRoute({ children, requireAdmin }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  useEffect(() => {
    if (!isSessionChecked) {
      fetchAuthSession()
        .then((session) => {
          const accessToken = session.tokens?.accessToken?.toString();
          if (!accessToken) {
            console.error('Access Token is missing in the session object');
            navigate('/home', { replace: true });
            return;
          }

          const groups = session.tokens.accessToken.payload['cognito:groups'];
          if (groups && groups.includes('admin')) {
            setIsAdmin(true);
            navigate('/admin/dashboard', { replace: true });  // Redirect to admin dashboard
          } else {
            navigate('/dreamstreamer', { replace: true });  // Redirect to DreamStreamer for normal users
          }

          setIsAuthenticated(true);
          setIsSessionChecked(true);
        })
        .catch((error) => {
          console.error('Error fetching session:', error);
          navigate('/home', { replace: true });
        });
    }
  }, [isSessionChecked, navigate]);

  if (!isSessionChecked) {
    return null; // You can return a loading spinner here if desired
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function App({ signOut }) {
  return (
    <Routes>
      <Route path="/home" element={<Home signOut={signOut} />} />
      <Route
        path="/dreamstreamer"
        element={
          <ProtectedRoute requireAdmin={false}>
            <DreamStreamer signOut={signOut} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout signOut={signOut} />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<UploadAlbum />} />
        <Route path="edit" element={<EditAlbum />} />
      </Route>
    </Routes>
  );
}


function AppWithAuth() {
  return (
    <ThemeProvider theme={theme}>
      <Authenticator formFields={formFields} components={components}>
        {({ signOut, route }) => (
          <>
            {/* Check if the current route is for authentication pages */}
            {route === 'signIn' || route === 'signUp' || route === 'confirmSignUp' ? (
              <div
                style={{
                  display: 'flex',
                  minHeight: '100vh',
                  backgroundColor: 'black',
                }}
              >
      
              </div>
            ) : (
           
              <Router>
                <App signOut={signOut} />
              </Router>
            )}
          </>
        )}
      </Authenticator>
    </ThemeProvider>
  );
}

export default AppWithAuth;
