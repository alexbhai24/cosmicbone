import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { VideoModal } from './components/modals/VideoModal';
import { DocModal } from './components/modals/DocModal';
import { BookModal } from './components/modals/BookModal';
import { TestModal } from './components/modals/TestModal';
import { AuthPage } from './pages/AuthPage';
import { VerificationPage } from './pages/VerificationPage';
import { ProfileSetupModal } from './components/modals/ProfileSetupModal';
import { ProfileSettingsModal } from './components/modals/ProfileSettingsModal';
import { CommentsModal } from './components/modals/CommentsModal';
import { StreakDrawer } from './components/drawers/StreakDrawer';
import { AppleShopDrawer } from './components/drawers/AppleShopDrawer';
import { AdminConsoleModal } from './components/modals/AdminConsoleModal';
import { SavedItemsModal } from './components/modals/SavedItemsModal';
import { Bell, Loader2 } from 'lucide-react';
import { MobileBottomNav, BOTTOM_BAR_ROUTES } from './components/MobileBottomNav';

import { BoneAIFAB } from './components/bone-ai/BoneAIFAB';
import { BoneAIPopup } from './components/bone-ai/BoneAIPopup';

// Pages
const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const VideosPage = React.lazy(() => import('./pages/VideosPage').then(m => ({ default: m.VideosPage })));
const PostsPage = React.lazy(() => import('./pages/PostsPage').then(m => ({ default: m.PostsPage })));
const DocumentsPage = React.lazy(() => import('./pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })));
const BooksPage = React.lazy(() => import('./pages/BooksPage').then(m => ({ default: m.BooksPage })));
const TestsPage = React.lazy(() => import('./pages/TestsPage').then(m => ({ default: m.TestsPage })));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const GamesPage = React.lazy(() => import('./pages/GamesPage').then(m => ({ default: m.GamesPage })));
const StudyRoomsPage = React.lazy(() => import('./pages/StudyRoomsPage').then(m => ({ default: m.StudyRoomsPage })));
const AccessDeniedPage = React.lazy(() => import('./pages/AccessDeniedPage').then(m => ({ default: m.AccessDeniedPage })));
const FocusClockPage = React.lazy(() => import('./pages/FocusClockPage').then(m => ({ default: m.FocusClockPage })));
const LinkPage = React.lazy(() => import('./pages/LinkPage').then(m => ({ default: m.LinkPage })));
const FirestoreDashboardPage = React.lazy(() => import('./pages/FirestoreDashboardPage').then(m => ({ default: m.FirestoreDashboardPage })));
const CreatorPage = React.lazy(() => import('./pages/CreatorPage').then(m => ({ default: m.CreatorPage })));
const ToolsPage = React.lazy(() => import('./pages/ToolsPage').then(m => ({ default: m.ToolsPage })));
const SyllabusTrackerPage = React.lazy(() => import('./pages/SyllabusTrackerPage').then(m => ({ default: m.SyllabusTrackerPage })));
const FlashcardsPage = React.lazy(() => import('./pages/FlashcardsPage').then(m => ({ default: m.FlashcardsPage })));
const MistakeTrackerPage = React.lazy(() => import('./pages/MistakeTrackerPage').then(m => ({ default: m.MistakeTrackerPage })));
const PyqPage = React.lazy(() => import('./pages/PyqPage').then(m => ({ default: m.PyqPage })));
const MockTestsPage = React.lazy(() => import('./pages/MockTestsPage').then(m => ({ default: m.MockTestsPage })));
const TestInstructionsPage = React.lazy(() => import('./pages/TestInstructionsPage').then(m => ({ default: m.TestInstructionsPage })));
const NtaTestPage = React.lazy(() => import('./pages/NtaTestPage').then(m => ({ default: m.NtaTestPage })));
const SleepCyclePage = React.lazy(() => import('./pages/SleepCyclePage').then(m => ({ default: m.SleepCyclePage })));
const StudyTimeTrackerPage = React.lazy(() => import('./pages/StudyTimeTrackerPage').then(m => ({ default: m.StudyTimeTrackerPage })));
const MarksCalculatorPage = React.lazy(() => import('./pages/MarksCalculatorPage').then(m => ({ default: m.MarksCalculatorPage })));
const ExamCountdownPage = React.lazy(() => import('./pages/ExamCountdownPage').then(m => ({ default: m.ExamCountdownPage })));
const ScheduleDayPage = React.lazy(() => import('./pages/ScheduleDayPage').then(m => ({ default: m.ScheduleDayPage })));
const BiologyReadingPage = React.lazy(() => import('./pages/BiologyReadingPage').then(m => ({ default: m.BiologyReadingPage })));
const QuestionPracticePage = React.lazy(() => import('./pages/QuestionPracticePage').then(m => ({ default: m.QuestionPracticePage })));
const HabitRadarPage = React.lazy(() => import('./pages/HabitRadarPage').then(m => ({ default: m.HabitRadarPage })));
const BoneAIPage = React.lazy(() => import('./pages/BoneAIPage').then(m => ({ default: m.BoneAIPage })));



const SUB_TOOL_ROUTES = [
  'bone-ai',
  'syllabus-tracker',
  'mistake-tracker',
  'flashcards',
  'habit-radar',
  'pyq',
  'mock-tests',
  'test-instructions',
  'nta-test',
  'sleep-cycle',
  'study-time-tracker',
  'marks-calculator',
  'exam-countdown',
  'schedule-day',
  'reading-practice',
  'link',
  'question-practice'
];

const AppContent: React.FC = () => {
  const {
    currentRoute,
    sidebarCollapsed,
    notificationMessage,
    user,
    updateUserProfile,
    isProfileSettingsOpen,
    isBoneAIOpen,
    setIsBoneAIOpen,
    isBoneAIEnabled,
    isSavedItemsOpen,
    setIsSavedItemsOpen,
    isStreakDrawerOpen,
    setIsStreakDrawerOpen,
    isAppleShopOpen,
    setIsAppleShopOpen,
    isAdminConsoleOpen,
    setIsAdminConsoleOpen,
    setIsProfileSettingsOpen,
    setIsSearchOpen,
    activeVideoModal,
    setActiveVideoModal,
    activeDocModal,
    setActiveDocModal,
    activeBookModal,
    setActiveBookModal,
    activeTestModal,
    setActiveTestModal,
  } = useApp();
  const { currentUser, authLoading, pendingVerificationEmail, userRole, userProfile } = useAuth();

  // Global Escape key listener — closes the innermost open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeVideoModal) { setActiveVideoModal(null); return; }
        if (activeDocModal) { setActiveDocModal(null); return; }
        if (activeBookModal) { setActiveBookModal(null); return; }
        if (activeTestModal) { setActiveTestModal(null); return; }
        if (isProfileSettingsOpen) { setIsProfileSettingsOpen(false); return; }
        if (isAdminConsoleOpen) { setIsAdminConsoleOpen(false); return; }
        if (isSavedItemsOpen) { setIsSavedItemsOpen(false); return; }
        if (isStreakDrawerOpen) { setIsStreakDrawerOpen(false); return; }
        if (isAppleShopOpen) { setIsAppleShopOpen(false); return; }
        if (isBoneAIOpen) { setIsBoneAIOpen(false); return; }
      }
      // Ctrl+K opens search
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeVideoModal, activeDocModal, activeBookModal, activeTestModal,
    isProfileSettingsOpen, isAdminConsoleOpen, isSavedItemsOpen,
    isStreakDrawerOpen, isAppleShopOpen, isBoneAIOpen,
    setActiveVideoModal, setActiveDocModal, setActiveBookModal, setActiveTestModal,
    setIsProfileSettingsOpen, setIsAdminConsoleOpen, setIsSavedItemsOpen,
    setIsStreakDrawerOpen, setIsAppleShopOpen, setIsBoneAIOpen,
    setIsSearchOpen,
  ]);

  // Lock body scroll whenever any modal/drawer is open
  useEffect(() => {
    const anyOpen = !!(
      activeVideoModal || activeDocModal || activeBookModal || activeTestModal ||
      isProfileSettingsOpen || isAdminConsoleOpen || isSavedItemsOpen ||
      isStreakDrawerOpen || isAppleShopOpen
    );
    document.body.classList.toggle('modal-open', anyOpen);
    return () => document.body.classList.remove('modal-open');
  }, [
    activeVideoModal, activeDocModal, activeBookModal, activeTestModal,
    isProfileSettingsOpen, isAdminConsoleOpen, isSavedItemsOpen,
    isStreakDrawerOpen, isAppleShopOpen,
  ]);



  // 2. Waiting for email verification
  if (pendingVerificationEmail) {
    return <VerificationPage />;
  }

  // 3. Not signed in → auth screen
  if (!currentUser && !authLoading) {
    return <AuthPage />;
  }

  // 4. Signed in but profile setup not completed
  if (currentUser && !user.setupComplete && userProfile && userProfile.setupComplete === false) {
    return <ProfileSetupModal />;
  }

  // 5. Signed in + verified + setup complete → dashboard
  const renderRoute = () => {
    switch (currentRoute) {
      case 'home': return <HomePage />;
      case 'videos': return <VideosPage />;
      case 'posts': return <PostsPage />;
      case 'study-rooms': return <StudyRoomsPage />;
      case 'documents': return <DocumentsPage />;
      case 'books': return <BooksPage />;
      case 'games': return <GamesPage />;
      case 'tests':
      case 'test-series': return <TestsPage />;
      case 'portfolio': return <PortfolioPage />;
      case 'focus-clock': return <FocusClockPage />;
      case 'link': return <LinkPage />;
      case 'tools': return <ToolsPage />;
      case 'mistake-tracker': return <MistakeTrackerPage />;
      case 'flashcards': return <FlashcardsPage />;
      case 'syllabus-tracker': return <SyllabusTrackerPage />;
      case 'pyq': return <PyqPage />;
      case 'mock-tests': return <MockTestsPage />;
      case 'test-instructions': return <TestInstructionsPage />;
      case 'nta-test': return <NtaTestPage />;
      case 'sleep-cycle': return <SleepCyclePage />;
      case 'study-time-tracker': return <StudyTimeTrackerPage />;
      case 'marks-calculator': return <MarksCalculatorPage />;
      case 'exam-countdown': return <ExamCountdownPage />;
      case 'schedule-day': return <ScheduleDayPage />;
      case 'reading-room': return <BooksPage />;
      case 'reading-practice':
      case 'reading':
        return <BiologyReadingPage />;
      case 'question-practice':
        return <QuestionPracticePage />;
      case 'habit-radar':
        return <HabitRadarPage />;
      case 'bone-ai':
        return <BoneAIPage />;
      case 'creator-studio': return userRole === 'admin' ? <CreatorPage /> : <AccessDeniedPage />;
      case 'admin-dashboard':
      case 'admin-users':
        return userRole === 'admin' ? <FirestoreDashboardPage /> : <AccessDeniedPage />;
      default: return <HomePage />;
    }
  };

  const isFullScreenExamRoute = currentRoute === 'nta-test' || currentRoute === 'test-instructions';

  // Fullscreen distraction-free examination modes (NTA Test & Test Instructions)
  if (isFullScreenExamRoute) {
    return (
      <div
        className={`fixed inset-0 z-50 font-sans text-white select-none ${
          currentRoute === 'nta-test'
            ? 'h-screen overflow-hidden bg-[#0f111a]'
            : 'min-h-screen overflow-y-auto bg-[#1c1f2e]'
        }`}
      >
        {notificationMessage && (
          <div className="fixed bottom-6 right-6 z-[9999] px-4 py-3 bg-[var(--bg-surface-solid)] border border-[var(--color-cyan)]/50 text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center space-x-2.5 backdrop-blur-xl animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-cyan)]/15 border border-[var(--color-cyan)]/30 flex-shrink-0">
              <Bell className="w-3.5 h-3.5 text-[var(--color-cyan)]" />
            </div>
            <span className="flex-1 max-w-[220px] leading-snug">{notificationMessage}</span>
          </div>
        )}

        <div key={currentRoute} className="w-full min-h-full animate-in fade-in duration-150 ease-out">
          <React.Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>}>
            {renderRoute()}
          </React.Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-sans text-white select-none overflow-x-hidden">
      {/* Background Canvas */}
      <BackgroundCanvas />

      {/* Toast Notification — animated slide-in */}
      {notificationMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] px-4 py-3 bg-[var(--bg-surface-solid)] border border-[var(--color-cyan)]/50 text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center space-x-2.5 backdrop-blur-xl animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-cyan)]/15 border border-[var(--color-cyan)]/30 flex-shrink-0">
            <Bell className="w-3.5 h-3.5 text-[var(--color-cyan)]" />
          </div>
          <span className="flex-1 max-w-[220px] leading-snug">{notificationMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className={currentRoute === 'bone-ai' ? 'hidden lg:block' : ''}>
        <TopBar />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        className={`relative z-10 transition-[padding] duration-200 ease-out ${
          currentRoute === 'bone-ai'
            ? 'pt-0 lg:pt-20 pb-0 lg:pb-12 px-0 lg:px-8'
            : 'pt-20 pb-28 lg:pb-12 px-4 sm:px-8'
        } ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className={currentRoute === 'bone-ai' ? 'w-full h-full' : 'max-w-[1366px] mx-auto'}>
          {/* key triggers smooth hardware-accelerated fade transition */}
          <div key={currentRoute} className="w-full h-full animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
            <React.Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>}>
              {renderRoute()}
            </React.Suspense>
          </div>
        </div>
      </main>

      {/* Mobile floating bottom navigation (Only on selected routes: home, videos, tools) */}
      {BOTTOM_BAR_ROUTES.includes(currentRoute) && <MobileBottomNav />}

      {/* Modals */}
      <SearchModal />
      <VideoModal />
      <DocModal />
      <BookModal />
      <TestModal />
      <CommentsModal />
      <SavedItemsModal isOpen={isSavedItemsOpen} onClose={() => setIsSavedItemsOpen(false)} />
      {isProfileSettingsOpen && <ProfileSettingsModal />}
      <StreakDrawer />
      <AppleShopDrawer />
      <AdminConsoleModal />

      {/* Bone AI Floating Assistant (Hidden inside specific tools and whenever ANY popup/modal is open) */}
      {isBoneAIEnabled && !SUB_TOOL_ROUTES.includes(currentRoute) && !(
        activeVideoModal || activeDocModal || activeBookModal || activeTestModal ||
        isProfileSettingsOpen || isAdminConsoleOpen || isSavedItemsOpen ||
        isStreakDrawerOpen || isAppleShopOpen
      ) && (
        <>
          <BoneAIFAB isOpen={isBoneAIOpen} onClick={() => setIsBoneAIOpen(!isBoneAIOpen)} />
          <BoneAIPopup isOpen={isBoneAIOpen} onClose={() => setIsBoneAIOpen(false)} />
        </>
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MusicProvider>
          <AppContent />
        </MusicProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

