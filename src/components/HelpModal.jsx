import {
  X,
  Flame,
  Wrench,
  Sparkles,
  Calendar,
  Camera,
  MessageSquare,
  MapPin,
  Smartphone,
  Share,
} from "lucide-react";

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-sand-light)] border-2 border-[var(--color-leather)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--color-leather-dark)] p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/jenfest_logo2.png"
                alt="Jenfest"
                className="h-12 object-contain"
              />
              <h1 className="text-3xl font-bold text-[var(--color-sand-light)]">
                Welcome to Jenfest!
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-leather)] rounded-full transition-colors text-[var(--color-sand)]"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Core Guidelines */}
          <div className="bg-white border-2 border-[var(--color-clay)] rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Sparkles size={28} className="text-[var(--color-clay)]" />
              Core Guidelines
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Flame size={18} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text-primary)] mb-1">
                    Don't Make Fire
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Fire safety is everyone's responsibility. Follow all fire
                    guidelines.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Wrench size={18} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text-primary)] mb-1">
                    Don't Break Stuff
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Respect everyone's property and the shared spaces we enjoy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles size={18} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text-primary)] mb-1 uppercase">
                    Leave It Better Than You Found It
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    This is the golden rule. Clean up after yourself and help
                    maintain our beautiful space.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Get There */}
          <div className="bg-white border-2 border-[var(--color-sunset-orange)] rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <MapPin size={28} className="text-[var(--color-sunset-orange)]" />
              How to Get There
            </h2>

            <div className="space-y-4">
              <p className="text-[var(--color-text-primary)] text-lg text-center font-semibold">
                1293 County Road 207, Giddings, TX 78942, United States
              </p>

              <a
                href="https://www.google.com/maps/search/?api=1&query=1293+County+Road+207,+Giddings,+TX+78942,+United+States"
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-center items-center hover:opacity-80 transition-opacity"
              >
                <img
                  width="100"
                  height="100"
                  src="https://img.icons8.com/plasticine/100/google-maps.png"
                  alt="Open in Google Maps"
                />
              </a>
            </div>
          </div>

          {/* App Features */}
          <div className="bg-white border border-[var(--color-warm-gray-300)] rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
              How to Use This App
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MessageSquare
                  size={20}
                  className="text-[var(--color-clay)] mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    <strong className="text-[var(--color-text-primary)]">
                      Post Anything:
                    </strong>{" "}
                    Share your thoughts, funnies, photos, or whatever's on your
                    mind. Anyone can post!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar
                  size={20}
                  className="text-[var(--color-clay)] mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    <strong className="text-[var(--color-text-primary)]">
                      Create Activities:
                    </strong>{" "}
                    Planning something at your camp or a shared space? Post it
                    as an activity so others can find it and RSVP!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Camera
                  size={20}
                  className="text-[var(--color-clay)] mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    <strong className="text-[var(--color-text-primary)]">
                      Share Photos:
                    </strong>{" "}
                    Capture the memories! Share photos of the festival, your
                    camp, activities, or anything fun.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="text-[var(--color-clay)] mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    <strong className="text-[var(--color-text-primary)]">
                      Tag Locations:
                    </strong>{" "}
                    Set your camp location on the map and tag activities with
                    map locations so people can find you!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare
                  size={20}
                  className="text-[var(--color-clay)] mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    <strong className="text-[var(--color-text-primary)]">
                      Connect with Others:
                    </strong>{" "}
                    Visit profiles, send direct messages, and reply to posts.
                    Build the community!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <img src="/jenbucks.png" alt="JENbucks" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    <strong className="text-[var(--color-text-primary)]">
                      React with JENbucks:
                    </strong>{" "}
                    Everyone starts with 500 JENbucks! React to posts you love by spending JENbucks. 
                    Post authors earn the JENbucks spent on their posts. Use them wisely!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Spirit */}
          <div className="bg-gradient-to-r from-[var(--color-clay)] to-[var(--color-sunset-orange)] rounded-lg p-6 text-white shadow-md">
            <h2 className="text-xl font-bold mb-3">The Spirit of Jenfest</h2>
            <p className="text-lg leading-relaxed opacity-95 font-semibold">
              Have fun, don't be a narc.
            </p>
          </div>

          {/* Add to Home Screen Instructions */}
          <div className="bg-white border border-[var(--color-warm-gray-300)] rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Smartphone size={24} className="text-[var(--color-clay)]" />
              Add to Home Screen
            </h2>

            <p className="text-[var(--color-text-secondary)] text-sm mb-4">
              For the best experience, add Jenfest to your phone's home screen
              for quick access:
            </p>

            <div className="space-y-4">
              {/* iOS Instructions */}
              <div className="bg-[var(--color-sand-light)] rounded-lg p-4">
                <h3 className="font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <span>📱</span> iPhone/iPad (Safari)
                </h3>
                <ol className="text-[var(--color-text-secondary)] text-sm space-y-1 list-decimal list-inside">
                  <li>
                    Tap the <Share size={14} className="inline" /> Share button
                    at the bottom
                  </li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div className="bg-[var(--color-sand-light)] rounded-lg p-4">
                <h3 className="font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <span>🤖</span> Android (Chrome)
                </h3>
                <ol className="text-[var(--color-text-secondary)] text-sm space-y-1 list-decimal list-inside">
                  <li>Tap the ⋮ menu button in the top right</li>
                  <li>Tap "Add to Home screen" or "Install app"</li>
                  <li>Tap "Add" or "Install"</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-[var(--color-clay)] hover:bg-[var(--color-clay-dark)] text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg shadow-lg"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
