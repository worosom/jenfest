import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUnreadMessages } from "../hooks/useUnreadMessages";
import { useJENbucks } from "../hooks/useJENbucks";
import {
  Map,
  Calendar,
  User,
  LogOut,
  LogIn,
  Plus,
  Home as HomeIcon,
  Users,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import MapView from "./MapView";
import Feed from "./Feed";
import Schedule from "./Schedule";
import Profile from "./Profile";
import UsersDirectory from "./UsersDirectory";
import UserProfile from "./UserProfile";
import PostDetail from "./PostDetail";
import TermsOfService from "./TermsOfService";
import PrivacyPolicy from "./PrivacyPolicy";
import CookiePolicy from "./CookiePolicy";
import AdminTools from "./AdminTools";
import PostFormModal from "../components/PostFormModal";
import LoginModal from "../components/LoginModal";
import DirectMessagesModal from "../components/DirectMessagesModal";
import WelcomeModal from "../components/HelpModal";
import AudioPlayer from "../components/AudioPlayer";
import OfflineIndicator from "../components/OfflineIndicator";

const Home = () => {
  const { user, signOut } = useAuth();
  const unreadCount = useUnreadMessages();
  const { balance } = useJENbucks();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  // Check if this is the user's first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem("jenfest_visited");
    if (!hasVisited) {
      setIsWelcomeOpen(true);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleProfileClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      navigate("/profile");
    }
  };

  const handleCreatePostClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      setIsCreatePostOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
  };

  const handleViewUserProfile = (userId) => {
    navigate(`/user/${userId}`);
  };

  // Check if we're on a legal page (hide nav/footer)
  const isLegalPage =
    location.pathname === "/terms" ||
    location.pathname === "/privacy" ||
    location.pathname === "/cookies";

  return (
    <div className="h-[100dvh] bg-[var(--color-bg-primary)] flex flex-col overflow-hidden">
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Header */}
      {!isLegalPage && (
        <header className="bg-[var(--color-leather-dark)] shadow-lg border-b border-[var(--color-leather)] flex-shrink-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <Link to="/" className="flex-shrink-0">
              <img
                src="/jenfest_logo2.png"
                alt="Jenfest"
                className="h-10 object-contain cursor-pointer"
              />
            </Link>

            {/* Audio Player */}
            <AudioPlayer src="/remfest_4.0_theme_song.m4a" />

            {user ? (
              <div className="flex items-center gap-2">
                {/* JENbucks Balance */}
                <div className="flex items-center gap-1 bg-[var(--color-sunset-orange)] text-white px-2 py-1 rounded-full font-bold text-sm">
                  <img src="/jenbucks.png" alt="JENbucks" className="w-5 h-5" />
                  <span>{balance}</span>
                </div>
                
                <button
                  onClick={() => setIsWelcomeOpen(true)}
                  className="p-2 text-[var(--color-sand)] hover:text-[var(--color-sand-light)] hover:bg-[var(--color-leather)] rounded-lg transition-colors flex items-center gap-2"
                  title="Help"
                >
                  <HelpCircle size={20} />
                  <span className="text-sm font-medium hidden sm:inline">
                    Help
                  </span>
                </button>
                <button
                  onClick={() => setIsMessagesOpen(true)}
                  className="p-2 text-[var(--color-sand)] hover:text-[var(--color-sand-light)] hover:bg-[var(--color-leather)] rounded-lg transition-colors flex items-center gap-2 relative"
                  title="Messages"
                >
                  <MessageCircle size={20} />
                  <span className="text-sm font-medium hidden sm:inline">
                    Messages
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      !
                    </span>
                  )}
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-[var(--color-sand)] hover:text-[var(--color-sand-light)] hover:bg-[var(--color-leather)] rounded-lg transition-colors flex items-center gap-2"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium hidden sm:inline">
                    Sign Out
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWelcomeOpen(true)}
                  className="p-2 text-[var(--color-sand)] hover:text-[var(--color-sand-light)] hover:bg-[var(--color-leather)] rounded-lg transition-colors flex items-center gap-2"
                  title="Help"
                >
                  <HelpCircle size={20} />
                  <span className="text-sm font-medium hidden sm:inline">
                    Help
                  </span>
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="p-2 text-[var(--color-sunset-orange)] hover:text-[var(--color-sunset-pink)] hover:bg-[var(--color-leather)] rounded-lg transition-colors flex items-center gap-2"
                  title="Sign In"
                >
                  <LogIn size={20} />
                  <span className="text-sm font-medium hidden sm:inline">
                    Sign In
                  </span>
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Keep MapView mounted but hidden to preserve map state */}
        <div style={{ display: location.pathname === '/map' ? 'block' : 'none', height: '100%' }}>
          <MapView onViewUserProfile={handleViewUserProfile} />
        </div>
        
        <Routes>
          <Route
            path="/"
            element={
              <Feed
                onViewUserProfile={handleViewUserProfile}
                onNavigateToMap={(location, postId) =>
                  navigate("/map", {
                    state: {
                      centerLocation: location,
                      highlightMarkerId: postId ? `post-${postId}` : null,
                    },
                  })
                }
              />
            }
          />
          <Route
            path="/map"
            element={<div />}
          />
          <Route
            path="/schedule"
            element={<Schedule onViewUserProfile={handleViewUserProfile} />}
          />
          <Route
            path="/users"
            element={
              <UsersDirectory onViewUserProfile={handleViewUserProfile} />
            }
          />
          <Route
            path="/profile"
            element={
              user ? (
                <Profile
                  onNavigateToMap={(location) =>
                    navigate("/map", { state: { centerLocation: location } })
                  }
                />
              ) : (
                <Feed
                  onViewUserProfile={handleViewUserProfile}
                  onNavigateToMap={(location, postId) =>
                    navigate("/map", {
                      state: {
                        centerLocation: location,
                        highlightMarkerId: postId ? `post-${postId}` : null,
                      },
                    })
                  }
                />
              )
            }
          />
          <Route
            path="/user/:userId"
            element={
              <UserProfile
                onBack={() => navigate(-1)}
                onNavigateToMap={(location) =>
                  navigate("/map", { state: { centerLocation: location } })
                }
              />
            }
          />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route
            path="/terms"
            element={<TermsOfService onBack={() => navigate(-1)} />}
          />
          <Route
            path="/privacy"
            element={<PrivacyPolicy onBack={() => navigate(-1)} />}
          />
          <Route
            path="/cookies"
            element={<CookiePolicy onBack={() => navigate(-1)} />}
          />
          <Route
            path="/admin"
            element={user ? <AdminTools /> : <Feed onViewUserProfile={handleViewUserProfile} onNavigateToMap={(location, postId) => navigate("/map", { state: { centerLocation: location, highlightMarkerId: postId ? `post-${postId}` : null } })} />}
          />
        </Routes>
      </main>

      {/* Floating Action Button */}
      {!isLegalPage && (
        <button
          onClick={handleCreatePostClick}
          className="fixed bottom-20 right-6 bg-[var(--color-clay)] text-white p-4 rounded-full shadow-lg hover:bg-[var(--color-clay-dark)] transition-all hover:scale-110 z-20"
          title="Create Post"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Create Post Modal */}
      {user && (
        <PostFormModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Direct Messages Modal */}
      {user && (
        <DirectMessagesModal
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
        />
      )}

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
      />

      {/* Bottom Navigation - Fixed */}
      {!isLegalPage && (
        <nav className="bg-[var(--color-leather-dark)] border-t border-[var(--color-leather)] shadow-lg flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around items-center h-16">
              <NavButton
                to="/"
                icon={<HomeIcon size={24} />}
                label="Feed"
                active={location.pathname === "/"}
              />
              <NavButton
                to="/map"
                icon={<Map size={24} />}
                label="Map"
                active={location.pathname === "/map"}
              />
              <NavButton
                to="/schedule"
                icon={<Calendar size={24} />}
                label="Schedule"
                active={location.pathname === "/schedule"}
              />
              <NavButton
                to="/users"
                icon={<Users size={24} />}
                label="People"
                active={location.pathname === "/users"}
              />
              <NavButton
                onClick={handleProfileClick}
                icon={<User size={24} />}
                label="Profile"
                active={location.pathname === "/profile"}
              />
            </div>
          </div>

          {/* Footer Links */}
          <div className="border-t border-[var(--color-leather)] py-1">
            <div className="flex justify-center gap-4 text-[.5rem] text-[var(--color-sand)]">
              <span className="hover:text-[var(--color-sand-light)] transition-colors">
                Jenfest 2025
              </span>
              <span className="text-[var(--color-warm-gray-500)]">|</span>
              <Link
                to="/terms"
                className="hover:text-[var(--color-sand-light)] transition-colors"
              >
                Terms
              </Link>
              <span className="text-[var(--color-warm-gray-500)]">|</span>
              <Link
                to="/privacy"
                className="hover:text-[var(--color-sand-light)] transition-colors"
              >
                Privacy
              </Link>
              <span className="text-[var(--color-warm-gray-500)]">|</span>
              <Link
                to="/cookies"
                className="hover:text-[var(--color-sand-light)] transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

const NavButton = ({ to, onClick, icon, label, active }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          active
            ? "text-[var(--color-sunset-orange)] bg-[var(--color-leather)]"
            : "text-[var(--color-sand)] hover:text-[var(--color-sand-light)] hover:bg-[var(--color-leather)]"
        }`}
      >
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
        active
          ? "text-[var(--color-sunset-orange)] bg-[var(--color-leather)]"
          : "text-[var(--color-sand)] hover:text-[var(--color-sand-light)] hover:bg-[var(--color-leather)]"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
};

export default Home;