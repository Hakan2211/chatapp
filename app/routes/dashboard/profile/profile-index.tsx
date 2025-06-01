import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  useOutletContext,
  useActionData,
  useNavigation,
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
import { Pencil, Check, X, AlertCircle, Save, Loader2 } from 'lucide-react'; // Added Loader2
import type { ProfileActionData } from './profile'; // Assuming this is the correct path
import { formatUserDate } from '#/lib/utils';

interface ProfileOutletContext {
  user: PrismaUser;
}

type EditableField = 'name' | 'username' | null;

// Custom TooltipContent for consistent Apple-esque styling
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

export default function ProfileIndex() {
  const { user } = useOutletContext<ProfileOutletContext>();
  const actionData = useActionData<ProfileActionData>();
  const navigation = useNavigation();

  const [editingField, setEditingField] = useState<EditableField>(null);
  const [currentName, setCurrentName] = useState(user.name || '');
  const [currentUsername, setCurrentUsername] = useState(user.username || '');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = navigation.state === 'submitting';
  const submittingIntent = navigation.formData?.get('intent');

  useEffect(() => {
    if (!isSubmitting) {
      // Only update local state if not currently submitting for that field
      const wasEditingName =
        editingField === 'name' && submittingIntent === 'updateName';
      const wasEditingUsername =
        editingField === 'username' && submittingIntent === 'updateUsername';

      if (!(actionData?.success && (wasEditingName || wasEditingUsername))) {
        setCurrentName(user.name || '');
        setCurrentUsername(user.username || '');
      }
    }

    if (actionData?.success && actionData.field === editingField) {
      setEditingField(null);
    }
  }, [user, actionData, editingField, isSubmitting, submittingIntent]);

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

  const handleCancel = () => {
    setEditingField(null);
    setCurrentName(user.name || '');
    setCurrentUsername(user.username || '');
  };

  const renderEditableField = (
    fieldLabel: string,
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
                  onClick={handleCancel}
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

    return (
      <div className="flex items-center justify-between w-full group min-h-[48px]">
        {' '}
        {/* Consistent height */}
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
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 
                           hover:bg-slate-100 dark:hover:bg-neutral-800/60 rounded-md p-1.5 
                           opacity-100 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-150 cursor-pointer"
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
    <div className="w-full bg-slate-100 dark:bg-neutral-950 py-10 sm:py-16 px-4 font-sans antialiased">
      <div className="max-w-xl mx-auto space-y-12">
        {' '}
        {/* Slightly narrower for elegance */}
        <div className="flex justify-between items-start">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Profile Settings
          </h1>
          {actionData?.success &&
            actionData.message &&
            navigation.state === 'idle' && (
              <div className="ml-4 p-3 text-sm bg-green-500/10 dark:bg-green-600/20 text-green-700 dark:text-green-300 rounded-lg shadow-md flex items-center space-x-2 animate-fadeIn select-none">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span>{actionData.message}</span>
              </div>
            )}
        </div>
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl shadow-2xl rounded-xl sm:rounded-2xl">
          <div className="divide-y divide-slate-200/70 dark:divide-neutral-800/70">
            {[
              {
                label: 'Name',
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
