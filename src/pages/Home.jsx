import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Map,
  Calendar,
  User,
  LogOut,
  LogIn,
  Plus,
  Home as HomeIcon,
  Users,
} from "lucide-react";
import MapView from "./MapView";
import Feed from "./Feed";
import Schedule from "./Schedule";
import Profile from "./Profile";
import UsersDirectory from "./UsersDirectory";
import UserProfile from "./UserProfile";
import CreatePostModal from "../components/CreatePostModal";
import LoginModal from "../components/LoginModal";

const Home = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState("feed");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentView("feed"); // Return to feed after sign out
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleProfileClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      setCurrentView("profile");
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
    // Keep the user on the current view or navigate to profile if that's what they clicked
  };

  const handleViewUserProfile = (userId) => {
    setViewingUserId(userId);
  };

  const handleBackFromUserProfile = () => {
    setViewingUserId(null);
  };

  const renderView = () => {
    // If viewing a user profile, show that
    if (viewingUserId) {
      return (
        <UserProfile
          userId={viewingUserId}
          onBack={handleBackFromUserProfile}
        />
      );
    }

    switch (currentView) {
      case "map":
        return <MapView onViewUserProfile={handleViewUserProfile} />;
      case "schedule":
        return <Schedule onViewUserProfile={handleViewUserProfile} />;
      case "users":
        return <UsersDirectory onViewUserProfile={handleViewUserProfile} />;
      case "profile":
        return user ? (
          <Profile />
        ) : (
          <Feed onViewUserProfile={handleViewUserProfile} />
        );
      default:
        return <Feed onViewUserProfile={handleViewUserProfile} />;
    }
  };

  return (
    <div className="h-screen bg-[var(--color-bg-primary)] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[var(--color-leather-dark)] shadow-lg border-b border-[var(--color-leather)] flex-shrink-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <img
            src="/jenfest_logo2.png"
            alt="JenFest"
            className="h-10 object-contain"
          />
          {user ? (
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
          ) : (
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
          )}
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {renderView()}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={handleCreatePostClick}
        className="fixed bottom-20 right-6 bg-[var(--color-clay)] text-white p-4 rounded-full shadow-lg hover:bg-[var(--color-clay-dark)] transition-all hover:scale-110 z-20"
        title="Create Post"
      >
        <Plus size={24} />
      </button>

      {/* Create Post Modal */}
      {user && (
        <CreatePostModal
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

      {/* Bottom Navigation - Fixed */}
      <nav className="bg-[var(--color-leather-dark)] border-t border-[var(--color-leather)] shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            <NavButton
              icon={<HomeIcon size={24} />}
              label="Feed"
              active={currentView === "feed"}
              onClick={() => setCurrentView("feed")}
            />
            <NavButton
              icon={<Map size={24} />}
              label="Map"
              active={currentView === "map"}
              onClick={() => setCurrentView("map")}
            />
            <NavButton
              icon={<Calendar size={24} />}
              label="Schedule"
              active={currentView === "schedule"}
              onClick={() => setCurrentView("schedule")}
            />
            <NavButton
              icon={<Users size={24} />}
              label="People"
              active={currentView === "users"}
              onClick={() => setCurrentView("users")}
            />
            <NavButton
              icon={<User size={24} />}
              label="Profile"
              active={currentView === "profile"}
              onClick={handleProfileClick}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
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

export default Home;

