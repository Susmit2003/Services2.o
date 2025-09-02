
// // "use client";

// // import { useState } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { Button } from '@/components/ui/button';
// // import { Loader2, Archive } from 'lucide-react';
// // import {
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// //   AlertDialogTrigger,
// // } from "@/components/ui/alert-dialog";
// // import { useToast } from '@/hooks/use-toast';
// // import { archiveService } from '@/lib/actions/service.actions';

// // interface ArchiveServiceButtonProps {
// //     serviceId: string;
// //     serviceTitle: string;
// //     isArchived: boolean;
// // }

// // export function ArchiveServiceButton({ serviceId, serviceTitle, isArchived }: ArchiveServiceButtonProps) {
// //     const [isLoading, setIsLoading] = useState(false);
// //     const { toast } = useToast();
// //     const router = useRouter();

// //     const handleArchive = async () => {
// //         setIsLoading(true);
// //         try {
// //             await archiveService(serviceId);
// //             toast({
// //                 title: "Service Archived",
// //                 description: `"${serviceTitle}" has been archived and is no longer public.`,
// //             });
// //             router.refresh();
// //         } catch (error) {
// //             toast({
// //                 title: "Error",
// //                 description: "Could not archive service. Please try again.",
// //                 variant: "destructive",
// //             });
// //             setIsLoading(false);
// //         }
// //     }

// //     return (
// //         <AlertDialog>
// //           <AlertDialogTrigger asChild>
// //             <Button variant="destructive" size="icon" title="Archive Service" disabled={isArchived || isLoading}>
// //               <Archive className="h-4 w-4" />
// //             </Button>
// //           </AlertDialogTrigger>
// //           <AlertDialogContent>
// //             <AlertDialogHeader>
// //               <AlertDialogTitle>Are you sure you want to archive this service?</AlertDialogTitle>
// //               <AlertDialogDescription>
// //                 This will make your service "{serviceTitle}" inactive and it will no longer be bookable by new customers. This action cannot be undone. Existing bookings will not be affected.
// //               </AlertDialogDescription>
// //             </AlertDialogHeader>
// //             <AlertDialogFooter>
// //               <AlertDialogCancel>Cancel</AlertDialogCancel>
// //               <AlertDialogAction onClick={handleArchive} disabled={isLoading}>
// //                 {isLoading ? <Loader2 className="animate-spin" /> : "Yes, Archive Service"}
// //               </AlertDialogAction>
// //             </AlertDialogFooter>
// //           </AlertDialogContent>
// //         </AlertDialog>
// //     );
// // }






// "use client";

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
// import { Trash2, Loader2 } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { archiveService } from '@/lib/actions/service.actions';
// import { useRouter } from 'next/navigation';

// interface DeleteServiceButtonProps {
//   serviceId: string;
// }

// export function DeleteServiceButton({ serviceId }: DeleteServiceButtonProps) {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleDelete = async () => {
//     setIsLoading(true);
//     try {
//       await archiveService(serviceId);
//       toast({
//         title: "Service Archived",
//         description: "The service has been removed from your active list.",
//       });
//       router.refresh();
//     } catch (error: any) {
//       toast({
//         title: "Deletion Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AlertDialog>
//       <AlertDialogTrigger asChild>
//         <Button variant="ghost" size="icon" disabled={isLoading}>
//           <Trash2 className="h-4 w-4 text-destructive" />
//         </Button>
//       </AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//           <AlertDialogDescription>
//             This action will archive the service, making it inactive and hidden from customers. It will not delete existing bookings.
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel>Cancel</AlertDialogCancel>
//           <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
//             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Yes, Archive Service
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }





"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Archive, ArchiveRestore, Loader2 } from 'lucide-react';
import { archiveService, unarchiveService } from '@/lib/actions/service.actions';

// ✅ FIX: Add serviceTitle to the props interface
interface DeleteServiceButtonProps {
  serviceId: string;
  serviceTitle: string; 
  isArchived: boolean;
}

export function DeleteServiceButton({ serviceId, serviceTitle, isArchived }: DeleteServiceButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      if (isArchived) {
        await unarchiveService(serviceId);
        toast({ title: "Service Restored", description: `"${serviceTitle}" is now visible again.` });
      } else {
        await archiveService(serviceId);
        toast({ title: "Service Archived", description: `"${serviceTitle}" has been moved to the archive.` });
      }
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const actionText = isArchived ? "Restore" : "Archive";
  const ActionIcon = isArchived ? ArchiveRestore : Archive;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={isArchived ? "outline" : "destructive"} size="icon" title={actionText}>
          <ActionIcon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          {/* ✅ FIX: Use the serviceTitle in the description for better user experience */}
          <AlertDialogDescription>
            {isArchived
              ? `This will restore the service "${serviceTitle}" and make it available for status changes.`
              : `This action will archive the service "${serviceTitle}". It will not be publicly visible.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : `Yes, ${actionText}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}