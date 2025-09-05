"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Save, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/actions/cloudinary.actions";
import { updateUserProfile } from "@/lib/actions/user.actions";
import { updateUserProfileSchema, UpdateUserProfileParams } from "@/lib/validations";
import Image from "next/image";
import type { UserProfile } from '@/types'; // <-- FIX: Import UserProfile
export const dynamic = 'force-dynamic';
type ProfileFormValues = Omit<UpdateUserProfileParams, 'profileImage'>;

export default function ProfilePage() {
    const { currentUser, isLoading: isAuthLoading, refetchUser } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(currentUser?.profileImage || null);

    const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
        resolver: zodResolver(updateUserProfileSchema.omit({ profileImage: true })),
        defaultValues: {
            username: '',
            fullName: '',
            email: '',
            mobile: '',
            address: { line1: '', city: '', pinCode: '' },
        },
    });

    useEffect(() => {
        if (currentUser) {
            reset({
                username: currentUser.username || '',
                fullName: currentUser.name || '',
                email: currentUser.email || '',
                mobile: currentUser.mobile || '',
                address: {
                    line1: currentUser.address?.line1 || '',
                    city: currentUser.address?.city || '',
                    pinCode: currentUser.address?.pinCode || '',
                }
            });
            setProfileImagePreview(currentUser.profileImage || null);
        }
    }, [currentUser, reset]);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                toast({ title: "File too large", description: "Please upload an image smaller than 4MB.", variant: "destructive" });
                return;
            }
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfileImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            let imageUrl: string | undefined | null = currentUser?.profileImage;

            if (profileImageFile) {
                const formData = new FormData();
                formData.append('image', profileImageFile);
                
                const uploadResult = await uploadImage(formData, '/profile');
                if ('error' in uploadResult) {
                    throw new Error(uploadResult.error || "Image upload failed.");
                }
                imageUrl = uploadResult.secure_url;
            }
            
            const payload: Partial<UserProfile> = {
                ...data,
                username: data.username || currentUser?.username || "",
                name: data.fullName,
                address: data.address
                    ? {
                        line1: data.address.line1 ?? "",
                        city: data.address.city ?? "",
                        pinCode: data.address.pinCode ?? "",
                    }
                    : undefined,
                profileImage: imageUrl === null ? undefined : imageUrl,
            };
            // console.log("Profile update payload:", payload);
            
            await updateUserProfile(payload);
            await refetchUser();

            toast({
                title: "Profile Updated",
                description: "Your profile information has been saved successfully.",
            });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isAuthLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    if (!currentUser) {
        return <p>Please log in to view your profile.</p>;
    }

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">My Profile</CardTitle>
                    <CardDescription>Manage your personal information and account settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Profile Image Section */}
                        <div className="space-y-2">
                            <Label className="text-base">Profile Picture</Label>
                            <div className="flex items-center gap-6">
                                <div className="relative h-24 w-24 rounded-full border-2 border-muted">
                                    {profileImagePreview ? (
                                        <Image src={profileImagePreview} alt="Profile" layout="fill" objectFit="cover" className="rounded-full" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-secondary">
                                            <User className="h-10 w-10 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <Button type="button" variant="outline">
                                        <UploadCloud className="mr-2 h-4 w-4"/>
                                        Change Picture
                                    </Button>
                                    <Input id="profileImage" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange}/>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Controller name="username" control={control} render={({ field }) => <Input id="username" {...field} />} />
                                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="fullName">Full Name</Label>
                                <Controller name="fullName" control={control} render={({ field }) => <Input id="fullName" {...field} />} />
                                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                            </div>
                             <div>
                                <Label htmlFor="email">Email</Label>
                                <Controller name="email" control={control} render={({ field }) => <Input id="email" type="email" {...field} readOnly className="cursor-not-allowed bg-muted/50" />} />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Controller name="mobile" control={control} render={({ field }) => <Input id="mobile" {...field} />} />
                                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-3">
                                <Label htmlFor="address.line1">Address Line 1</Label>
                                <Controller name="address.line1" control={control} render={({ field }) => <Input id="address.line1" {...field} />} />
                            </div>
                            <div>
                                <Label htmlFor="address.city">City</Label>
                                <Controller name="address.city" control={control} render={({ field }) => <Input id="address.city" {...field} />} />
                            </div>
                            <div>
                                <Label htmlFor="address.pinCode">PIN/ZIP Code</Label>
                                <Controller name="address.pinCode" control={control} render={({ field }) => <Input id="address.pinCode" {...field} />} />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting || !isDirty}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}