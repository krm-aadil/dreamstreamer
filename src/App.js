import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import {
  Authenticator,
  View,
  Image,
  Text,
  Button,
  Heading,
  ThemeProvider,
  TextField,
  useAuthenticator,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './index.css'; // Import the custom styles
import awsExports from './aws-exports';
import Home from './pages/Home';
import DreamStreamer from './components/DreamStreamer/DreamStreamer';
import { fetchAuthSession } from '@aws-amplify/auth';

// Import admin components
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import UploadAlbum from './components/Admin/UploadAlbum';
import EditAlbums from './components/Admin/EditAlbums';
import ViewAlbums from './components/Admin/ViewAlbums';

// Import artist components
import ViewArtists from './components/Admin/ViewArtists';
import UploadArtist from './components/Admin/UploadArtist';
import EditArtists from './components/Admin/EditArtists';

// Import genre components
import ViewGenres from './components/Admin/ViewGenres'; 
import UploadGenre from './components/Admin/UploadGenre'; 
import EditGenres from './components/Admin/EditGenres'; 

//import inventory report path
import Inventory from './components/Admin/Inventory';

Amplify.configure(awsExports);

// Define custom cyan and white theme
const theme = {
  name: 'custom-cyan-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          '10': '#E0F7FA',
          '80': '#00838F',
          '100': '#006064', // Cyan shade
        },
        secondary: {
          '10': '#FFFFFF',
          '100': '#FFFFFF', // White
        },
      },
      background: {
        primary: {
          '100': '#FFFFFF', // White background
        },
      },
    },
    fonts: {
      default: {
        family: '"Poppins", sans-serif',
        size: {
          medium: '16px',
          large: '18px',
        },
      },
    },
    components: {
      button: {
        backgroundColor: { primary: { value: '#006064' } }, // Cyan button
        color: { primary: { value: '#FFFFFF' } }, // White text
        borderRadius: { value: '8px' },
        padding: { value: '12px 24px' },
        fontWeight: { value: '600' },
      },
      input: {
        backgroundColor: { value: '#E0F7FA' }, // Light cyan input field
        borderColor: { value: '#00838F' }, // Dark cyan border
        color: { value: '#006064' }, // Cyan text
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
          src="https://github.com/krm-aadil/GIT-IMAGES/blob/main/Black_and_pink_Circle_Music_Logo-removebg-preview.png?raw=true"
          height="120px"
          marginBottom="20px"
        />
      </View>
    );
  },
  Footer() {
    return (
      <View textAlign="center" padding="large">
        <Text color="#00838F">&copy; {new Date().getFullYear()} DreamStreamer. All Rights Reserved.</Text>
      </View>
    );
  },
  SignIn: {
    Header() {
      return (
        <Heading level={3} textAlign="center" marginBottom="medium">
          Welcome Back! Sign in to continue
        </Heading>
      );
    },
    Footer() {
      const { toResetPassword } = useAuthenticator();
      return (
        <View textAlign="center">
          <Button onClick={toResetPassword} size="small" variation="link">
            Forgot your password?
          </Button>
        </View>
      );
    },
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
          <Authenticator.SignUp.FormFields exclude={['password', 'confirm_password']} />
          <TextField label="Full Name" placeholder="Enter your full name" name="name" required />
          <TextField label="Gender" placeholder="Enter your gender" name="gender" required />
          <TextField label="Birthdate" placeholder="Enter your birthdate" name="birthdate" type="date" required />
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
        
        {/* Album Routes */}
        <Route path="albums/view" element={<ViewAlbums />} />
        <Route path="albums/upload" element={<UploadAlbum />} />
        <Route path="albums/edit" element={<EditAlbums />} />
        
        {/* Artist Routes */}
        <Route path="artists/view" element={<ViewArtists />} />
        <Route path="artists/upload" element={<UploadArtist />} />
        <Route path="artists/edit" element={<EditArtists />} />
        
        {/* Genre Routes */}
        <Route path="genres/view" element={<ViewGenres />} />
        <Route path="genres/upload" element={<UploadGenre />} />
        <Route path="genres/edit" element={<EditGenres />} />

        {/* Inventory Report */}
        <Route path="inventory" element={<Inventory />} />
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
            {route === 'signIn' || route === 'signUp' || route === 'confirmSignUp' ? (
              <div
                style={{
                  display: 'flex',
                  minHeight: '100vh',
                  backgroundColor: '#006064', // Cyan background
                }}
              />
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
