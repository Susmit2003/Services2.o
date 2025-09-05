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