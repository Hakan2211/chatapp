// app/routes/profile._index.tsx (or your profile index file)
import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  useOutletContext,
  useActionData,
  useNavigation,
  useSubmit, // Import useSubmit
} from 'react-router';
import type { User as PrismaUser } from '@prisma/client';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip';
import {
  Pencil,
  Check,
  X,
  AlertCircle,
  Save,
  Loader2,
  UserCircle,
  Camera,
  Trash2, // Added icons
} from 'lucide-react';
import type { ProfileActionData, ProfileLoaderData } from './profile'; // Ensure ProfileLoaderData is imported
import { formatUserDate } from '#/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'; // For displaying image

// ... (StyledTooltipContent from previous example)
const StyledTooltipContent = ({
  children,
  ...props
}: React.ComponentProps<typeof TooltipContent>) => (
  <TooltipContent
    sideOffset={5}
    className="bg-black/75 dark:bg-neutral-800/80 text-white dark:text-slate-200 text-xs rounded-md px-2.5 py-1.5 shadow-lg backdrop-blur-sm select-none"
    {...props}
  >
    {children}
  </TooltipContent>
);

interface ProfileOutletContext {
  // user: PrismaUser & { image?: { url: string | null } | null }; // More specific type from context
  user: ProfileLoaderData['user']; // Use the loader's user type
}

type EditableField = 'name' | 'username' | null;

export default function ProfileIndex() {
  const { user: initialUser } = useOutletContext<ProfileOutletContext>();
  const actionData = useActionData<ProfileActionData>();
  const navigation = useNavigation();
  const submit = useSubmit(); // For programmatic submission

  // Local state for user data to reflect optimistic updates or server changes
  const [user, setUser] = useState(initialUser);

  const [editingField, setEditingField] = useState<EditableField>(null);
  const [currentName, setCurrentName] = useState(user.name || '');
  const [currentUsername, setCurrentUsername] = useState(user.username || '');

  // Image upload state
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = navigation.state === 'submitting';
  const submittingIntent = navigation.formData?.get('intent');

  // Effect to update local user state when initialUser (from loader/context) changes
  // or when actionData indicates a successful image update with a new URL
  useEffect(() => {
    console.log('PROFILEINDEX: actionData received:', actionData);
    if (
      actionData?.success &&
      actionData.field === 'profileImage' &&
      actionData.updatedImageUrl
    ) {
      console.log(
        'PROFILEINDEX: Updating user image URL in local state to:',
        actionData.updatedImageUrl
      );
      setUser((prevUser) => ({
        ...prevUser,
        image: { url: actionData.updatedImageUrl! }, // Non-null assertion as it's checked
      }));
      setSelectedImageFile(null); // Clear selection after successful upload
      setImagePreviewUrl(null);
    } else if (!actionData?.success && actionData?.field === 'profileImage') {
      console.error(
        'PROFILEINDEX: Image update failed on client:',
        actionData.errors?.profileImage
      );
    } else if (
      initialUser !== user &&
      !(actionData?.success && actionData.field === 'profileImage')
    ) {
      // Only reset to initialUser if it actually changed AND it wasn't a profile image success
      setUser(initialUser);
    }
  }, [initialUser, actionData]);

  // Reset edit mode and local state for text fields
  useEffect(() => {
    // Update currentName and currentUsername based on the 'user' state (which might have updated image)
    console.log('PROFILEINDEX: Local user state after potential update:', user);
    setCurrentName(user.name || '');
    setCurrentUsername(user.username || '');

    if (
      actionData?.success &&
      (actionData.field === 'name' || actionData.field === 'username') &&
      actionData.field === editingField
    ) {
      setEditingField(null);
    }
  }, [user, actionData, editingField]);

  useEffect(() => {
    if (editingField === 'name' && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    } else if (editingField === 'username' && usernameInputRef.current) {
      usernameInputRef.current.focus();
      usernameInputRef.current.select();
    }
  }, [editingField]);

  const handleEdit = (field: 'name' | 'username') => {
    setEditingField(field);
    if (field === 'name') setCurrentName(user.name || '');
    if (field === 'username') setCurrentUsername(user.username || '');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setCurrentName(user.name || '');
    setCurrentUsername(user.username || '');
  };

  const handleImageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleImageUploadSubmit = () => {
    if (selectedImageFile) {
      const formData = new FormData();
      formData.append('intent', 'updateProfileImage');
      formData.append('profileImage', selectedImageFile);
      submit(formData, {
        method: 'post',
        encType: 'multipart/form-data',
        action: '/profile',
      });
    }
  };

  const cancelImageUpload = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = ''; // Reset file input
    }
  };

  const nameInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (
    name: string | null | undefined,
    username?: string | null | undefined
  ) => {
    const targetName = name || username;
    if (!targetName) return 'P'; // Profile
    return targetName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // For the main profile image display (not the preview)
  // Add a cache-busting query param to the image URL if it's an internal one
  // This is useful if the image content changes but the URL path remains the same.
  const profileImageUrl = user.image?.url
    ? user.image.url.startsWith('/') // Is it an internal URL?
      ? `${user.image.url}?v=${new Date(user.updatedAt).getTime()}` // Add version based on user updatedAt
      : user.image.url // External URL, use as is
    : null;

  const renderEditableField = (
    fieldLabel: string,
    // ... (rest of the function is the same as before, ensure it uses handleCancelEdit)
    fieldName: 'name' | 'username',
    currentValue: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    originalValue: string | null | undefined,
    intentValue: 'updateName' | 'updateUsername',
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const fieldActionData = actionData?.field === fieldName ? actionData : null;
    const isCurrentlySubmittingThisField =
      isSubmitting && submittingIntent === intentValue;

    if (editingField === fieldName) {
      return (
        <Form
          method="post"
          action="/profile"
          className="flex items-center gap-2.5 w-full"
        >
          <input type="hidden" name="intent" value={intentValue} />
          <div className="flex-grow relative">
            <Input
              ref={inputRef}
              name={`${fieldName}Value`}
              value={currentValue}
              onChange={(e) => setter(e.target.value)}
              className={`w-full bg-slate-100 dark:bg-neutral-800
                          border
                          ${
                            fieldActionData?.errors?.[fieldName]
                              ? 'border-red-400 dark:border-red-500 focus:ring-red-500/50 dark:focus:ring-red-500/50'
                              : 'border-slate-300 dark:border-neutral-700 focus:ring-blue-500/50 dark:focus:ring-blue-500/50'
                          }
                          focus:ring-2 focus:border-transparent
                          rounded-lg px-3.5 py-2.5 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
                          transition-colors duration-150 ease-in-out shadow-sm`}
              disabled={isCurrentlySubmittingThisField}
              aria-describedby={
                fieldActionData?.errors?.[fieldName]
                  ? `${fieldName}-error`
                  : undefined
              }
            />
            {fieldActionData?.errors?.[fieldName] && (
              <p
                id={`${fieldName}-error`}
                className="absolute -bottom-5 left-1 text-xs text-red-600 dark:text-red-400 pt-0.5"
              >
                {fieldActionData.errors[fieldName]}
              </p>
            )}
          </div>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-neutral-700/70 rounded-md p-2 flex-shrink-0 transition-colors"
                  disabled={isCurrentlySubmittingThisField}
                  aria-label={`Save ${fieldLabel}`}
                >
                  {isCurrentlySubmittingThisField ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <StyledTooltipContent>Save {fieldLabel}</StyledTooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleCancelEdit} // Use the correct cancel handler
                  className="text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-neutral-700/70 rounded-md p-2 flex-shrink-0 transition-colors"
                  disabled={isCurrentlySubmittingThisField}
                  aria-label="Cancel edit"
                >
                  <X className="h-5 w-5 text-red-600 dark:text-red-500" />
                </Button>
              </TooltipTrigger>
              <StyledTooltipContent>Cancel</StyledTooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Form>
      );
    }

    // const profileImageUrl = user.image?.url
    //   ? user.image.url.startsWith('/')
    //     ? `${user.image.url}?v=${new Date(user.updatedAt).getTime()}` // Use local user's updatedAt
    //     : user.image.url
    //   : null;
    // console.log(
    //   'PROFILEINDEX: Constructed profileImageUrl for Avatar:',
    //   profileImageUrl,
    //   'from user state:',
    //   user
    // );

    return (
      <div className="flex items-center justify-between w-full group min-h-[48px]">
        <span className="text-base sm:text-lg text-slate-800 dark:text-slate-100">
          {originalValue || (
            <span className="italic text-slate-500 dark:text-slate-400">
              Not set
            </span>
          )}
        </span>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(fieldName)}
                className="cursor-pointer text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400
                           hover:bg-slate-100 dark:hover:bg-neutral-800/60 rounded-md p-1.5
                           opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-150"
                aria-label={`Edit ${fieldLabel}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <StyledTooltipContent>Edit {fieldLabel}</StyledTooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 dark:bg-neutral-950 py-10 sm:py-16 px-4 font-sans antialiased">
      <div className="max-w-xl mx-auto space-y-12">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Profile Settings
          </h1>
          {/* Global success/error messages */}
          {actionData?.message && navigation.state === 'idle' && (
            <div
              className={`ml-4 p-3 text-sm rounded-lg shadow-md flex items-center space-x-2 animate-fadeIn select-none
              ${
                actionData.success
                  ? 'bg-green-500/10 dark:bg-green-600/20 text-green-700 dark:text-green-300'
                  : 'bg-red-500/10 dark:bg-red-600/20 text-red-700 dark:text-red-300'
              }`}
            >
              {actionData.success ? (
                <Check className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{actionData.message}</span>
            </div>
          )}
        </div>

        {/* Profile Image Section */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl shadow-2xl rounded-xl sm:rounded-2xl p-5 sm:p-7">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-3 select-none">
            Profile Picture
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 sm:w-28 sm:h-28 text-4xl border-2 border-white dark:border-neutral-800 shadow-lg">
                <AvatarImage
                  src={imagePreviewUrl || profileImageUrl || undefined}
                  alt="Profile"
                />
                <AvatarFallback className="bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300">
                  {imagePreviewUrl || profileImageUrl ? (
                    getInitials(user.name, user.username)
                  ) : (
                    <UserCircle className="w-12 h-12" />
                  )}
                </AvatarFallback>
              </Avatar>
              {!selectedImageFile && (
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer absolute -bottom-2 -right-2 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 border-slate-300 dark:border-neutral-600 rounded-full p-1.5 shadow-md transition-all group-hover:scale-110"
                  onClick={() => imageInputRef.current?.click()}
                  aria-label="Change profile picture"
                >
                  <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </Button>
              )}
            </div>

            <div className="flex-grow text-center sm:text-left">
              {isSubmitting && submittingIntent === 'updateProfileImage' && (
                <div className="flex items-center justify-center sm:justify-start text-sm text-blue-600 dark:text-blue-400">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading image...
                </div>
              )}
              {!selectedImageFile && !isSubmitting && (
                <Button
                  variant="outline"
                  className="cursor-pointer bg-slate-50 dark:bg-neutral-800/50 hover:bg-slate-100 dark:hover:bg-neutral-700/70 border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-200"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {user.image?.url ? 'Change Image' : 'Upload Image'}
                </Button>
              )}
              {selectedImageFile && !isSubmitting && (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    onClick={handleImageUploadSubmit}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Image
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={cancelImageUpload}
                    className="text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-neutral-700/70 w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              )}
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageFileChange}
                accept="image/png, image/jpeg, image/gif, image/webp"
                className="hidden"
                name="profileImage" // Name attribute for the form field
              />
              {actionData?.field === 'profileImage' &&
                actionData?.errors?.profileImage && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400 text-center sm:text-left">
                    {actionData.errors.profileImage}
                  </p>
                )}
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                PNG, JPG, GIF, WEBP up to 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* User Details Card */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl shadow-2xl rounded-xl sm:rounded-2xl">
          <div className="divide-y divide-slate-200/70 dark:divide-neutral-800/70">
            {/* ... (renderEditableField calls for name and username remain the same) ... */}
            {[
              {
                label: 'Full Name',
                field: 'name',
                value: user.name,
                currentValue: currentName,
                setter: setCurrentName,
                intent: 'updateName',
                ref: nameInputRef,
              },
              {
                label: 'Username',
                field: 'username',
                value: user.username,
                currentValue: currentUsername,
                setter: setCurrentUsername,
                intent: 'updateUsername',
                ref: usernameInputRef,
              },
            ].map((item) => (
              <div key={item.field} className="px-5 py-5 sm:px-7 sm:py-6">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-1.5 select-none">
                  {item.label}
                </dt>
                <dd className="mt-1">
                  {renderEditableField(
                    item.label,
                    item.field as 'name' | 'username',
                    item.currentValue,
                    item.setter,
                    item.value,
                    item.intent as 'updateName' | 'updateUsername',
                    item.ref as React.RefObject<HTMLInputElement | null>
                  )}
                </dd>
              </div>
            ))}
            {/* Email and Member Since sections */}
            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-1.5 select-none">
                Email Address
              </dt>
              <dd className="mt-1 text-base sm:text-lg text-slate-800 dark:text-slate-100 min-h-[48px] flex items-center">
                {user.email}
                <span className="ml-2 text-xs text-slate-400 dark:text-slate-500 select-none">
                  (cannot be changed)
                </span>
              </dd>
            </div>

            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-1.5 select-none">
                Member Since
              </dt>
              <dd className="mt-1 text-base sm:text-lg text-slate-800 dark:text-slate-100 min-h-[48px] flex items-center">
                {formatUserDate(user.createdAt)}
              </dd>
            </div>
          </div>
        </div>

        {/* Danger Zone remains the same */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
            Danger Zone
          </h2>
          <div className="mt-1 p-5 sm:p-6 border border-red-500/20 dark:border-red-600/30 rounded-xl sm:rounded-2xl bg-red-500/5 dark:bg-red-900/10 backdrop-blur-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-red-700 dark:text-red-300">
                  Delete Account
                </h3>
                <p className="text-sm text-red-600/90 dark:text-red-400/90 mt-1 mb-5">
                  Permanently remove your account and all associated data. This
                  action cannot be undone and is irreversible.
                </p>
              </div>
            </div>
            {actionData?.field === 'account' && actionData?.errors?.form && (
              <div className="mb-4 p-3 text-sm bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{actionData.errors.form}</span>
              </div>
            )}
            <Form method="post" action="/profile" className="flex justify-end">
              <input type="hidden" name="intent" value="deleteAccount" />
              <Button
                type="submit"
                variant="destructive"
                className="cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-medium py-2.5 px-5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
                disabled={isSubmitting && submittingIntent === 'deleteAccount'}
              >
                {isSubmitting && submittingIntent === 'deleteAccount' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />{' '}
                    Deleting...
                  </>
                ) : (
                  'Delete My Account'
                )}
              </Button>
            </Form>
          </div>
        </div>

        {/* <footer className="text-center text-xs text-slate-500 dark:text-neutral-500 py-8">
          User ID: {user.id} • Last Updated: {formatUserDate(user.updatedAt)}
        </footer> */}
      </div>
    </div>
  );
}
