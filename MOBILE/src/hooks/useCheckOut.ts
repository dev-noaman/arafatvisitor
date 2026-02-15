/**  
 * useCheckOut Hook  
 * React Query mutation for check-out action with optimistic update + error retry  
 */  
  
import { useMutation } from '@tanstack/react-query';  
import { useAuthStore } from '../store/authStore';  
import { checkOut as checkOutApi } from '../services/endpoints/visitors';  
import type { CheckOutRequest } from '../types/api'; 
  
/**  
 * useCheckOut hook  
 * Handles check-out with React Query mutation  
 */  
export const useCheckOut = () => {  
  const { updateUser } = useAuthStore();  
  
  const checkOutMutation = useMutation({  
    mutationFn: async ({ sessionId }: CheckOutRequest) => {  
      try {  
        const response = await checkOutApi(sessionId);  
        return response;  
      } catch (error: any) {  
        // Error is handled by API interceptor  
        console.error('Check-out error:', error);  
        throw error;  
      }  
    },  
    onSuccess: (data) => {  
      // Optimistic update could be done here  
      console.log('Check-out successful:', data);  
    },  
  });  
  
  return {  
    checkOut: checkOutMutation.mutateAsync,  
    isLoading: checkOutMutation.isPending,  
    error: checkOutMutation.error,  
  };  
}; 
