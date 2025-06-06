import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useMyLearning() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [error, setError] = useState(null);

  const fetchMyLearning = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/my-learning');
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setEnrolledCourses(data.enrolledCourses);
      } else {
        setError(data.error || 'Failed to fetch learning data');
      }
    } catch (error) {
      console.error('Error fetching my learning:', error);
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchMyLearning();
  }, [session, status, router, fetchMyLearning]);

  return {
    user,
    enrolledCourses,
    loading: status === "loading" || loading,
    error,
    refetch: fetchMyLearning
  };
}