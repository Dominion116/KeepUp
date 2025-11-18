import { Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Navigation from './components/layout/Navigation';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

const App = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pb-16 md:pb-0 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <Navigation />
      <Toaster />
    </div>
  );
};

export default App;
