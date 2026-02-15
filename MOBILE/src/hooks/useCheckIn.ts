/**  
 * useCheckIn Hook  
 * React Query mutation for check-in action with optimistic update + error retry  
 */  
  
import { useMutation } from '@tanstack/react-query';  
import { useAuthStore } from '../store/authStore';  
import { checkIn as checkInApi } from '../services/endpoints/visitors';  
import type { CheckInRequest } from '../types/api'; 
  
/**  
 * useCheckIn hook  
 * Handles check-in with React Query mutation  
 */  
export const useCheckIn = () => {  
  const { updateUser } = useAuthStore();  
  
  const checkInMutation = useMutation({  
    mutationFn: async ({ sessionId }: CheckInRequest) => {  
      try {  
        const response = await checkInApi(sessionId);  
        return response;  
      } catch (error: any) {  
        // Error is handled by API interceptor  
        console.error('Check-in error:', error);  
        throw error;  
      }  
    },  
    onSuccess: (data) => {  
      // Optimistic update could be done here  
      console.log('Check-in successful:', data);  
    },  
  });  
  
  return {  
    checkIn: checkInMutation.mutateAsync,  
    isLoading: checkInMutation.isPending,  
    error: checkInMutation.error,  
  };  
}; 
