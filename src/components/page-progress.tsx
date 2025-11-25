'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/router';

import NProgress from 'nprogress';

/**
 * Global page loading progress bar component.
 *
 * Displays a thin progress bar at the top of the page during route transitions.
 * Uses NProgress library for smooth animations.
 */
export function PageProgress() {
  const router = useRouter();

  useEffect(() => {
    // Configure NProgress
    NProgress.configure({
      showSpinner: false, // Hide the spinner, only show the bar
      trickleSpeed: 100, // Speed of the progress bar animation
      minimum: 0.08, // Minimum percentage used upon starting
    });

    const handleStart = () => {
      NProgress.start();
    };

    const handleComplete = () => {
      NProgress.done();
    };

    // Listen to route change events
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    // Cleanup listeners on unmount
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router.events]);

  return null; // This component doesn't render anything visible
}
