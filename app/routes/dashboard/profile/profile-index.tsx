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
} from '#/components/ui/tooltip'; // Shadcn Tooltip
import { Pencil, Check, X, AlertCircle, Save } from 'lucide-react';
import type { ProfileActionData } from './profile';
import { formatUserDate } from '#/lib/utils';

interface ProfileOutletContext {
  user: PrismaUser;
}

type EditableField = 'name' | 'username' | null;

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

  // Reset edit mode and local state if user data changes from loader (e.g., after successful save)
  useEffect(() => {
    setCurrentName(user.name || '');
    setCurrentUsername(user.username || '');
    // If a field was successfully updated, clear the editing state for that field
    if (actionData?.success && actionData.field === editingField) {
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

  const handleCancel = () => {
    setEditingField(null);
    // Reset to original values
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
          className="flex items-center gap-2 w-full"
        >
          {' '}
          {/* action=".." submits to parent */}
          <input type="hidden" name="intent" value={intentValue} />
          <Input
            ref={inputRef}
            name={`${fieldName}Value`} // e.g., nameValue, usernameValue
            value={currentValue}
            onChange={(e) => setter(e.target.value)}
            className={`flex-grow ${
              fieldActionData?.errors?.[fieldName] ? 'border-red-500' : ''
            }`}
            disabled={isCurrentlySubmittingThisField}
          />
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  disabled={isCurrentlySubmittingThisField}
                >
                  {isCurrentlySubmittingThisField ? (
                    <Save className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save {fieldLabel}</p>
              </TooltipContent>
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
                  disabled={isCurrentlySubmittingThisField}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cancel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {fieldActionData?.errors?.[fieldName] && (
            <p className="text-xs text-red-500 col-span-full">
              {fieldActionData.errors[fieldName]}
            </p>
          )}
        </Form>
      );
    }

    return (
      <div className="flex items-center justify-between w-full group">
        <span className="mt-1 text-lg text-gray-900">
          {originalValue || (
            <span className="italic text-gray-500">Not set</span>
          )}
        </span>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(fieldName)}
                className="focus:opacity-100"
                aria-label={`Edit ${fieldLabel}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit {fieldLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        {/* Global success message for field updates */}
        {actionData?.success &&
          actionData.message &&
          navigation.state === 'idle' && (
            <div className="ml-4 p-2 text-sm text-green-700 bg-green-100 rounded-md flex items-center">
              <Check className="h-4 w-4 mr-2" /> {actionData.message}
            </div>
          )}
      </div>

      <div className="bg-white shadow-md sm:rounded-lg p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Full name</dt>
            <dd>
              {renderEditableField(
                'Name',
                'name',
                currentName,
                setCurrentName,
                user.name,
                'updateName',
                nameInputRef
              )}
            </dd>
          </div>

          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Username</dt>
            <dd>
              {renderEditableField(
                'Username',
                'username',
                currentUsername,
                setCurrentUsername,
                user.username,
                'updateUsername',
                usernameInputRef
              )}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Email address</dt>
            <dd className="mt-1 text-lg text-gray-900">
              {user.email}{' '}
              <span className="text-xs text-gray-400">(cannot be changed)</span>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Member since</dt>
            <dd className="mt-1 text-lg text-gray-900">
              {formatUserDate(user.createdAt)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
        <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
          <p className="text-sm text-red-800 mb-3">
            Deleting your account will permanently remove all your data. This
            action cannot be undone.
          </p>
          {actionData?.field === 'account' && actionData?.errors?.form && (
            <p className="text-sm text-red-600 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" /> {actionData.errors.form}
            </p>
          )}
          <Form method="post" action="/profile">
            <input type="hidden" name="intent" value="deleteAccount" />
            <Button
              type="submit"
              variant="destructive" // Shadcn destructive variant
              disabled={isSubmitting && submittingIntent === 'deleteAccount'}
            >
              {isSubmitting && submittingIntent === 'deleteAccount'
                ? 'Deleting...'
                : 'Delete My Account'}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
