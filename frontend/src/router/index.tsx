import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import NavBar from '../components/layout/NavBar';
import BottomTabBar from '../components/layout/BottomTabBar';
import SkeletonLoader from '../components/common/SkeletonLoader';
import NotFound from '../features/not-found/NotFound';

// Lazy-loaded screens
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const LeaderboardPage = lazy(() => import('../features/leaderboard/LeaderboardPage'));
const PlayerProfilePage = lazy(() => import('../features/profile/PlayerProfilePage'));
const GamesPage = lazy(() => import('../features/games/GamesPage'));
const FriendsPage = lazy(() => import('../features/friends/FriendsPage'));
const AddGamePage = lazy(() => import('../features/add-game/AddGamePage'));

const LoadingFallback = () => (
  <div className="p-6 space-y-4">
    <SkeletonLoader variant="stat" count={3} />
  </div>
);

const Layout: React.FC = () => (
  <div className="min-h-screen flex flex-col">
    <NavBar />
    <main className="flex-1 md:pt-16 pb-24 md:pb-6 px-4 md:px-6 max-w-4xl mx-auto w-full">
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </AnimatePresence>
    </main>
    <BottomTabBar />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <PageTransition>
            <DashboardPage />
          </PageTransition>
        ),
      },
      {
        path: 'leaderboard',
        element: (
          <PageTransition>
            <LeaderboardPage />
          </PageTransition>
        ),
      },
      {
        path: 'players/:uid',
        element: (
          <PageTransition>
            <PlayerProfilePage />
          </PageTransition>
        ),
      },
      {
        path: 'games',
        element: (
          <PageTransition>
            <GamesPage />
          </PageTransition>
        ),
      },
      {
        path: 'friends',
        element: (
          <PageTransition>
            <FriendsPage />
          </PageTransition>
        ),
      },
      {
        path: 'add-game',
        element: (
          <PageTransition>
            <AddGamePage />
          </PageTransition>
        ),
      },
      {
        path: '*',
        element: (
          <PageTransition>
            <NotFound />
          </PageTransition>
        ),
      },
    ],
  },
]);
