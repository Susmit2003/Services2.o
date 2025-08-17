// "use client";

// import { useState, useTransition } from 'react';
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";
// import { updateServiceStatus } from '@/lib/actions/service.actions';
// import { Loader2 } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// interface ServiceStatusToggleProps {
//   serviceId: string; // The component requires this prop
//   initialStatus: 'Active' | 'Inactive';
// }

// export function ServiceStatusToggle({ serviceId, initialStatus }: ServiceStatusToggleProps) {
//   const [isActive, setIsActive] = useState(initialStatus === 'Active');
//   const [isPending, startTransition] = useTransition();
//   const { toast } = useToast();
//   const router = useRouter();

//   const handleToggle = (checked: boolean) => {
//     startTransition(async () => {
//       const newStatus = checked ? 'Active' : 'Inactive';

//       try {
//         // --- FIX: Add a definitive check for the serviceId prop ---
//         if (!serviceId) {
//           throw new Error("Service ID is missing. Cannot update status.");
//         }
        
//         const result = await updateServiceStatus(serviceId, newStatus);
        
//         if (result && 'error' in result) {
//           throw new Error(result.error as string);
//         }
        
//         setIsActive(checked);
//         toast({
//           title: "Status Updated",
//           description: `Service is now ${newStatus.toLowerCase()}.`,
//         });
        
//         router.refresh(); // Refresh the server component data

//       } catch (error) {
//         toast({
//           title: "Update Failed",
//           description: (error as Error).message,
//           variant: "destructive",
//         });
//         setIsActive(!checked); // Revert the switch on error
//       }
//     });
//   };

//   return (
//     <div className="flex items-center space-x-2">
//       <Switch
//         id={`status-toggle-${serviceId}`}
//         checked={isActive}
//         onCheckedChange={handleToggle}
//         disabled={isPending}
//         aria-readonly
//       />
//       <Label htmlFor={`status-toggle-${serviceId}`} className="flex items-center cursor-pointer">
//         {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//         <span className={isActive ? "text-green-600 font-semibold" : "text-gray-500"}>
//             {isActive ? 'Active' : 'Inactive'}
//         </span>
//       </Label>
//     </div>
//   );
// }







"use client";

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateServiceStatus } from '@/lib/actions/service.actions';
import { useRouter } from 'next/navigation';

interface ServiceStatusToggleProps {
  serviceId: string;
  initialStatus: 'Active' | 'Inactive';
}

export function ServiceStatusToggle({ serviceId, initialStatus }: ServiceStatusToggleProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(initialStatus === 'Active');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    const newStatus = checked ? 'Active' : 'Inactive';
    try {
      await updateServiceStatus(serviceId, newStatus);
      setIsActive(checked);
      toast({
        title: "Status Updated",
        description: `Service is now ${newStatus.toLowerCase()}.`,
      });
      router.refresh(); // Refresh the page to show any changes
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
      // Revert the switch on failure
      setIsActive(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`status-toggle-${serviceId}`}
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <Label htmlFor={`status-toggle-${serviceId}`} className={isActive ? 'text-green-600' : 'text-muted-foreground'}>
        {isLoading ? 'Updating...' : (isActive ? 'Active' : 'Inactive')}
      </Label>
    </div>
  );
}