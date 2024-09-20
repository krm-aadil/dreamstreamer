import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';

const Home = () => {
  const navigate = useNavigate();
  const { toSignIn, toSignUp } = useAuthenticator(); // Use Amplify's hook to control the login/signup flows

  const handleLogin = () => {
    navigate('/dreamstreamer'); // Navigate to the /login route which contains the Amplify Authenticator
  };

  const handleSubscribe = () => {
    navigate('/dreamstreamer'); // Navigate to the /subscribe route for the sign-up flow
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center px-6">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-6xl font-bold text-turquoise mb-4">Welcome to DreamStreamer</h1>
        <p className="text-lg sm:text-xl text-pink-400 font-medium">
          The ultimate music streaming experience crafted just for you.
        </p>
      </header>

      {/* Services Section */}
      <section className="w-full max-w-6xl text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-semibold text-turquoise mb-8">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service 1 */}
          <div className="p-8 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">Unlimited Music Streaming</h3>
            <p className="text-md text-gray-300">
              Enjoy millions of songs from artists around the world. Curated playlists, radio stations, and more at your fingertips.
            </p>
          </div>

          {/* Service 2 */}
          <div className="p-8 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">Exclusive Content</h3>
            <p className="text-md text-gray-300">
              Get access to exclusive content from your favorite artists, including early releases and behind-the-scenes footage.
            </p>
          </div>

          {/* Service 3 */}
          <div className="p-8 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">Ad-Free Experience</h3>
            <p className="text-md text-gray-300">
              Stream music without any interruptions. No ads, just pure music all day, every day.
            </p>
          </div>

          {/* Service 4 */}
          <div className="p-8 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">Offline Listening</h3>
            <p className="text-md text-gray-300">
              Download your favorite songs and playlists to listen offline, anytime, anywhere — perfect for when you're on the go.
            </p>
          </div>

          {/* Service 5 */}
          <div className="p-8 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">Personalized Playlists</h3>
            <p className="text-md text-gray-300">
              Get personalized playlists tailored to your music taste. Discover new songs based on what you love.
            </p>
          </div>

          {/* Service 6 */}
          <div className="p-8 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">High-Quality Audio</h3>
            <p className="text-md text-gray-300">
              Experience music like never before with high-quality, lossless audio that brings every note to life.
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="w-full max-w-4xl text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-semibold text-turquoise mb-8">Join the DreamStreamer Family</h2>
        <p className="text-md sm:text-lg text-gray-300 mb-8">
          Get access to all these features and more by subscribing to our premium plan. Starting from just $9.99/month, 
          you can enjoy the full DreamStreamer experience, completely ad-free and with exclusive content. 
        </p>
        <Button onClick={handleSubscribe} variation="primary" className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-lg">
          Subscribe Now
        </Button>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <p className="text-lg sm:text-xl text-gray-300 mb-6">
          Already have an account? Log in now to continue your musical journey!
        </p>
        <Button onClick={handleLogin} variation="primary" className="bg-turquoise hover:bg-turquoise-dark text-white font-bold py-2 px-6 rounded-lg">
          Login
        </Button>
      </section>
    </div>
  );
};

export default Home;
