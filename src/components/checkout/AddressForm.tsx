/**
 * AddressForm Component
 *
 * Reusable address form fields for shipping and billing addresses.
 * Integrates with react-hook-form for validation and state management.
 */

'use client';

import {
    UseFormRegister,
    FieldErrors,
    FieldValues,
    Path,
} from 'react-hook-form';

export interface AddressFormProps<T extends FieldValues = FieldValues> {
    /**
     * react-hook-form register function
     */
    register: UseFormRegister<T>;

    /**
     * Form validation errors from react-hook-form
     */
    errors: FieldErrors<T>;

    /**
     * Field name prefix (e.g., "shippingAddress" or "billingAddress")
     */
    prefix: string;
}

/**
 * AddressForm provides standardized address input fields.
 *
 * Features:
 * - Street address (line1 and line2)
 * - City, state, ZIP code
 * - Validation error display
 * - Accessible labels and ARIA attributes
 * - Integrates with react-hook-form
 *
 * @example
 * ```tsx
 * const { register, formState: { errors } } = useForm();
 *
 * <AddressForm
 *   register={register}
 *   errors={errors}
 *   prefix="shippingAddress"
 * />
 * ```
 */
export function AddressForm<T extends FieldValues = FieldValues>({
    register,
    errors,
    prefix,
}: AddressFormProps<T>) {
    // Helper to get nested error messages
    const getError = (fieldName: string) => {
        const keys = fieldName.split('.');
        let error: FieldErrors<T> | undefined = errors;

        for (const key of keys) {
            if (!error || typeof error !== 'object') return null;
            error = error[key as keyof typeof error] as
                | FieldErrors<T>
                | undefined;
            if (!error) return null;
        }

        return (error as { message?: string })?.message;
    };

    return (
        <div className="space-y-4">
            {/* Street Address - Line 1 */}
            <div>
                <label
                    htmlFor={`${prefix}.line1`}
                    className="block text-sm font-semibold mb-1"
                >
                    Street Address *
                </label>
                <input
                    id={`${prefix}.line1`}
                    type="text"
                    {...register(`${prefix}.line1` as Path<T>)}
                    className="w-full border-2 border-black rounded px-3 py-2"
                    placeholder="123 Main Street"
                />
                {getError(`${prefix}.line1`) && (
                    <p className="text-red-600 text-sm mt-1">
                        {getError(`${prefix}.line1`)}
                    </p>
                )}
            </div>

            {/* Street Address - Line 2 (Optional) */}
            <div>
                <label
                    htmlFor={`${prefix}.line2`}
                    className="block text-sm font-semibold mb-1"
                >
                    Apartment, suite, etc. (optional)
                </label>
                <input
                    id={`${prefix}.line2`}
                    type="text"
                    {...register(`${prefix}.line2` as Path<T>)}
                    className="w-full border-2 border-black rounded px-3 py-2"
                    placeholder="Apt 4B"
                />
                {getError(`${prefix}.line2`) && (
                    <p className="text-red-600 text-sm mt-1">
                        {getError(`${prefix}.line2`)}
                    </p>
                )}
            </div>

            {/* City */}
            <div>
                <label
                    htmlFor={`${prefix}.city`}
                    className="block text-sm font-semibold mb-1"
                >
                    City *
                </label>
                <input
                    id={`${prefix}.city`}
                    type="text"
                    {...register(`${prefix}.city` as Path<T>)}
                    className="w-full border-2 border-black rounded px-3 py-2"
                    placeholder="Portland"
                />
                {getError(`${prefix}.city`) && (
                    <p className="text-red-600 text-sm mt-1">
                        {getError(`${prefix}.city`)}
                    </p>
                )}
            </div>

            {/* State and ZIP Code */}
            <div className="grid grid-cols-2 gap-4">
                {/* State */}
                <div>
                    <label
                        htmlFor={`${prefix}.state`}
                        className="block text-sm font-semibold mb-1"
                    >
                        State *
                    </label>
                    <input
                        id={`${prefix}.state`}
                        type="text"
                        {...register(`${prefix}.state` as Path<T>)}
                        className="w-full border-2 border-black rounded px-3 py-2"
                        placeholder="OR"
                        maxLength={2}
                    />
                    {getError(`${prefix}.state`) && (
                        <p className="text-red-600 text-sm mt-1">
                            {getError(`${prefix}.state`)}
                        </p>
                    )}
                </div>

                {/* ZIP Code */}
                <div>
                    <label
                        htmlFor={`${prefix}.zip`}
                        className="block text-sm font-semibold mb-1"
                    >
                        ZIP Code *
                    </label>
                    <input
                        id={`${prefix}.zip`}
                        type="text"
                        {...register(`${prefix}.zip` as Path<T>)}
                        className="w-full border-2 border-black rounded px-3 py-2"
                        placeholder="97201"
                    />
                    {getError(`${prefix}.zip`) && (
                        <p className="text-red-600 text-sm mt-1">
                            {getError(`${prefix}.zip`)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
