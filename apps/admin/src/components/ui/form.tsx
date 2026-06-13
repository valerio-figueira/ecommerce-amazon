import * as React from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldError,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>): React.JSX.Element {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField(): {
  id: string;
  name: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  error?: FieldError;
} {
  const fieldContext = React.useContext(FormFieldContext);
  if (!fieldContext) {
    throw new Error('useFormField must be used within FormField');
  }
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  const id = fieldContext.name;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...(fieldState.error ? { error: fieldState.error } : {}),
  };
}

export function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return <div className={cn('space-y-2', className)} {...props} />;
}

export function FormLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Label>): React.JSX.Element {
  const { error, formItemId } = useFormField();
  return (
    <Label
      className={cn(error && 'text-red-600', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

export function FormControl({
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <div
      id={formItemId}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

export function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.JSX.Element | null {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message) : children;
  if (!body) return null;

  return (
    <p id={formMessageId} className={cn('text-xs text-red-600', className)} {...props}>
      {body}
    </p>
  );
}
